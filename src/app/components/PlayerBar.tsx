import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, VolumeX, Heart, ChevronUp, Loader2, Mic2 } from "lucide-react";
import type { Track, RepeatMode } from "../App";

function fmt(s: number) {
  if (!Number.isFinite(s)) return "0:00";
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

interface PlayerBarProps {
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
  onExpand: () => void;
  onLyrics: () => void;
  lyricsActive?: boolean;
}

export function PlayerBar(props: PlayerBarProps) {
  const { track, isPlaying, currentTime, duration, volume, muted, repeat, shuffle, loading, liked } = props;
  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-black/60 text-white shadow-[0_-1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
      {/* ── Top edge progress bar ── */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 cursor-pointer bg-white/10 group"
        onClick={e => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          props.onSeek(((e.clientX - rect.left) / rect.width) * duration);
        }}
      >
        <div 
          className="h-full bg-red-600 transition-none group-hover:h-1.5" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      <div className="flex h-[72px] items-center px-4 sm:px-6">
        
        {/* ── Left: Track info ── */}
        <div className="flex w-1/3 min-w-[200px] items-center gap-4">
          <div className="relative group cursor-pointer haptic-btn" onClick={props.onExpand}>
            <img 
              src={track.coverSrc} 
              alt="" 
              className="h-12 w-12 rounded object-cover shadow-md brightness-90 transition group-hover:brightness-50" 
              onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1598969880158-b05f958203a2?w=100"; }}
            />
            <ChevronUp className="absolute inset-0 m-auto h-5 w-5 opacity-0 text-white drop-shadow transition group-hover:opacity-100" />
          </div>
          <div className="flex min-w-0 flex-col justify-center">
            <div className="flex items-center gap-2">
              <p className="truncate text-[15px] font-medium leading-snug">{track.title}</p>
              <button onClick={props.onLike} className={`transition ${liked ? "text-red-500" : "text-white/40 hover:text-white/80"}`} title="Like">
                <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              </button>
            </div>
            <p className="truncate text-xs text-[#aaaaaa] mt-0.5">{track.artist}</p>
          </div>
        </div>

        {/* ── Center: Playback Controls ── */}
        <div className="flex flex-1 items-center justify-center gap-2 sm:gap-4">
          <button onClick={props.onShuffle} className={`grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/10 ${shuffle ? "text-red-500" : "text-white/50"}`}>
            <Shuffle className="h-4.5 w-4.5" />
          </button>
          <button onClick={props.onPrev} className="haptic-btn grid h-10 w-10 place-items-center rounded-full text-white/90 transition hover:bg-white/10">
            <SkipBack className="h-5 w-5 fill-current" />
          </button>

          <button 
            onClick={props.onTogglePlay} 
            disabled={loading} 
            className={`haptic-btn grid h-[42px] w-[42px] place-items-center rounded-full bg-white text-black transition hover:scale-105 active:scale-95 disabled:opacity-50 ${isPlaying ? "breath-play" : ""}`}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
          </button>

          <button onClick={props.onNext} className="haptic-btn grid h-10 w-10 place-items-center rounded-full text-white/90 transition hover:bg-white/10">
            <SkipForward className="h-5 w-5 fill-current" />
          </button>
          <button onClick={props.onRepeat} className={`haptic-btn relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/10 ${repeat !== "off" ? "text-red-500" : "text-white/50"}`}>
            <Repeat className="h-4.5 w-4.5" />
            {repeat === "one" && <span className="absolute bottom-1.5 right-1.5 text-[8px] font-bold leading-none">1</span>}
          </button>
        </div>

        {/* ── Right: Time, Volume, Lyrics ── */}
        <div className="flex w-1/3 min-w-0 items-center justify-end gap-3 sm:gap-4">
          <div className="hidden text-xs font-medium text-[#aaaaaa] sm:block">
            {fmt(currentTime)} / {fmt(duration)}
          </div>
          
          <div className="hidden items-center gap-2 sm:flex">
            <button onClick={props.onMute} className="text-[#aaaaaa] transition hover:text-white">
              {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <input
              type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
              onChange={e => props.onVolume(Number(e.target.value))}
              className="w-20 cursor-pointer accent-white"
            />
          </div>

          {/* Lyrics Toggle Button */}
          <button 
            onClick={props.onLyrics} 
            title="Lyrics" 
            className={`haptic-btn grid h-10 w-10 place-items-center rounded-full transition ${props.lyricsActive ? "text-white bg-white/20" : "text-[#aaaaaa] hover:bg-white/10 hover:text-white"}`}
          >
            <Mic2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
