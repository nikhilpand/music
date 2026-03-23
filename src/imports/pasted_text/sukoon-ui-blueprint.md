# Sukoon — YT Music–style UI Blueprint

## Product concept

A single-page emotional music web app with a top segmented switch between **Shayari** and **Music**, styled like a clean, immersive YT Music experience.

---

## 1) Information architecture

### Global shell

* **Top app bar**

  * Logo / app name: `Sukoon`
  * Segmented control: `Shayari | Music`
  * Theme / settings button
* **Main stage**

  * Only one primary view visible at a time
* **Persistent mini player**

  * Visible whenever a track is loaded
  * Tap/click expands to fullscreen player

### Views

1. **Shayari view**
2. **Music compact view**
3. **Music expanded player**
4. **Fullscreen lyrics view**
5. **Queue sheet / drawer**

---

## 2) Pixel-level layout map

### Desktop shell

* Max content width: `1440px`
* App padding: `24px`
* Main stage min-height: `calc(100vh - 88px)`
* Corner radius for primary cards: `28px`

### Top app bar

* Height: `72px`
* Horizontal padding: `20px`
* Left: logo text `Sukoon`
* Center/right: segmented control
* Right: icon buttons

### Segmented control

* Container height: `48px`
* Horizontal padding: `6px`
* Radius: `999px`
* Tab button min width: `132px`
* Active pill inset: `4px`
* Motion: spring slide between tabs

### Main stage card

* Width: `100%`
* Min height: `78vh`
* Radius: `32px`
* Background: translucent dark surface with strong blur
* Inner padding desktop: `32px`
* Inner padding mobile: `16px`

---

## 3) Shayari view map

### Layout

* Centered vertical stack
* Content max width: `840px`
* Title label top: `Aaj ka ehsaas`
* Quote block centered in stage

### Typography

* Main quote font size desktop: `clamp(28px, 4vw, 54px)`
* Main quote line-height: `1.18`
* Quote letter spacing: `-0.02em`
* Secondary meta text: `14px`

### Quote card spacing

* Gap between lines: `10px`
* Card padding: `36px`
* Controls gap: `14px`

### Controls

* Prev quote
* Voice / TTS
* Next quote
* Favorite

### Motion

* Each line enters with:

  * opacity `0 -> 1`
  * y `18 -> 0`
  * stagger `0.18s`
* Background blobs drift slowly
* Optional shimmer behind important words

---

## 4) Music compact view map

### Layout

Top to bottom:

1. Cover art block
2. Song title + artist
3. Progress rail
4. Transport controls
5. Secondary actions

### Cover art

* Desktop size: `min(42vw, 420px)` square
* Mobile size: `min(78vw, 340px)` square
* Radius: `24px`
* Shadow: soft, large

### Title block

* Title: `28px desktop / 20px mobile`
* Artist: `16px desktop / 14px mobile`
* Gap from cover: `24px`

### Progress area

* Time labels: `12px`
* Bar height: `5px`
* Hit area height: `20px`
* Margin above controls: `18px`

### Controls

* Prev / Play / Next
* Central play button size: `68px`
* Side buttons size: `48px`
* Secondary row: shuffle, repeat, lyrics, queue

---

## 5) Expanded player + fullscreen lyrics map

### Visual hierarchy

1. Background image layer
2. Dark gradient overlay
3. Lyrics column
4. Bottom transport controls
5. Top dismiss / song info

### Background system

* Layer 1: current album art fullscreen
* Scale: `1.14`
* Blur: `36px to 48px`
* Saturation boost: `1.1`
* Brightness reduce: `0.55`
* Layer 2: top-to-bottom dark gradient overlay
* Layer 3: subtle radial glow using extracted cover colors

### Lyrics column

* Max width desktop: `860px`
* Max width mobile: `92vw`
* Top offset: `14vh`
* Bottom reserved for controls: `148px`
* Active line centered in viewport

### Lyric line styles

