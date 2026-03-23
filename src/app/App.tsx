import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import toast, { Toaster } from "react-hot-toast";
import {
  Home, Library, Mic2, ListMusic, Heart, Sparkles, Music2,
  Download, Upload
} from "lucide-react";
import { PlayerBar } from "./components/PlayerBar";
import { SearchBar } from "./components/SearchBar";
import { HomeView } from "./components/HomeView";
import { SearchResults } from "./components/SearchResults";
import { ShayariView } from "./components/ShayariView";
import { FullPlayer } from "./components/FullPlayer";
import { LyricsView } from "./components/LyricsView";
import { MoodCanvas } from "./components/MoodCanvas";

// ─── Types ───────────────────────────────────────────────────────────────────
export type Track = {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  album?: string;
  coverSrc: string;
  duration?: string;
  duration_seconds?: number;
  audioSrc?: string;     // resolved stream URL (cached)
  lrc?: string;
};

export type RepeatMode = "off" | "all" | "one";

type View = "home" | "search" | "shayari" | "library";

const API = "http://localhost:8000";

// ─── Audio stream resolver ────────────────────────────────────────────────────
// The backend proxies audio through itself — just use it as the src directly.
export async function resolveStream(track: Track): Promise<string> {
  if (track.audioSrc) return track.audioSrc; // static src (local file)
  // Return the proxy URL — browser will stream directly from localhost:8000
  return `${API}/stream/${track.videoId}`;
}

/** Set audio src and wait until the browser can play it (or error out). */
function loadAudio(audio: HTMLAudioElement, url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const onCanPlay = () => { cleanup(); resolve(); };
    const onError   = () => { cleanup(); reject(audio.error ?? new Error("load failed")); };
    const cleanup   = () => { audio.removeEventListener("canplay", onCanPlay); audio.removeEventListener("error", onError); };
    audio.addEventListener("canplay", onCanPlay, { once: true });
    audio.addEventListener("error",   onError,   { once: true });
    audio.src = url;
    audio.load();
  });
}


// ─── Search ───────────────────────────────────────────────────────────────────
export async function searchTracks(q: string): Promise<Track[]> {
  const res = await fetch(`${API}/search?q=${encodeURIComponent(q)}&filter=songs&limit=20`);
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  return data.results as Track[];
}

