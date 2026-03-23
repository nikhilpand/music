import { useEffect, useState, useRef } from "react";
import { Lrc } from "react-lrc";
import { motion, AnimatePresence } from "motion/react";
import { X, Music2, Loader2, ChevronDown, Check, RefreshCw, Globe } from "lucide-react";
import type { Track } from "../App";

// ─── Lyrics sources ───────────────────────────────────────────────────────────
type LyricsSource = "lrclib" | "netease" | "lyrics-ovh";

interface SourceDef {
  id: LyricsSource;
  label: string;
  badge: string;
  description: string;
  synced: boolean;
}

const SOURCES: SourceDef[] = [
  { id: "lrclib",     label: "LRCLib",     badge: "Synced", description: "Open-source · best coverage",           synced: true  },
  { id: "netease",    label: "NetEase",    badge: "Synced", description: "Great for Bollywood & Hindi songs",      synced: true  },
  { id: "lyrics-ovh", label: "Lyrics.ovh", badge: "Plain",  description: "Fast fallback · plain text",            synced: false },
];

async function fetchLrclib(track: Track): Promise<string | null> {
  try {
    const p = new URLSearchParams({ track_name: track.title, artist_name: track.artist });
    if (track.album) p.set("album_name", track.album);
    if (track.duration_seconds) p.set("duration", String(track.duration_seconds));
    const r = await fetch(`https://lrclib.net/api/get?${p}`, { headers: { "Lrclib-Client": "Sukoon/1.0" } });
    if (!r.ok) return null;
    const d = await r.json();
    return d.syncedLyrics || d.plainLyrics || null;
  } catch { return null; }
}

async function fetchNetease(track: Track): Promise<string | null> {
  try {
    const q = encodeURIComponent(`${track.title} ${track.artist}`);
    const sr = await fetch(`https://music.163.com/api/search/get?s=${q}&type=1&limit=1`, { headers: { Referer: "https://music.163.com/" } });
    if (!sr.ok) return null;
    const sd = await sr.json();
    const id = sd?.result?.songs?.[0]?.id;
    if (!id) return null;
    const lr = await fetch(`https://music.163.com/api/song/lyric?id=${id}&lv=1&kv=1&tv=-1`, { headers: { Referer: "https://music.163.com/" } });
    if (!lr.ok) return null;
    const ld = await lr.json();
    return ld?.lrc?.lyric || null;
  } catch { return null; }
}

async function fetchLyricsOvh(track: Track): Promise<string | null> {
  try {
    const artist = encodeURIComponent(track.artist.split(",")[0].trim());
    const title  = encodeURIComponent(track.title.replace(/\(.*?\)/g, "").trim());
    const r = await fetch(`https://api.lyrics.ovh/v1/${artist}/${title}`);
    if (!r.ok) return null;
    const d = await r.json();
    return d.lyrics || null;
  } catch { return null; }
}

async function fetchLyrics(track: Track, source: LyricsSource): Promise<string | null> {
  if (source === "lrclib")     return fetchLrclib(track);
  if (source === "netease")    return fetchNetease(track);
  if (source === "lyrics-ovh") return fetchLyricsOvh(track);
  return null;
}

interface LyricsViewProps {
  track: Track;
  currentTime: number;
  isPlaying: boolean;
  onClose: () => void;
}

