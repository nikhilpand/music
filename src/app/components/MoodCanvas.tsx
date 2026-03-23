import { useEffect, useRef } from "react";
import type { Track } from "../App";

interface MoodCanvasProps {
  track: Track | null;
}

/** Samples dominant hue from an album art image using a hidden canvas */
function sampleAlbumColor(src: string): Promise<[number, number, number]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 50; c.height = 50;
      const ctx = c.getContext("2d");
      if (!ctx) return resolve([20, 20, 40]);
      ctx.drawImage(img, 0, 0, 50, 50);
      const d = ctx.getImageData(0, 0, 50, 50).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < d.length; i += 16) {
        r += d[i]; g += d[i + 1]; b += d[i + 2]; count++;
      }
      resolve([Math.floor(r / count), Math.floor(g / count), Math.floor(b / count)]);
    };
    img.onerror = () => resolve([20, 20, 40]);
    img.src = src;
  });
}

/** Linearly interpolates between two colors */
function lerpColor(a: [number,number,number], b: [number,number,number], t: number): [number,number,number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

export function MoodCanvas({ track }: MoodCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentColor  = useRef<[number,number,number]>([15, 12, 30]);
  const targetColor   = useRef<[number,number,number]>([15, 12, 30]);
  const phase         = useRef(0);
  const rafId         = useRef<number | null>(null);

  // Whenever the track changes, sample the new dominant color
  useEffect(() => {
    if (!track?.coverSrc) return;
    sampleAlbumColor(track.coverSrc).then(rgb => {
      // Darken significantly so it stays atmospheric, not garish
      targetColor.current = [
        Math.max(5,  Math.floor(rgb[0] * 0.35)),
        Math.max(5,  Math.floor(rgb[1] * 0.35)),
        Math.max(10, Math.floor(rgb[2] * 0.40)),
      ];
    });
  }, [track?.coverSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      // Slowly lerp current toward target (smooth color transition)
      currentColor.current = lerpColor(currentColor.current, targetColor.current, 0.005);
      phase.current += 0.004;

      const [r, g, b] = currentColor.current;
      const w = canvas.width;
      const h = canvas.height;

      // Base fill
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(0, 0, w, h);

      // Breathing radial gradient (center glow)
      const breathScale = 0.85 + Math.sin(phase.current) * 0.15;
      const gr = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, (w * 0.65) * breathScale);
      gr.addColorStop(0, `rgba(${r * 2.8 > 255 ? 255 : Math.round(r * 2.8)}, ${g * 2.8 > 255 ? 255 : Math.round(g * 2.8)}, ${b * 2.8 > 255 ? 255 : Math.round(b * 2.8)}, 0.35)`);
      gr.addColorStop(1, `rgba(0,0,0,0)`);
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, w, h);

      // Soft secondary orb (top-left drift)
      const ox = w * (0.15 + Math.cos(phase.current * 0.7) * 0.08);
      const oy = h * (0.2  + Math.sin(phase.current * 0.5) * 0.06);
      const gr2 = ctx.createRadialGradient(ox, oy, 0, ox, oy, w * 0.35);
      gr2.addColorStop(0, `rgba(${Math.min(255,r+50)}, ${Math.min(255,g+20)}, ${Math.min(255,b+80)}, 0.18)`);
      gr2.addColorStop(1, `rgba(0,0,0,0)`);
      ctx.fillStyle = gr2;
      ctx.fillRect(0, 0, w, h);

      // Vignette overlay
      const vig = ctx.createRadialGradient(w*0.5, h*0.5, h*0.25, w*0.5, h*0.5, h);
      vig.addColorStop(0, `rgba(0,0,0,0)`);
      vig.addColorStop(1, `rgba(0,0,0,0.75)`);
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      rafId.current = requestAnimationFrame(draw);
    };

    rafId.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ display: "block" }}
    />
  );
}
