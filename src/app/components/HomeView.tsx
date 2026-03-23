import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Sparkles } from "lucide-react";
import type { Track } from "../App";

interface HomeViewProps {
  onSearch: (q: string) => void;
  onPlay?: (t: Track, queue?: Track[], idx?: number) => void;
  currentTrack?: Track | null;
  isPlaying?: boolean;
}

const FLOW_CATEGORIES = [
  { id: "lofi", label: "Ocean Chill", query: "lofi hip hop chill beats", hint: "soft waves of sound" },
  { id: "midnight", label: "Midnight Drive", query: "synthwave night drive", hint: "neon reflections" },
  { id: "acoustic", label: "Raw Acoustic", query: "unplugged acoustic indie", hint: "wood and strings" },
  { id: "focus", label: "Deep Focus", query: "ambient focus music", hint: "clear the mind" },
  { id: "energy", label: "Kinetic Pulse", query: "upbeat electronic dance", hint: "heartbeat synced" }
];

export function HomeView({ onSearch }: HomeViewProps) {
  const [query, setQuery] = useState("");
  const [isHovered, setIsHovered] = useState<string | null>(null);

  // Whisper mode: auto-search after typing stops
  useEffect(() => {
    if (query.trim().length > 2) {
      const t = setTimeout(() => {
        onSearch(query.trim());
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [query, onSearch]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#030305] text-white/90"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        /* Mood-Responsive Background (Breathing Gradient) */
        .mood-bg {
          position: absolute; inset: 0; z-index: 0;
          background: radial-gradient(circle at 50% 50%, rgba(20,20,35,0.8) 0%, rgba(5,5,10,1) 100%);
          animation: breathBg 12s ease-in-out infinite alternate;
        }
        @keyframes breathBg {
          0% { transform: scale(1); filter: hue-rotate(0deg) brightness(1); }
          100% { transform: scale(1.05); filter: hue-rotate(15deg) brightness(1.2); }
        }

        /* Ambient Soundscape Particles */
        .ambient-dust {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: drift 30s linear infinite;
        }
        @keyframes drift { 0% { transform: translateY(0); } 100% { transform: translateY(-40px); } }

        /* Whisper Search Input */
        .whisper-input {
          background: transparent; border: none; outline: none; box-shadow: none;
          color: rgba(255,255,255,0.9);
          font-size: clamp(2rem, 5vw, 4rem); font-weight: 300; letter-spacing: -0.02em;
          text-align: center; transition: all 0.5s ease;
          border-bottom: 1px solid rgba(255,255,255,0);
        }
        .whisper-input::placeholder { color: rgba(255,255,255,0.15); transition: color 0.5s ease; }
        .whisper-input:focus::placeholder { color: rgba(255,255,255,0.05); }
        .whisper-input:focus { border-bottom: 1px solid rgba(255,255,255,0.2); }

        /* Breath-Synced Cards (Endless Flow feel) */
        .flow-card {
          position: relative; overflow: hidden;
          background: rgba(255,255,255,0.02); backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.03);
          border-radius: 100px; padding: 1rem 2rem;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          transform: scale(0.95); opacity: 0.6; cursor: pointer;
        }
        .flow-card:hover {
          transform: scale(1); opacity: 1;
          background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15);
          box-shadow: 0 0 30px rgba(255,255,255,0.05);
        }
        .flow-card .glitch-hint {
          max-height: 0; opacity: 0; overflow: hidden;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 0;
        }
        .flow-card:hover .glitch-hint {
          max-height: 20px; opacity: 1; margin-top: 0.25rem;
        }

        /* Haptic Pulse on Click */
        .haptic-click:active {
          transform: scale(0.98);
          transition: transform 0.1s;
        }
      `}</style>

      {/* Layer 0: Reactive Background */}
      <div className="mood-bg" />
      <div className="ambient-dust" />

      {/* Layer 1: Content Container */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center px-6">
        
        {/* Whisper Search Overlay */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="mb-16 w-full"
        >
          <div className="relative flex justify-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Whisper a song or mood..."
              className="whisper-input w-full"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) onSearch(query.trim());
              }}
            />
          </div>
          <AnimatePresence>
            {query.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="mt-6 flex justify-center"
              >
                <button 
                  onClick={() => onSearch(query.trim())}
                  className="haptic-click group flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm tracking-widest text-white/60 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
                >
                  <Search className="h-4 w-4 opacity-50 transition-opacity group-hover:opacity-100" />
                  SEEK
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Endless Flow Wheel / Categories */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1.5 }}
          className="w-full"
        >
          <div className="flex flex-wrap justify-center gap-4">
            {FLOW_CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.id}
                onClick={() => onSearch(cat.query)}
                onMouseEnter={() => setIsHovered(cat.id)}
                onMouseLeave={() => setIsHovered(null)}
                className="flow-card haptic-click group flex flex-col items-center justify-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.8, ease: "easeOut" }}
              >
                <span className="text-sm font-medium tracking-wide text-white/80 group-hover:text-white">
                  {cat.label}
                </span>
                <span className="glitch-hint tracking-widest uppercase inline-block">
                  {cat.hint}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Secret Shayari Corner Trigger (Ambient Hint) */}
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} whileHover={{ opacity: 0.8 }}
          transition={{ delay: 1.5, duration: 2 }}
          onClick={() => onSearch("Beautiful hindi shayari")}
          className="absolute bottom-[-10vh] flex items-center gap-2 text-xs tracking-widest text-white/50 transition-all hover:text-white"
        >
          <Sparkles className="h-3 w-3" />
          <span>POETIC ECHOES</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