* Inactive line font size: `clamp(20px, 2.6vw, 30px)`
* Active line font size: `clamp(28px, 3.6vw, 42px)`
* Line gap: `18px`
* Inactive opacity: `0.38`
* Near-active opacity: `0.65`
* Active opacity: `1`
* Active weight: `700`

### Lyrics interactions

* Auto-scroll smooth
* Click line → seek to timestamp
* Hover/tap line brightens
* Optional translated line below primary line in smaller size

### Bottom transport in fullscreen

* Progress rail full width but capped to `780px`
* Row below:

  * shuffle
  * prev
  * play/pause
  * next
  * repeat
* Below/alongside: toggle `Lyrics | Queue`

### Top overlay bar in fullscreen

* Left: collapse button
* Center: song title / artist
* Right: more options

---

## 6) Queue sheet map

### Desktop

* Right-side floating panel
* Width: `360px`
* Height: `min(72vh, 760px)`
* Radius: `26px`

### Mobile

* Bottom sheet
* Height: `68vh`
* Top radius: `28px`

### Queue row

* Row height: `68px`
* Cover thumb: `48px`
* Title: `15px`
* Artist: `13px`
* Active row: brighter surface + tiny equalizer bars

---

## 7) Navigation behavior map (YT Music–style)

### Main behavior

* Tap mini player → expand compact player
* Tap lyrics button → fullscreen lyrics
* Swipe down in fullscreen → collapse
* Swipe left/right in fullscreen → next/prev song
* Click queue button → open queue sheet

### Previous button logic

* If current time > 3 seconds: restart track
* Else: previous track

### Repeat states

* `off`
* `all`
* `one`

### Shuffle behavior

* Prevent immediate repetition from recent history window

### Keyboard shortcuts desktop

* Space: play/pause
* ArrowRight: seek +5s
* ArrowLeft: seek -5s
* Shift+ArrowRight: next song
* Shift+ArrowLeft: previous song
* L: toggle lyrics
* Q: toggle queue

---

## 8) Color and style tokens

### Default theme: Midnight Bloom

* Background base: `#09090b`
* Surface: `rgba(255,255,255,0.08)`
* Surface strong: `rgba(255,255,255,0.12)`
* Border: `rgba(255,255,255,0.10)`
* Text primary: `rgba(255,255,255,0.96)`
* Text secondary: `rgba(255,255,255,0.66)`
* Accent 1: `#8b5cf6`
* Accent 2: `#ec4899`
* Accent 3: `#60a5fa`

### Surfaces

* Glass blur: `backdrop-filter: blur(22px)`
* Strong shadow: `0 20px 80px rgba(0,0,0,0.45)`

### Radius scale

* sm: `14px`
* md: `20px`
* lg: `28px`
* xl: `32px`
* pill: `999px`

---

## 9) Exact component list

### App shell

* `AppShell`
* `TopBar`
* `SegmentedTabs`
* `MiniPlayer`

### Shayari

* `ShayariView`
* `AnimatedQuote`
* `QuoteControls`
* `VoiceButton`

### Music

* `MusicView`
* `CoverArt`
* `TrackMeta`
* `ProgressBar`
* `TransportControls`
* `SecondaryActions`
* `PlaylistDrawer`

### Lyrics

* `FullscreenLyrics`
* `LyricsBackdrop`
* `LyricsScroller`
* `LyricsLine`
* `QueueSheet`

### Logic / hooks

* `useAudioPlayer`
* `useLyrics`
* `usePalette`
* `useMediaSession`
* `useKeyboardShortcuts`

---

## 10) Data model

```ts
export type Track = {
  id: string;
  title: string;
  artist: string;
  audioSrc: string;
  coverSrc: string;
  lrcSrc?: string;
  duration?: number;
};

export type LyricLine = {
  time: number;
  text: string;
  translated?: string;
};

export type Quote = {
  id: string;
  lines: string[];
  voiceSrc?: string;
};
```

