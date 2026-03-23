import { motion } from "motion/react";
import { X, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, VolumeX, Heart, Loader2 } from "lucide-react";
import type { Track, RepeatMode } from "../App";

function fmt(s: number) {
  if (!Number.isFinite(s)) return "0:00";
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

interface FullPlayerProps {
  track: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  repeat: RepeatMode;
  shuffle: boolean;
  loading: boolean;
  liked: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (t: number) => void;
  onVolume: (v: number) => void;
  onMute: () => void;
  onRepeat: () => void;
  onShuffle: () => void;
  onLike: () => void;
  onClose: () => void;
}

export function FullPlayer(props: FullPlayerProps) {
  const { track, isPlaying, currentTime, duration, volume, muted, repeat, shuffle, loading, liked } = props;
  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
    >
      {/* Blurred background */}
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center blur-[60px] brightness-50"
        style={{ backgroundImage: `url(${track.coverSrc})` }}
      />
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={props.onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/15">
            <X className="h-5 w-5" />
          </button>
          <p className="text-sm font-medium text-white/70">Now Playing</p>
          <button onClick={props.onLike} className={`grid h-10 w-10 place-items-center rounded-full transition ${liked ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/70 hover:bg-white/15"}`}>
            <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Album Art */}
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
          <motion.img
            key={track.videoId}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={track.coverSrc}
            alt=""
            className="h-[min(56vw,320px)] w-[min(56vw,320px)] rounded-3xl object-cover shadow-2xl shadow-black/60"
            onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1598969880158-b05f958203a2?w=400"; }}
          />

          {/* Track info */}
          <div className="w-full max-w-sm text-center">
            <h2 className="mb-1 text-2xl font-bold tracking-tight text-white">{track.title}</h2>
            <p className="text-sm text-white/55">{track.artist}{track.album ? ` · ${track.album}` : ""}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="px-6 pb-10">
          {/* Progress */}
          <div className="mb-2 relative h-1 w-full cursor-pointer rounded-full bg-white/20"
            onClick={e => {
              const r = (e.target as HTMLElement).getBoundingClientRect();
              props.onSeek(((e.clientX - r.left) / r.width) * duration);
            }}
          >
            <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
            <div className="absolute top-1/2 -mt-2 h-4 w-4 -translate-x-1/2 rounded-full bg-white shadow" style={{ left: `${progress}%` }} />
          </div>
          <div className="mb-6 flex justify-between text-xs tabular-nums text-white/40">
            <span>{fmt(currentTime)}</span><span>{fmt(duration)}</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-5">
            <button onClick={props.onShuffle} className={`transition ${shuffle ? "text-red-400" : "text-white/45 hover:text-white/80"}`}>
              <Shuffle className="h-5 w-5" />
            </button>
            <button onClick={props.onPrev} className="text-white/80 transition hover:text-white active:scale-95">
              <SkipBack className="h-7 w-7 fill-current" />
            </button>
            <button onClick={props.onTogglePlay} disabled={loading} className="grid h-16 w-16 place-items-center rounded-full bg-white text-black shadow-xl transition hover:scale-105 active:scale-95 disabled:opacity-60">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="ml-1 h-6 w-6 fill-current" />}
            </button>
            <button onClick={props.onNext} className="text-white/80 transition hover:text-white active:scale-95">
              <SkipForward className="h-7 w-7 fill-current" />
            </button>
            <button onClick={props.onRepeat} className={`transition ${repeat !== "off" ? "text-red-400" : "text-white/45 hover:text-white/80"}`}>
              <Repeat className="h-5 w-5" />
            </button>
          </div>

          {/* Volume */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={props.onMute} className="text-white/45 transition hover:text-white/80">
              {muted || volume === 0 ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
            </button>
            <input type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
              onChange={e => props.onVolume(Number(e.target.value))}
              className="w-40 cursor-pointer accent-white"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
