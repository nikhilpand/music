import { motion } from "motion/react";
import { Play, Pause, Heart, Search } from "lucide-react";
import type { Track } from "../App";

interface SearchResultsProps {
  results: Track[];
  searching: boolean;
  query: string;
  currentTrack: Track | null;
  isPlaying: boolean;
  liked: Set<string>;
  onPlay: (t: Track) => void;
  onLike: (id: string) => void;
}

export function SearchResults({ results, searching, query, currentTrack, isPlaying, liked, onPlay, onLike }: SearchResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 sm:p-6"
    >
      <p className="mb-5 text-xs font-medium tracking-widest text-white/30 uppercase">
        {searching ? `seeking "${query}"…` : `${results.length} echoes for "${query}"`}
      </p>

      {/* ── Skeleton loaders ── */}
      {searching && (
        <div className="space-y-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-3 rounded-2xl px-3 py-2.5"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="h-9 w-9 shrink-0 rounded-lg bg-white/[0.06]" />
              <div className="h-10 w-10 shrink-0 rounded-xl bg-white/[0.06]" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-3 w-2/5 rounded-full bg-white/[0.06]" />
                <div className="h-2.5 w-1/4 rounded-full bg-white/[0.04]" />
              </div>
              <div className="h-2.5 w-10 rounded-full bg-white/[0.04]" />
            </div>
          ))}
        </div>
      )}

      {!searching && results.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center text-white/25">
          <Search className="mb-3 h-10 w-10" />
          <p className="text-sm tracking-wide">No echoes found. Try a different mood.</p>
        </div>
      )}

      {!searching && results.length > 0 && (
        <div className="space-y-0.5">
          {results.map((track, i) => {
            const active = currentTrack?.videoId === track.videoId;
            const isLiked = liked.has(track.id);
            return (
              <div
                key={`${track.id}-${i}`}
                className={`glitch-card group flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 transition-all ${
                  active ? "bg-white/[0.08]" : "hover:bg-white/[0.05]"
                }`}
                style={{ animationDelay: `${Math.min(i * 35, 400)}ms` }}
                onClick={() => onPlay(track)}
              >
                {/* Index / play button */}
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                  <span className={`text-[11px] tabular-nums text-white/20 transition-opacity duration-200 group-hover:opacity-0 ${active ? "opacity-0" : ""}`}>
                    {i + 1}
                  </span>
                  <div className={`absolute inset-0 grid place-items-center transition-opacity duration-200 group-hover:opacity-100 ${active ? "opacity-100" : "opacity-0"}`}>
                    {active && isPlaying
                      ? <Pause className="h-4 w-4 fill-current text-white" />
                      : <Play className="ml-0.5 h-4 w-4 fill-current text-white" />}
                  </div>
                </div>

                {/* Cover art */}
                <img
                  src={track.coverSrc || "https://images.unsplash.com/photo-1598969880158-b05f958203a2?w=80"}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-xl object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1598969880158-b05f958203a2?w=80"; }}
                />

                {/* Track info */}
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${active ? "text-white" : "text-white/80"}`}>
                    {track.title}
                  </p>
                  <p className="truncate text-xs text-white/35">
                    {track.artist}{track.album ? ` · ${track.album}` : ""}
                  </p>
                </div>

                {/* Duration */}
                {track.duration && (
                  <span className="hidden text-[11px] tabular-nums text-white/25 sm:inline">{track.duration}</span>
                )}

                {/* Like */}
                <button
                  onClick={e => { e.stopPropagation(); onLike(track.id); }}
                  className={`haptic-btn rounded-full p-1.5 transition-all duration-200 ${
                    isLiked ? "text-red-400" : "text-transparent group-hover:text-white/30 hover:!text-white/60"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