---

## 11) Integration plan for lyrics sources

### Priority order

1. Local `.lrc`
2. LRCLIB fetch fallback
3. Cached lyrics from local storage / IndexedDB
4. Optional translated lyrics layer

### Required lyric features

* Parse timestamps
* Determine active line from current playback time
* Smooth center-scroll
* Jump to clicked line
* Offset correction setting per track

---

## 12) Delivery phases

### Phase 1

* Single-page app shell
* Shayari tab
* Music tab
* Local audio playback
* Mini player

### Phase 2

* Local `.lrc` parsing
* Synced lyrics
* Queue
* Fullscreen lyrics

### Phase 3

* LRCLIB fallback
* Palette-extracted backdrop
* Keyboard shortcuts
* Mobile gestures

### Phase 4

* Translation support
* PWA
* Theme variants
* Saved favorites

```tsx
// app/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, Mic2, Moon, Music2, Pause, Play, Repeat, Shuffle, Sparkles, Volume2, X, ListMusic, Maximize2, Minimize2 } from "lucide-react";

// ---------------------------
// Types
// ---------------------------
type Quote = {
  id: string;
  lines: string[];
};

type Track = {
  id: string;
  title: string;
  artist: string;
  audioSrc: string;
  coverSrc: string;
  lrc: string;
};

type LyricLine = {
  time: number;
  text: string;
};

type RepeatMode = "off" | "all" | "one";

type TabMode = "shayari" | "music";

// ---------------------------
// Demo data
// Replace with your own files
// ---------------------------
const QUOTES: Quote[] = [
  {
    id: "q1",
    lines: [
      "Tum yaad aate ho toh waqt thahar sa jaata hai,",
      "Dil ki har dhadkan mein ek nasha sa chha jaata hai,",
      "Khamoshi bhi phir geet si lagti hai,",
      "Aur har andhera roshni mein dhal jaata hai.",
    ],
  },
  {
    id: "q2",
    lines: [
      "Raat ne phir tere naam ki chaadar odh li,",
      "Chaand ne chupke se teri baat chhed di,",
      "Hum muskura diye bas itna sa hua,",
      "Ek purani yaad ne phir dastak de di.",
    ],
  },
  {
    id: "q3",
    lines: [
      "Jo alfaaz na keh paaye, unhe hawa likh jaati hai,",
      "Jo ehsaas chhup jaaye, unhe aankhen padh jaati hain,",
      "Mohabbat ka raasta ajeeb zaroor hai,",
      "Par ismein kho kar hi rooh ghar paati hai.",
    ],
  },
];

const TRACKS: Track[] = [
  {
    id: "t1",
    title: "Midnight Echo",
    artist: "Sukoon Session",
    audioSrc: "/songs/song1.mp3",
    coverSrc: "/covers/cover1.jpg",
    lrc: `[00:00.00]Midnight Echo\n[00:06.00]The city sleeps under a violet sky\n[00:12.00]And all my thoughts begin to fly\n[00:18.00]You are the line I hum tonight\n[00:24.00]Soft as rain and full of light\n[00:30.00]Hold this moment, don’t let go\n[00:36.00]In your silence, I still glow`,
  },
  {
    id: "t2",
    title: "Rain Letters",
    artist: "Sukoon Session",
    audioSrc: "/songs/song2.mp3",
    coverSrc: "/covers/cover2.jpg",
    lrc: `[00:00.00]Rain Letters\n[00:05.50]Drops keep writing on the glass\n[00:11.80]Every memory returns and passes\n[00:17.50]Your name lingers in the air\n[00:23.40]Like a prayer I always wear\n[00:29.00]Stay a little, breathe it slow\n[00:35.00]Let the quiet overflow`,
  },
];

// ---------------------------
// Utilities
// ---------------------------
function parseLrc(lrc: string): LyricLine[] {
  return lrc
    .split("\n")
    .map((line) => {
      const match = line.match(/^\[(\d{2}):(\d{2}(?:\.\d{1,2})?)\](.*)$/);
      if (!match) return null;
      const min = Number(match[1]);
      const sec = Number(match[2]);
      const text = match[3].trim();
      return { time: min * 60 + sec, text } as LyricLine;
    })
    .filter(Boolean) as LyricLine[];
}

function formatTime(sec: number) {
  if (!Number.isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// ---------------------------
// Main page
// ---------------------------
export default function Page() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const activeLyricRef = useRef<HTMLButtonElement | null>(null);

  const [tab, setTab] = useState<TabMode>("shayari");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [shuffle, setShuffle] = useState(false);
  const [likedQuotes, setLikedQuotes] = useState<string[]>([]);
  const [themeDark, setThemeDark] = useState(true);

  const currentTrack = TRACKS[trackIndex];
  const lyrics = useMemo(() => parseLrc(currentTrack.lrc), [currentTrack]);

  const activeLyricIndex = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) idx = i;
      else break;
    }
    return idx;
  }, [currentTime, lyrics]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => setDuration(audio.duration || 0);
    const onTime = () => setCurrentTime(audio.currentTime || 0);
    const onEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
        return;
      }
      handleNext();
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, [trackIndex, repeatMode]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, trackIndex]);

  useEffect(() => {
    if (!isLyricsOpen || !activeLyricRef.current) return;
    activeLyricRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeLyricIndex, isLyricsOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping = target && ["INPUT", "TEXTAREA"].includes(target.tagName);
      if (isTyping) return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === "l" || e.key === "L") {
        setIsLyricsOpen((v) => !v);
      } else if (e.key === "q" || e.key === "Q") {
        setIsQueueOpen((v) => !v);
      } else if (e.shiftKey && e.key === "ArrowRight") {
        handleNext();
      } else if (e.shiftKey && e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        seekTo(Math.min(currentTime + 5, duration));
      } else if (e.key === "ArrowLeft") {
        seekTo(Math.max(currentTime - 5, 0));
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentTime, duration]);

  const toggleLikeQuote = () => {
    const id = QUOTES[quoteIndex].id;
    setLikedQuotes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const speakQuote = () => {
    const text = QUOTES[quoteIndex].lines.join(" ");
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.lang = "hi-IN";
      window.speechSynthesis.speak(utterance);
    }
  };

  const playTrack = (index: number) => {
    setTrackIndex(index);
    setIsPlaying(true);
    setTab("music");
  };

  const handleNext = () => {
    if (shuffle && TRACKS.length > 1) {
      let next = trackIndex;
      while (next === trackIndex) {
        next = Math.floor(Math.random() * TRACKS.length);
      }
      setTrackIndex(next);
      setIsPlaying(true);
      return;
    }

    if (trackIndex === TRACKS.length - 1) {
      if (repeatMode === "all") {
        setTrackIndex(0);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
        seekTo(0);
      }
      return;
    }

    setTrackIndex((i) => i + 1);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if ((audioRef.current?.currentTime || 0) > 3) {
      seekTo(0);
      return;
    }
    if (trackIndex === 0) {
      if (repeatMode === "all") {
        setTrackIndex(TRACKS.length - 1);
        setIsPlaying(true);
      } else {
        seekTo(0);
      }
      return;
    }
    setTrackIndex((i) => i - 1);
    setIsPlaying(true);
  };

  const seekTo = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const quote = QUOTES[quoteIndex];
  const quoteLiked = likedQuotes.includes(quote.id);

  return (
    <div className={cn(themeDark ? "dark" : "", "min-h-screen bg-zinc-950 text-white")}>
      <audio ref={audioRef} src={currentTrack.audioSrc} preload="metadata" />

      <div className="relative overflow-hidden min-h-screen bg-[radial-gradient(circle_at_top,#312e81_0%,#09090b_38%,#050507_100%)]">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        </div>

        <main className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-28 pt-4 sm:px-6 lg:px-8">
          <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between rounded-[28px] border border-white/10 bg-white/5 px-4 backdrop-blur-2xl sm:px-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[15px] font-semibold tracking-wide">Sukoon</p>
                <p className="text-xs text-white/55">YT Music–inspired mood player</p>
              </div>
            </div>

            <div className="relative flex h-12 items-center rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
                className={cn(
                  "absolute top-1 h-10 rounded-full bg-white/14 shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
                  tab === "shayari" ? "left-1 w-[120px]" : "left-[125px] w-[110px]"
                )}
              />
              <button
                onClick={() => setTab("shayari")}
                className={cn("relative z-10 h-10 w-[120px] rounded-full text-sm font-medium transition", tab === "shayari" ? "text-white" : "text-white/65")}
              >
                Shayari
              </button>
              <button
                onClick={() => setTab("music")}
                className={cn("relative z-10 h-10 w-[110px] rounded-full text-sm font-medium transition", tab === "music" ? "text-white" : "text-white/65")}
              >
                Music
              </button>
            </div>

            <button
              onClick={() => setThemeDark((v) => !v)}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white/80 backdrop-blur-xl transition hover:bg-white/10"
              aria-label="Toggle theme"
            >
              <Moon className="h-5 w-5" />
            </button>
          </header>

          <section className="mt-4 flex-1 rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              {tab === "shayari" ? (
                <motion.div
                  key="shayari"
                  initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
                  transition={{ duration: 0.35 }}
                  className="flex min-h-[72vh] flex-col items-center justify-center"
                >
                  <div className="mb-6 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs tracking-[0.24em] text-white/60 uppercase">
                    Aaj ka ehsaas
                  </div>

                  <div className="mx-auto flex max-w-4xl flex-col items-center px-2 text-center">
                    {quote.lines.map((line, index) => (
                      <motion.p
                        key={`${quote.id}-${index}`}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.18, duration: 0.45 }}
                        className="mb-3 text-balance text-[clamp(28px,4vw,54px)] font-semibold leading-[1.18] tracking-[-0.02em] text-white/95"
                      >
                        {line}
                      </motion.p>
                    ))}
                  </div>

                  <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => setQuoteIndex((i) => (i - 1 + QUOTES.length) % QUOTES.length)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-5 py-3 text-sm text-white/85 transition hover:bg-white/12"
                    >
                      <ChevronLeft className="h-4 w-4" /> Prev
                    </button>
                    <button
                      onClick={toggleLikeQuote}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-5 py-3 text-sm text-white/85 transition hover:bg-white/12"
                    >
                      <Heart className={cn("h-4 w-4", quoteLiked && "fill-white text-white")} />
                      Like
                    </button>
                    <button
                      onClick={speakQuote}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-5 py-3 text-sm text-white/85 transition hover:bg-white/12"
                    >
                      <Mic2 className="h-4 w-4" /> Voice
                    </button>
                    <button
                      onClick={() => setQuoteIndex((i) => (i + 1) % QUOTES.length)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-5 py-3 text-sm text-white/85 transition hover:bg-white/12"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="music"
                  initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
                  transition={{ duration: 0.35 }}
                  className="grid min-h-[72vh] grid-cols-1 gap-8 lg:grid-cols-[minmax(320px,460px)_1fr]"
                >
                  <div className="flex flex-col items-center lg:items-start">
                    <div className="relative aspect-square w-full max-w-[420px] overflow-hidden rounded-[24px] border border-white/10 bg-white/5 shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
                      <img src={currentTrack.coverSrc} alt={currentTrack.title} className="h-full w-full object-cover" />
                    </div>

                    <div className="mt-6 w-full max-w-[420px]">
                      <h2 className="text-2xl font-semibold sm:text-[28px]">{currentTrack.title}</h2>
                      <p className="mt-1 text-sm text-white/65 sm:text-base">{currentTrack.artist}</p>

                      <div className="mt-5">
                        <input
                          type="range"
                          min={0}
                          max={duration || 0}
                          step={0.1}
                          value={currentTime}
                          onChange={(e) => seekTo(Number(e.target.value))}
                          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-white"
                        />
                        <div className="mt-2 flex items-center justify-between text-xs text-white/55">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-center gap-3 sm:justify-start">
                        <button onClick={() => setShuffle((v) => !v)} className={cn("grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/6 transition", shuffle ? "text-white" : "text-white/60")}>
                          <Shuffle className="h-4 w-4" />
                        </button>
                        <button onClick={handlePrev} className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/6 text-white/80 transition hover:bg-white/12">
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button onClick={() => setIsPlaying((p) => !p)} className="grid h-16 w-16 place-items-center rounded-full bg-white text-black shadow-[0_12px_40px_rgba(255,255,255,0.18)] transition hover:scale-[1.02]">
                          {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="ml-1 h-7 w-7" />}
                        </button>
                        <button onClick={handleNext} className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/6 text-white/80 transition hover:bg-white/12">
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"))
                          }
                          className={cn("grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/6 transition", repeatMode !== "off" ? "text-white" : "text-white/60")}
                        >
                          <Repeat className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <button onClick={() => setIsLyricsOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2.5 text-sm text-white/85 transition hover:bg-white/12">
                          <Music2 className="h-4 w-4" /> Lyrics
                        </button>
                        <button onClick={() => setIsQueueOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2.5 text-sm text-white/85 transition hover:bg-white/12">
                          <ListMusic className="h-4 w-4" /> Queue
                        </button>
                        <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2.5 text-sm text-white/85 transition hover:bg-white/12">
                          <Volume2 className="h-4 w-4" /> Volume
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-white/4 p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/85">Up next</p>
                        <p className="text-xs text-white/50">YT Music–style queue mapping</p>
                      </div>
                      <button onClick={() => setIsQueueOpen(true)} className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs text-white/75 transition hover:bg-white/12">
                        Open queue
                      </button>
                    </div>

                    <div className="space-y-2">
                      {TRACKS.map((track, index) => {
                        const active = index === trackIndex;
                        return (
                          <button
                            key={track.id}
                            onClick={() => playTrack(index)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-[20px] border px-3 py-3 text-left transition",
                              active
                                ? "border-white/15 bg-white/12"
                                : "border-white/5 bg-white/[0.03] hover:bg-white/[0.06]"
                            )}
                          >
                            <img src={track.coverSrc} alt={track.title} className="h-14 w-14 rounded-2xl object-cover" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-white/92">{track.title}</p>
                              <p className="truncate text-xs text-white/55">{track.artist}</p>
                            </div>
                            {active && <div className="h-2 w-2 rounded-full bg-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </main>

        <AnimatePresence>
          {isLyricsOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
            >
              <div
                className="absolute inset-0 scale-110 bg-cover bg-center blur-[42px]"
                style={{ backgroundImage: `url(${currentTrack.coverSrc})` }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.42),rgba(0,0,0,0.76))]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_40%)]" />

              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between px-4 py-4 sm:px-6">
                  <button onClick={() => setIsLyricsOpen(false)} className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/8 text-white/80 backdrop-blur-xl transition hover:bg-white/12">
                    <Minimize2 className="h-5 w-5" />
                  </button>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white/92">{currentTrack.title}</p>
                    <p className="text-xs text-white/60">{currentTrack.artist}</p>
                  </div>
                  <button onClick={() => setIsQueueOpen(true)} className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/8 text-white/80 backdrop-blur-xl transition hover:bg-white/12">
                    <ListMusic className="h-5 w-5" />
                  </button>
                </div>

                <div ref={lyricsContainerRef} className="flex-1 overflow-y-auto px-5 pb-36 pt-[10vh] sm:px-8">
                  <div className="mx-auto max-w-4xl">
                    {lyrics.map((line, index) => {
                      const distance = Math.abs(index - activeLyricIndex);
                      const isActive = index === activeLyricIndex;
                      return (
                        <button
                          key={`${line.time}-${index}`}
                          ref={isActive ? activeLyricRef : null}
                          onClick={() => seekTo(line.time)}
                          className={cn(
                            "block w-full py-[10px] text-left tracking-[-0.02em] transition-all duration-300",
                            isActive
                              ? "text-[clamp(28px,3.6vw,42px)] font-bold text-white opacity-100"
                              : distance === 1
                              ? "text-[clamp(22px,2.8vw,32px)] font-semibold text-white/70 opacity-90"
                              : "text-[clamp(20px,2.6vw,30px)] font-medium text-white/40 opacity-100"
                          )}
                        >
                          {line.text}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 px-4 pb-6 sm:px-6">
                  <div className="mx-auto max-w-4xl rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur-2xl">
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      step={0.1}
                      value={currentTime}
                      onChange={(e) => seekTo(Number(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-white"
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-white/55">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button onClick={() => setShuffle((v) => !v)} className={cn("grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/6 transition", shuffle ? "text-white" : "text-white/60")}>
                        <Shuffle className="h-4 w-4" />
                      </button>
                      <button onClick={handlePrev} className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/6 text-white/80 transition hover:bg-white/12">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button onClick={() => setIsPlaying((p) => !p)} className="grid h-16 w-16 place-items-center rounded-full bg-white text-black shadow-[0_12px_40px_rgba(255,255,255,0.18)] transition hover:scale-[1.02]">
                        {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="ml-1 h-7 w-7" />}
                      </button>
                      <button onClick={handleNext} className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/6 text-white/80 transition hover:bg-white/12">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"))}
                        className={cn("grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/6 transition", repeatMode !== "off" ? "text-white" : "text-white/60")}
                      >
                        <Repeat className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isQueueOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsQueueOpen(false)}
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-0 left-0 right-0 mx-auto h-[68vh] max-w-2xl rounded-t-[28px] border border-white/10 bg-zinc-950/90 p-4 backdrop-blur-2xl sm:bottom-6 sm:rounded-[28px]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white/92">Queue</p>
                    <p className="text-xs text-white/50">Now playing and up next</p>
                  </div>
                  <button onClick={() => setIsQueueOpen(false)} className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/6 text-white/80">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2 overflow-y-auto pb-8">
                  {TRACKS.map((track, index) => {
                    const active = index === trackIndex;
                    return (
                      <button
                        key={track.id}
                        onClick={() => {
                          playTrack(index);
                          setIsQueueOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-[20px] border px-3 py-3 text-left transition",
                          active
                            ? "border-white/15 bg-white/12"
                            : "border-white/5 bg-white/[0.03] hover:bg-white/[0.06]"
                        )}
                      >
                        <img src={track.coverSrc} alt={track.title} className="h-14 w-14 rounded-2xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white/92">{track.title}</p>
                          <p className="truncate text-xs text-white/55">{track.artist}</p>
                        </div>
                        {active && <Maximize2 className="h-4 w-4 text-white/75" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => {
            setTab("music");
          }}
          className="fixed bottom-4 left-4 right-4 z-30 mx-auto flex max-w-3xl items-center gap-3 rounded-[24px] border border-white/10 bg-white/10 px-3 py-3 backdrop-blur-2xl transition hover:bg-white/12 sm:left-6 sm:right-6"
        >
          <img src={currentTrack.coverSrc} alt={currentTrack.title} className="h-12 w-12 rounded-2xl object-cover" />
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium text-white/92">{currentTrack.title}</p>
            <p className="truncate text-xs text-white/55">{currentTrack.artist}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying((p) => !p);
            }}
            className="grid h-11 w-11 place-items-center rounded-full bg-white text-black"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
          </button>
        </button>
      </div>
    </div>
  );
}
```