export async function getSuggestions(q: string): Promise<string[]> {
  try {
    const res = await fetch(`${API}/suggestions?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    return data.suggestions || [];
  } catch { return []; }
}

// ─── Toast style ──────────────────────────────────────────────────────────────────────
const toastStyle = {
  background: "#1e1e1e",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  fontSize: "13px",
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [view, setView] = useState<View>("home");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);

  // ── Persisted state (localStorage) ──────────────────────────────────────
  const [queue, setQueue] = useState<Track[]>(() => {
    try { return JSON.parse(localStorage.getItem("sukoon_queue") || "[]"); } catch { return []; }
  });
  const [queueIndex, setQueueIndex] = useState<number>(() => {
    return Number(localStorage.getItem("sukoon_index") || 0);
  });
  const [volume, setVolume] = useState<number>(() => {
    return Number(localStorage.getItem("sukoon_volume") || 0.85);
  });
  const [repeat, setRepeat] = useState<RepeatMode>(() => {
    return (localStorage.getItem("sukoon_repeat") as RepeatMode) || "off";
  });
  const [shuffle, setShuffle] = useState<boolean>(() => {
    return localStorage.getItem("sukoon_shuffle") === "true";
  });
  const [liked, setLiked] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("sukoon_liked") || "[]")); } catch { return new Set(); }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [loadingStream, setLoadingStream] = useState(false);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [accentColor, setAccentColor] = useState("99, 60, 180"); // RGB string for CSS

  const [importText, setImportText] = useState("");

  // ── Persist to localStorage on change ────────────────────────────────────
  useEffect(() => { localStorage.setItem("sukoon_queue", JSON.stringify(queue)); }, [queue]);
  useEffect(() => { localStorage.setItem("sukoon_index", String(queueIndex)); }, [queueIndex]);
  useEffect(() => { localStorage.setItem("sukoon_volume", String(volume)); }, [volume]);
  useEffect(() => { localStorage.setItem("sukoon_repeat", repeat); }, [repeat]);
  useEffect(() => { localStorage.setItem("sukoon_shuffle", String(shuffle)); }, [shuffle]);
  useEffect(() => { localStorage.setItem("sukoon_liked", JSON.stringify([...liked])); }, [liked]);

  const currentTrack = queue[queueIndex] ?? null;

  // ── Dynamic accent color from album art ────────────────────────────────────
  useEffect(() => {
    if (!currentTrack?.coverSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentTrack.coverSrc;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 8;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, 8, 8);
        const data = ctx.getImageData(0, 0, 8, 8).data;
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i+1]; b += data[i+2]; }
        const count = data.length / 4;
        const avg = (r/count + g/count + b/count) / 3;
        const boost = 1.6;
        const cr = Math.min(255, avg + (r/count - avg) * boost);
        const cg = Math.min(255, avg + (g/count - avg) * boost);
        const cb = Math.min(255, avg + (b/count - avg) * boost);
        setAccentColor(`${Math.round(cr)}, ${Math.round(cg)}, ${Math.round(cb)}`);
      } catch {}
    };
  }, [currentTrack?.videoId]);

  // ── Core stream player ────────────────────────────────────────────────────
  const streamAndPlay = useCallback(async (track: Track, toastId: string) => {
    const audio = audioRef.current!;
    setLoadingStream(true);
    try {
      const url = await resolveStream(track);
      await loadAudio(audio, url);
      await audio.play();
      setIsPlaying(true);
      toast.success(`Now playing: ${track.title}`, { id: toastId, style: toastStyle, duration: 2000 });
    } catch (e: unknown) {
      const name = (e as Error)?.name ?? "";
      // On NotSupportedError try once more with a fresh URL fetch
      if (name === "NotSupportedError" || name === "NotAllowedError") {
        try {
          const url2 = await resolveStream(track);
          await loadAudio(audio, url2);
          await audio.play();
          setIsPlaying(true);
          toast.success(`Now playing: ${track.title}`, { id: toastId, style: toastStyle, duration: 2000 });
          return;
        } catch {}
      }
      console.error("Playback error:", e);
      toast.error("Can't stream this track — try another.", { id: toastId, style: toastStyle });
    } finally {
      setLoadingStream(false);
    }
  }, []);

  // ── Load & play a track ──────────────────────────────────────────────────
  const playTrack = useCallback(async (track: Track, newQueue?: Track[], idx?: number) => {
    if (newQueue) {
      setQueue(newQueue);
      setQueueIndex(idx ?? 0);
    } else if (!queue.find(t => t.id === track.id)) {
      setQueue(prev => [...prev, track]);
      setQueueIndex(queue.length);
    }
    const toastId = toast.loading(`Loading ${track.title}...`, { style: toastStyle });
    await streamAndPlay(track, toastId);
  }, [queue, streamAndPlay]);

  const playIndex = useCallback(async (idx: number) => {
    if (idx < 0 || idx >= queue.length) return;
    setQueueIndex(idx);
    const track = queue[idx];
    const toastId = toast.loading(`Loading ${track.title}...`, { style: toastStyle });
    await streamAndPlay(track, toastId);
  }, [queue, streamAndPlay]);

  const handleNext = useCallback(() => {
    if (!queue.length) return;
    if (shuffle) {
      let next = queueIndex;
      while (next === queueIndex && queue.length > 1) next = Math.floor(Math.random() * queue.length);
      playIndex(next);
    } else if (queueIndex < queue.length - 1) {
      playIndex(queueIndex + 1);
    } else if (repeat === "all") {
      playIndex(0);
    } else {
      setIsPlaying(false);
    }
  }, [queue, queueIndex, shuffle, repeat, playIndex]);

  const handlePrev = useCallback(() => {
    if (currentTime > 3) { audioRef.current!.currentTime = 0; return; }
    if (queueIndex > 0) playIndex(queueIndex - 1);
    else if (repeat === "all") playIndex(queue.length - 1);
  }, [currentTime, queueIndex, queue, repeat, playIndex]);

  // ── Audio events ─────────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current!;
    const onTime   = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration);
    const onEnded  = () => {
      if (repeat === "one") { audio.currentTime = 0; audio.play(); }
      else handleNext();
    };
    const onError  = () => {
      // Only auto-skip if a song is actively playing (not during initial load)
      // loadAudio() has its own error handler during the loading phase
      if (audio.src && audio.src !== window.location.href && isPlaying) {
        toast.error("Stream lost — skipping…", { style: toastStyle, duration: 2000 });
        handleNext();
      }
    };
    audio.addEventListener("timeupdate",    onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended",          onEnded);
    audio.addEventListener("error",          onError);
    return () => {
      audio.removeEventListener("timeupdate",    onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended",          onEnded);
      audio.removeEventListener("error",          onError);
    };
  }, [repeat, handleNext]);


  useEffect(() => { if (audioRef.current) audioRef.current.volume = muted ? 0 : volume; }, [volume, muted]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current!;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { await audio.play(); setIsPlaying(true); }
  }, [isPlaying]);

  // ── Search ───────────────────────────────────────────────────────────────
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setView("search");
    setSearching(true);
    try {
      const results = await searchTracks(q);
      setSearchResults(results);
      if (results.length === 0) toast("No results found", { icon: "🔍", style: toastStyle });
    } catch (e) {
      console.error(e);
      setSearchResults([]);
      toast.error("Backend offline — start the Python server on port 8000", { style: toastStyle, duration: 5000 });
    } finally {
      setSearching(false);
    }
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (["INPUT", "TEXTAREA"].includes(tag)) return;
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      else if (e.shiftKey && e.key === "ArrowRight") handleNext();
      else if (e.shiftKey && e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, handleNext, handlePrev]);

  const navItems: { id: View; icon: React.ReactNode; label: string }[] = [
    { id: "home", icon: <Home className="h-5 w-5" />, label: "Home" },
    { id: "shayari", icon: <Sparkles className="h-5 w-5" />, label: "Shayari" },
    { id: "library", icon: <Library className="h-5 w-5" />, label: "Library" },
  ];

  return (
    <div
      className="flex h-screen flex-col overflow-hidden text-white"
      style={{
        fontFamily: "'Outfit', 'Inter', sans-serif",
        // @ts-ignore
        "--accent": accentColor,
        background: "transparent",
      } as React.CSSProperties}
    >
      {/* ── Mood-Reactive Canvas Background ── */}
      <MoodCanvas track={currentTrack ?? null} />

      <audio ref={audioRef} preload="metadata" />
      <Toaster position="bottom-center" />

      {/* ── Top Bar ── */}
      <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/8 bg-[#0f0f0f]/95 px-4 backdrop-blur-xl sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5 min-w-[140px]">
          <div className="grid h-9 w-9 place-items-center rounded-xl ring-1 transition-all duration-700" style={{ background: `rgba(${accentColor}, 0.15)`, boxShadow: `0 0 16px rgba(${accentColor}, 0.25)`, outline: `1px solid rgba(${accentColor}, 0.3)` }}>
            <Music2 className="h-4.5 w-4.5" style={{ color: `rgb(${accentColor})` }} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Sukoon</span>
        </div>

        {/* Search bar */}
        <div className="flex flex-1 justify-center">
          <SearchBar onSearch={doSearch} onSuggestionsFetch={getSuggestions} currentQuery={query} />
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {navItems.map(n => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-all ${
                view === n.id
                  ? "bg-white/12 text-white"
                  : "text-white/55 hover:text-white/80 hover:bg-white/6"
              }`}
            >
              {n.icon}
              <span className="hidden sm:inline">{n.label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {view === "home" && (
            <HomeView
              key="home"
              onPlay={playTrack}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onSearch={doSearch}
            />
          )}
          {view === "search" && (
            <SearchResults
              key="search"
              results={searchResults}
              searching={searching}
              query={query}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              liked={liked}
              onPlay={(track) => {
                playTrack(track, searchResults, searchResults.indexOf(track));
              }}
              onLike={(id) => setLiked(prev => {
                const next = new Set(prev);
                next.has(id) ? next.delete(id) : next.add(id);
                return next;
              })}
            />
          )}
          {view === "shayari" && <ShayariView key="shayari" />}
          {view === "library" && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <h2 className="mb-6 text-2xl font-bold">Your Library</h2>

              {/* Import section */}
              <div className="mb-6 rounded-2xl border border-white/8 bg-white/4 p-5">
                <p className="mb-1 text-sm font-medium text-white/80">Import Playlist from Link</p>
                <p className="mb-3 text-xs text-white/45">Paste any YouTube Music or YouTube playlist URL</p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={importText}
                    onChange={e => setImportText(e.target.value)}
                    placeholder="https://music.youtube.com/playlist?list=... or youtube.com/playlist?list=..."
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-white/20"
                    onKeyDown={e => e.key === "Enter" && importText.trim() && (async () => {
                      const btn = e.currentTarget.nextElementSibling as HTMLButtonElement | null;
                      btn?.click();
                    })()}
                  />
                  <button
                    disabled={!importText.trim()}
                    onClick={async () => {
                      if (!importText.trim()) return;
                      const toastId = toast.loading("Importing playlist...", { style: toastStyle });
                      try {
                        const res = await fetch(`${API}/playlist?url=${encodeURIComponent(importText.trim())}`);
                        if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Import failed"); }
                        const data = await res.json();
                        const tracks: Track[] = data.tracks;
                        setQueue(prev => { const ids = new Set(prev.map(t => t.videoId)); return [...prev, ...tracks.filter(t => !ids.has(t.videoId))]; });
                        setImportText("");
                        toast.success(`Added ${tracks.length} tracks from "${data.title}"`, { id: toastId, style: toastStyle, duration: 4000 });
                      } catch (err: unknown) {
                        const msg = err instanceof Error ? err.message : "Import failed";
                        toast.error(msg, { id: toastId, style: toastStyle });
                      }
                    }}
                    className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Upload className="mr-1.5 inline h-3.5 w-3.5" /> Import
                  </button>
                </div>
                <p className="mt-2 text-xs text-white/25">Works with public playlists · Duplicates are skipped</p>
              </div>
              {/* Export section */}
              <div className="mb-6 rounded-2xl border border-white/8 bg-white/4 p-5">
                <p className="mb-1 text-sm font-medium text-white/80">Export Queue</p>
                <p className="mb-3 text-xs text-white/45">Download your current queue as JSON</p>
                <button
                  onClick={() => {
                    const data = JSON.stringify(queue, null, 2);
                    const a = document.createElement("a");
                    a.href = "data:application/json;charset=utf-8," + encodeURIComponent(data);
                    a.download = "sukoon-playlist.json";
                    a.click();
                  }}
                  className="rounded-xl border border-white/10 bg-white/6 px-5 py-2.5 text-sm text-white/80 transition hover:bg-white/10"
                >
                  <Download className="mr-1.5 inline h-3.5 w-3.5" /> Export Queue ({queue.length} tracks)
                </button>
              </div>

              {/* Queue */}
              {queue.length > 0 && (
                <div>
                  <h3 className="mb-3 text-base font-semibold text-white/70">Current Queue ({queue.length})</h3>
                  <div className="space-y-2">
                    {queue.map((t, i) => (
                      <button
                        key={`${t.id}-${i}`}
                        onClick={() => playIndex(i)}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition ${
                          i === queueIndex
                            ? "border-white/15 bg-white/10"
                            : "border-white/5 bg-white/[0.02] hover:bg-white/6"
                        }`}
                      >
                        <img src={t.coverSrc} alt="" className="h-11 w-11 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{t.title}</p>
                          <p className="truncate text-xs text-white/50">{t.artist}</p>
                        </div>
                        {i === queueIndex && isPlaying && <div className="flex gap-0.5">{[1,2,3].map(b => <span key={b} className="inline-block w-0.5 animate-bounce rounded-full bg-red-400" style={{ height: `${8 + b * 4}px`, animationDelay: `${b * 0.15}s` }} />)}</div>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {queue.length === 0 && (
                <div className="flex flex-col items-center py-16 text-center text-white/40">
                  <ListMusic className="mb-3 h-12 w-12" />
                  <p className="text-sm">Your queue is empty. Search for songs to add them.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Bottom Player ── */}
      {currentTrack && (
        <PlayerBar
          track={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          muted={muted}
          repeat={repeat}
          shuffle={shuffle}
          loading={loadingStream}
          liked={liked.has(currentTrack.id)}
          onTogglePlay={togglePlay}
          onNext={handleNext}
          onPrev={handlePrev}
          onSeek={t => { if (audioRef.current) { audioRef.current.currentTime = t; setCurrentTime(t); } }}
          onVolume={setVolume}
          onMute={() => setMuted(m => !m)}
          onRepeat={() => setRepeat(r => r === "off" ? "all" : r === "all" ? "one" : "off")}
          onShuffle={() => setShuffle(s => !s)}
          onLike={() => setLiked(prev => {
            const n = new Set(prev);
            const wasLiked = n.has(currentTrack.id);
            wasLiked ? n.delete(currentTrack.id) : n.add(currentTrack.id);
            toast(wasLiked ? "Removed from liked" : `❤️ Liked: ${currentTrack.title}`, { style: toastStyle, duration: 2000 });
            return n;
          })}
          onExpand={() => setShowFullPlayer(true)}
          lyricsActive={showLyrics}
          onLyrics={() => setShowLyrics(l => !l)}
        />
      )}

      {/* ── Lyrics Overlay ── */}
      <AnimatePresence>
        {showLyrics && currentTrack && (
          <LyricsView
            key="lyrics-overlay"
            track={currentTrack}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onClose={() => setShowLyrics(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Full Player Overlay ── */}
      <AnimatePresence>
        {showFullPlayer && currentTrack && (
          <FullPlayer
            track={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            muted={muted}
            repeat={repeat}
            shuffle={shuffle}
            loading={loadingStream}
            liked={liked.has(currentTrack.id)}
            onTogglePlay={togglePlay}
            onNext={handleNext}
            onPrev={handlePrev}
            onSeek={t => { if (audioRef.current) { audioRef.current.currentTime = t; setCurrentTime(t); } }}
            onVolume={setVolume}
            onMute={() => setMuted(m => !m)}
            onRepeat={() => setRepeat(r => r === "off" ? "all" : r === "all" ? "one" : "off")}
            onShuffle={() => setShuffle(s => !s)}
            onLike={() => setLiked(prev => { const n = new Set(prev); n.has(currentTrack.id) ? n.delete(currentTrack.id) : n.add(currentTrack.id); return n; })}
            onClose={() => setShowFullPlayer(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}