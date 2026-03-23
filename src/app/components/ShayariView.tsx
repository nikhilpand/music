import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart, Share2, ChevronLeft, ChevronRight,
  RefreshCw, ExternalLink, Sparkles, Quote, Flame, BookOpen
} from "lucide-react";
import toast from "react-hot-toast";

const API = "http://localhost:8000";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Post {
  text: string;
  author: string;
  source?: string;
  url?: string;
  category?: string;
  upvotes?: number;
}

// ── Beautiful gradient palettes per card index ────────────────────────────────
const PALETTES = [
  { from: "#1a0533", via: "#2d1b4e", accent: "#c084fc" },   // deep purple
  { from: "#0a1628", via: "#1e3a5f", accent: "#60a5fa" },   // midnight blue
  { from: "#1a0a0a", via: "#3b1212", accent: "#f87171" },   // dark rose
  { from: "#0a1a14", via: "#0d3320", accent: "#4ade80" },   // forest
  { from: "#1a1005", via: "#3d2a08", accent: "#fbbf24" },   // amber dusk
  { from: "#110a1e", via: "#261040", accent: "#a78bfa" },   // violet night
  { from: "#0f0f0f", via: "#1a1530", accent: "#818cf8" },   // indigo depth
  { from: "#150a0a", via: "#2d1515", accent: "#fb7185" },   // crimson haze
];

// ── Category tabs ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "shayari", label: "Shayari", icon: <Sparkles className="h-3.5 w-3.5" />, endpoint: "/shayari" },
  { id: "inspire", label: "Inspire", icon: <Flame className="h-3.5 w-3.5" />,    endpoint: "/quotes?category=inspire" },
  { id: "love",    label: "Love",    icon: <Heart className="h-3.5 w-3.5" />,    endpoint: "/quotes?category=love" },
  { id: "wisdom",  label: "Wisdom",  icon: <BookOpen className="h-3.5 w-3.5" />, endpoint: "/quotes?category=wisdom" },
];

export function ShayariView() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [index, setIndex] = useState(0);
  const [category, setCategory] = useState("shayari");
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  const fetchPosts = useCallback(async (cat: string) => {
    setLoading(true);
    const catDef = CATEGORIES.find(c => c.id === cat)!;
    try {
      const res = await fetch(`${API}${catDef.endpoint}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      const items: Post[] = cat === "shayari"
        ? (data.shayaris || [])
        : (data.quotes || []);
      if (items.length > 0) {
        setPosts(items);
        setIndex(0);
      }
    } catch {
      // Stay on current posts, show toast
      toast("Using cached content — backend may be offline", {
        icon: "📡",
        style: { background: "#1e1e1e", color: "#fff", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", fontSize: "13px" },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch fresh content on mount AND on category change
  useEffect(() => {
    fetchPosts(category);
  }, [category, fetchPosts]);

  const navigate = (dir: number) => {
    setDirection(dir);
    setIndex(i => (i + dir + posts.length) % posts.length);
  };


  const handleShare = async () => {
    const post = posts[index];
    if (!post) return;
    const shareText = `${post.text}\n\n— ${post.author}`;
    if (navigator.share) {
      await navigator.share({ text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
      toast("Copied to clipboard!", {
        icon: "📋",
        style: { background: "#1e1e1e", color: "#fff", borderRadius: "12px", fontSize: "13px" },
      });
    }
  };

  const palette = PALETTES[index % PALETTES.length];
  const post = posts[index];
  const isLiked = liked.has(index);

  const variants = {
    enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 80 : -80, scale: 0.95 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -80 : 80, scale: 0.95 }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden p-4"
    >
      {/* ── Dynamic ambient background ── */}
      <motion.div
        key={`bg-${index}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 30% 40%, ${palette.accent}22 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, ${palette.accent}15 0%, transparent 55%), linear-gradient(160deg, ${palette.from} 0%, ${palette.via} 50%, #0f0f0f 100%)` }}
      />

      {/* ── Category tabs ── */}
      <div className="relative z-10 mb-8 flex gap-2 rounded-2xl border border-white/8 bg-white/5 p-1 backdrop-blur-xl">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-all duration-300 ${
              category === cat.id
                ? "bg-white/15 text-white shadow-lg"
                : "text-white/45 hover:text-white/70"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* ── Main card ── */}
      <div className="relative z-10 w-full max-w-2xl">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20 text-white/40">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="h-8 w-8" />
            </motion.div>
            <p className="text-sm">Fetching fresh content...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout" custom={direction}>
            {post && (
              <motion.div
                key={index}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative overflow-hidden rounded-3xl border border-white/10 backdrop-blur-2xl"
                style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)`, boxShadow: `0 0 80px ${palette.accent}18, 0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)` }}
              >
                {/* Accent glow top bar */}
                <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${palette.accent}, transparent)` }} />

                {/* Card content */}
                <div className="px-8 py-10 sm:px-12 sm:py-14">
                  {/* Quote mark */}
                  <Quote className="mb-6 h-8 w-8 opacity-20" style={{ color: palette.accent }} />

                  {/* Text — font shrinks as length grows */}
                  <div className="mb-8 space-y-2">
                    {(() => {
                      const len = post.text.length;
                      const fontSize =
                        len < 80  ? "text-[clamp(22px,3.2vw,38px)]" :
                        len < 160 ? "text-[clamp(18px,2.6vw,30px)]" :
                        len < 260 ? "text-[clamp(15px,2.1vw,24px)]" :
                                    "text-[clamp(13px,1.8vw,20px)]";
                      return post.text.split("\n").filter(l => l.trim()).map((line, i) => (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className={`text-balance ${fontSize} font-semibold leading-snug tracking-[-0.01em] text-white/92`}
                        >
                          {line}
                        </motion.p>
                      ));
                    })()}
                  </div>

                  {/* Author + source */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: palette.accent }}>— {post.author}</p>
                      {post.source && (
                        <p className="mt-0.5 text-xs text-white/30">{post.source}</p>
                      )}
                    </div>
                    {post.url && (
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grid h-8 w-8 place-items-center rounded-full text-white/25 transition hover:text-white/60"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ── Controls ── */}
        {!loading && posts.length > 0 && (
          <>
            <div className="mt-8 flex items-center justify-center gap-3">
              <button onClick={() => navigate(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white backdrop-blur-xl">
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => { setLiked(p => { const n = new Set(p); n.has(index) ? n.delete(index) : n.add(index); return n; }); }}
                  className={`flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-medium transition backdrop-blur-xl ${isLiked ? "border-red-500/30 bg-red-500/15 text-red-300" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"}`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white backdrop-blur-xl"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => fetchPosts(category)}
                  title="Refresh"
                  className="flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white backdrop-blur-xl"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <button onClick={() => navigate(1)} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white backdrop-blur-xl">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Progress dots */}
            <div className="mt-6 flex justify-center gap-1.5">
              {posts.slice(0, Math.min(posts.length, 15)).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === index ? 24 : 6,
                    height: 6,
                    background: i === index ? palette.accent : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
              {posts.length > 15 && <span className="text-xs text-white/25 ml-1">+{posts.length - 15}</span>}
            </div>

            {/* Counter */}
            <p className="mt-4 text-center text-xs text-white/25">{index + 1} / {posts.length}</p>
          </>
        )}
      </div>
    </motion.div>
  );
}