export function LyricsView({ track, currentTime, isPlaying, onClose }: LyricsViewProps) {
  const [source, setSource]         = useState<LyricsSource>("lrclib");
  const [lrc, setLrc]               = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(false); setLrc(null);
    fetchLyrics(track, source).then(r => {
      if (cancelled) return;
      r ? setLrc(r) : setError(true);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [track.videoId, source]);

  const refetch = () => {
    setLoading(true); setError(false); setLrc(null);
    fetchLyrics(track, source).then(r => { r ? setLrc(r) : setError(true); setLoading(false); });
  };

  const currentDef = SOURCES.find(s => s.id === source)!;
  const isSynced   = !!(lrc?.includes("[") && lrc?.includes("]"));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}
    >
      {/* ── Dynamic blurred background (better-lyrics style) ── */}
      <div
        className="pointer-events-none absolute inset-0 scale-125"
        style={{
          backgroundImage: `url(${track.coverSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(60px) brightness(0.28) saturate(2)",
        }}
      />
      {/* Dark gradient overlay */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.7) 100%)" }} />

      <div className="relative flex h-full flex-col">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={track.coverSrc} alt="" className="h-9 w-9 rounded-lg object-cover shadow-lg"
              onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1598969880158-b05f958203a2?w=100"; }} />
            <div>
              <p className="text-sm font-bold text-white leading-tight">{track.title}</p>
              <p className="text-xs text-white/45">{track.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Source picker */}
            <div className="relative" ref={pickerRef}>
              <button
                onClick={() => setShowPicker(p => !p)}
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white/65 backdrop-blur transition hover:bg-black/55 hover:text-white"
              >
                <Globe className="h-3 w-3" />
                <span className="font-medium">{currentDef.label}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold tracking-wide ${
                  currentDef.synced ? "bg-emerald-500/25 text-emerald-400" : "bg-white/10 text-white/40"
                }`}>{currentDef.badge}</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showPicker ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-2xl backdrop-blur-2xl"
                  >
                    <p className="px-4 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-white/25">Lyrics Source</p>
                    {SOURCES.map(s => (
                      <button key={s.id} onClick={() => { setSource(s.id); setShowPicker(false); }}
                        className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition hover:bg-white/6">
                        <div className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition ${
                          source === s.id ? "border-emerald-500 bg-emerald-500" : "border-white/25"
                        }`}>
                          {source === s.id && <Check className="h-2 w-2 text-black" strokeWidth={3.5} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-white">{s.label}</span>
                            <span className={`rounded px-1 py-0.5 text-[9px] font-bold tracking-wide ${
                              s.synced ? "bg-emerald-500/20 text-emerald-400" : "bg-white/8 text-white/35"
                            }`}>{s.badge}</span>
                          </div>
                          <p className="text-[11px] text-white/35">{s.description}</p>
                        </div>
                      </button>
                    ))}
                    <div className="border-t border-white/8 px-4 py-2">
                      <p className="text-[9px] text-white/20">Inspired by better-lyrics · boidu.dev</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={refetch} title="Retry"
              className="grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white/45 backdrop-blur transition hover:bg-black/60 hover:text-white">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white/55 backdrop-blur transition hover:bg-black/60 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main area: side-by-side (better-lyrics default layout) */}
        <div className="flex min-h-0 flex-1 gap-0">
          {/* Left: Album art + track info — hidden on small screens */}
          <div className="hidden w-[40%] max-w-[480px] shrink-0 flex-col items-center justify-center gap-6 px-10 md:flex">
            <motion.img
              key={track.videoId}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              src={track.coverSrc}
              alt=""
              className="w-full max-w-[360px] rounded-[32px] object-cover shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
              style={{ aspectRatio: "1" }}
              onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1598969880158-b05f958203a2?w=400"; }}
            />
            <div className="w-full max-w-[360px] text-center">
              <p className="text-xl font-bold text-white/95 leading-snug drop-shadow-md">{track.title}</p>
              <p className="mt-1 text-base text-white/55 drop-shadow-md">{track.artist}</p>
            </div>
          </div>

          {/* Right: Lyrics */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 md:px-8">
            {loading && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-white/35">
                <Loader2 className="h-7 w-7 animate-spin" />
                <p className="text-sm">Searching {currentDef.label}…</p>
              </div>
            )}

            {!loading && error && (
              <div className="flex h-full flex-col items-start justify-center gap-4 px-8 md:px-12">
                <Music2 className="h-8 w-8 text-white/20" />
                <div>
                  <p className="text-lg font-bold text-white/50">No lyrics found</p>
                  <p className="mt-1 text-sm text-white/30">"{track.title}" isn't available on {currentDef.label}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {SOURCES.filter(s => s.id !== source).map(s => (
                    <button key={s.id} onClick={() => setSource(s.id)}
                      className="rounded-full border border-white/15 bg-black/40 px-4 py-2 text-xs font-medium text-white/55 backdrop-blur transition hover:bg-black/55 hover:text-white">
                      Try {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!loading && lrc && isSynced && (
              <Lrc
                lrc={lrc}
                currentMillisecond={currentTime * 1000}
                lineRenderer={({ active, line }) => (
                  <div
                    style={{
                      // better-lyrics variables:
                      fontWeight: 700,
                      fontSize: "clamp(26px, 4.5vw, 3.5rem)",
                      lineHeight: 1.25,
                      padding: "0.6rem 0",
                      transformOrigin: "left center",
                      transform: active ? "scale(1)" : "scale(0.92)",
                      transition: "transform 0.4s cubic-bezier(0.1, 0.7, 0.1, 1), opacity 0.4s ease, color 0.4s ease",
                      opacity: active ? 1 : 0.25,
                      color: "#ffffff",
                      cursor: "pointer",
                      wordBreak: "break-word",
                      willChange: "transform",
                    }}
                  >
                    {line.content || "♪"}
                  </div>
                )}
                style={{
                  height: "100%",
                  overflowY: "auto",
                  padding: "40vh 4rem 50vh 2rem",
                  scrollBehavior: "smooth",
                }}
              />
            )}

            {!loading && lrc && !isSynced && (
              <div className="h-full overflow-y-auto" style={{ padding: "2rem 3rem 6rem" }}>
                {lrc.split("\n").map((line, i) => (
                  <p
                    key={`lyric-${i}`}
                    style={{
                      fontWeight: 700,
                      fontSize: "clamp(16px, 2.2vw, 2rem)",
                      lineHeight: 1.3,
                      color: "rgba(255,255,255,0.7)",
                      padding: line.trim() ? "0.3rem 0" : "0.7rem 0",
                      wordBreak: "break-word",
                    }}
                  >
                    {line || "\u00a0"}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {!loading && lrc && (
          <div className="flex items-center justify-end gap-2 px-6 py-3">
            <span className={`rounded px-2 py-1 text-[10px] font-semibold tracking-wide ${
              isSynced ? "bg-emerald-500/15 text-emerald-400" : "bg-white/6 text-white/30"
            }`}>
              {isSynced ? "✦ SYNCED" : "PLAIN"}
            </span>
            <span className="text-[11px] text-white/25">via {currentDef.label}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
