"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  ZoomIn,
  Move3D,
  Info,
  Maximize2,
  Minimize2,
  Loader2,
  Dna,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_MODEL_ID = "c2f39c0f-8215-45b3-bbff-22ebf3410476";

const Scene = dynamic<{ modelUrl: string }>(
  () => import("@/components/3d-viewer/Scene"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center gap-3 text-sm text-slate-400">
        <Loader2 className="animate-spin text-[#4df2c8]" size={18} />
        Loading 3D viewer...
      </div>
    ),
  }
);

interface BiologyModel {
  id: string;
  title: string;
  scientific_name: string | null;
  description: string | null;
  learning_objectives: string[];
  model_storage_path: string;
  thumbnail_storage_path: string | null;
}

/* ------------------------------------------------------------------ */
/*  Background: tiny drifting DNA helices + twinkling sparkles         */
/* ------------------------------------------------------------------ */
function DnaBackground({
  variant = "page",
  active = true,
  scale = 1,
  density = 1,
}: {
  variant?: "page" | "stage";
  active?: boolean;
  scale?: number;
  density?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const TAU = Math.PI * 2;
    const palette = ["77,242,200", "139,123,255", "255,122,198", "115,188,255"];

    type Strand = {
      x: number; y: number; len: number; r: number; turns: number;
      speed: number; spin: number; tilt: number; phase: number;
      sway: number; alpha: number; color: string;
    };
    type Sparkle = {
      x: number; y: number; size: number; phase: number;
      speed: number; color: string;
    };

    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let strands: Strand[] = [];
    let sparkles: Sparkle[] = [];

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    function makeStrand(startAnywhere: boolean): Strand {
      const len = rand(60, 150) * scale;
      return {
        x: rand(0, w),
        y: startAnywhere ? rand(-len, h) : h + len + rand(0, 80),
        len,
        r: rand(4, 9) * scale,
        turns: rand(1.4, 2.6),
        speed: rand(5, 16),
        spin: rand(0.5, 1.3),
        tilt: rand(-0.6, 0.6),
        phase: rand(0, TAU),
        sway: rand(6, 18),
        alpha: rand(0.28, 0.6),
        color: palette[Math.floor(Math.random() * palette.length)],
      };
    }

    function build() {
      const count = Math.max(6, Math.min(18, Math.round((w / 95) * density)));
      strands = Array.from({ length: count }, () => makeStrand(true));
      sparkles = Array.from({ length: Math.round((w / 30) * density) }, () => ({
        x: rand(0, w),
        y: rand(0, h),
        size: rand(1, 2.6),
        phase: rand(0, TAU),
        speed: rand(0.8, 2.4),
        color: palette[Math.floor(Math.random() * palette.length)],
      }));
    }

    function resize() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      if (!w || !h) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function drawStrand(s: Strand, time: number) {
      if (!ctx) return;
      const n = 14;
      ctx.save();
      ctx.translate(s.x + Math.sin(time * 0.3 + s.phase) * s.sway, s.y);
      ctx.rotate(s.tilt);

      let prevA: [number, number] | null = null;
      let prevB: [number, number] | null = null;

      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const yy = t * s.len;
        const a = s.phase + t * s.turns * TAU + time * s.spin;
        const xa = Math.sin(a) * s.r;
        const xb = -xa;
        const depthA = (Math.cos(a) + 1) / 2; // 0 (back) .. 1 (front)
        const depthB = 1 - depthA;
        // fade the ends of the strand so it appears/disappears softly
        const edge = Math.min(1, Math.min(t, 1 - t) * 5);
        const base = s.alpha * edge;

        // backbone segments
        ctx.lineWidth = 0.7;
        if (prevA) {
          ctx.strokeStyle = `rgba(${s.color},${base * 0.45})`;
          ctx.beginPath();
          ctx.moveTo(prevA[0], prevA[1]);
          ctx.lineTo(xa, yy);
          ctx.moveTo(prevB![0], prevB![1]);
          ctx.lineTo(xb, yy);
          ctx.stroke();
        }
        prevA = [xa, yy];
        prevB = [xb, yy];

        // base-pair rung
        if (i % 2 === 0) {
          ctx.strokeStyle = `rgba(${s.color},${base * 0.28})`;
          ctx.beginPath();
          ctx.moveTo(xa, yy);
          ctx.lineTo(xb, yy);
          ctx.stroke();
        }

        // nucleotides (front ones are bigger and brighter)
        for (const [px, d] of [[xa, depthA], [xb, depthB]] as const) {
          const rad = 0.7 + d * 1.5;
          ctx.fillStyle = `rgba(${s.color},${base * (0.35 + 0.65 * d)})`;
          ctx.beginPath();
          ctx.arc(px, yy, rad, 0, TAU);
          ctx.fill();
          if (d > 0.85) {
            ctx.fillStyle = `rgba(${s.color},${base * 0.18})`;
            ctx.beginPath();
            ctx.arc(px, yy, rad * 3, 0, TAU);
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }

    function drawSparkle(p: Sparkle, time: number) {
      if (!ctx) return;
      const tw = (Math.sin(time * p.speed + p.phase) + 1) / 2;
      const s = p.size * (0.4 + tw);
      ctx.strokeStyle = `rgba(${p.color},${0.15 + tw * 0.6})`;
      ctx.fillStyle = `rgba(255,255,255,${0.2 + tw * 0.6})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(p.x - s * 2.2, p.y);
      ctx.lineTo(p.x + s * 2.2, p.y);
      ctx.moveTo(p.x, p.y - s * 2.2);
      ctx.lineTo(p.x, p.y + s * 2.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(p.x, p.y, s * 0.45, 0, TAU);
      ctx.fill();
    }

    function frame(ms: number) {
      if (!ctx) return;
      const time = ms / 1000;
      const dt = last ? Math.min(0.05, time - last) : 0;
      last = time;

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < strands.length; i++) {
        const s = strands[i];
        s.y -= s.speed * dt;
        if (s.y + s.len < -30) strands[i] = makeStrand(false);
        drawStrand(strands[i], time);
      }
      for (const p of sparkles) drawSparkle(p, time);

      if (!reduceMotion) raf = requestAnimationFrame(frame);
    }

    resize();
    // follows the size of its own container (page, or the fullscreen stage)
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [active, scale, density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={
        variant === "page"
          ? "pointer-events-none fixed inset-0 z-0 h-full w-full"
          : "pointer-events-none absolute inset-0 h-full w-full"
      }
    />
  );
}

/* staggered entrance helper (uses the `reveal` keyframes from globals.css) */
const reveal = (delay: number): CSSProperties => ({
  opacity: 0,
  animation: `reveal 0.9s ${delay}s cubic-bezier(0.2,0.7,0.2,1) forwards`,
});

export default function ViewerPage() {
  const [model, setModel] = useState<BiologyModel | null>(null);
  const [modelUrl, setModelUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Fallback for browsers (e.g. iPhone Safari) that can't fullscreen an element
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false);

  const viewerRef = useRef<HTMLDivElement>(null);

  const expanded = isFullscreen || pseudoFullscreen;

  useEffect(() => {
    async function loadModel() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams(window.location.search);
        const modelId = params.get("id") || DEFAULT_MODEL_ID;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          throw new Error("Backend API URL is not configured.");
        }

        const response = await fetch(
          `${apiUrl.replace(/\/$/, "")}/api/v1/models/${modelId}`
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "This model could not be found or is not approved."
              : "Unable to retrieve the model information."
          );
        }

        const result = await response.json();
        const fetchedModel: BiologyModel = result.model;

        if (!fetchedModel.model_storage_path) {
          throw new Error("This model does not have a 3D file assigned.");
        }

        let resolvedUrl: string;

        if (
          fetchedModel.model_storage_path.startsWith("http://") ||
          fetchedModel.model_storage_path.startsWith("https://") ||
          fetchedModel.model_storage_path.startsWith("/")
        ) {
          // Local frontend path or an already-public URL.
          resolvedUrl = fetchedModel.model_storage_path;
        } else {
          // Supabase Storage path for future uploaded models.
          const supabase = createClient();

          const { data } = supabase.storage
            .from("biology-models")
            .getPublicUrl(fetchedModel.model_storage_path);

          resolvedUrl = data.publicUrl;
        }

        setModel(fetchedModel);
        setModelUrl(resolvedUrl);
      } catch (err) {
        console.error("Model loading error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    }

    loadModel();
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  // Fallback mode: lock page scroll and allow Esc to exit
  useEffect(() => {
    if (!pseudoFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPseudoFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [pseudoFullscreen]);

  async function toggleFullscreen() {
    const element = viewerRef.current;
    if (!element) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      if (pseudoFullscreen) {
        setPseudoFullscreen(false);
        return;
      }

      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else {
        setPseudoFullscreen(true);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
      setPseudoFullscreen(true);
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050a14] text-white">
      {/* ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-[#4df2c8]/10 blur-[110px]" />
        <div className="absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full bg-[#8b7bff]/12 blur-[120px]" />
      </div>

      <DnaBackground active={!expanded} />

      <div className="relative z-10">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#050a14]/70 px-6 backdrop-blur-xl md:px-12">
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight"
          >
            <Dna
              size={24}
              className="text-[#4df2c8] drop-shadow-[0_0_8px_rgba(77,242,200,0.6)] transition-transform duration-500 group-hover:rotate-180"
            />
            <span>
              Morphiq<span className="text-[#4df2c8]">.</span>
            </span>
          </Link>

          <Link
            href="/"
            className="group flex items-center gap-2 text-sm text-slate-400 transition hover:text-[#4df2c8]"
          >
            <ArrowLeft
              size={17}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to Home
          </Link>
        </header>

        <section className="mx-auto max-w-7xl px-5 py-10 md:px-10">
          <div className="mb-7" style={reveal(0.05)}>
            <p className="mb-2 font-[family-name:var(--font-mono)] text-xs tracking-[3px] text-[#4df2c8]">
              <span className="text-[#8b7bff]">// </span>
              MORPHIQ 3D EXPLORER
            </p>

            <h1 className="bg-gradient-to-r from-white via-white to-[#4df2c8] bg-clip-text font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-transparent md:text-4xl">
              {model?.title || "3D Biology Explorer"}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              {model?.description ||
                "Explore biological structures in an interactive three-dimensional environment."}
            </p>
          </div>

          {loading && (
            <div className="flex min-h-[450px] items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#0e1828]/70 text-slate-400 backdrop-blur-md">
              <Loader2
                className="animate-spin text-[#4df2c8]"
                size={22}
              />
              Loading model information...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-8 backdrop-blur-md">
              <h2 className="text-lg font-semibold text-red-400">
                Unable to load model
              </h2>
              <p className="mt-2 text-sm text-slate-400">{error}</p>
              <Link
                href="/"
                className="mt-5 inline-block rounded-lg bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
              >
                Return home
              </Link>
            </div>
          )}

          {!loading && !error && model && modelUrl && (
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
              {/* 3D viewer */}
              <div
                ref={viewerRef}
                style={expanded ? undefined : reveal(0.15)}
                className={
                  expanded
                    ? `flex flex-col bg-[#050a14] ${
                        pseudoFullscreen && !isFullscreen
                          ? "fixed inset-0 z-[100]"
                          : ""
                      }`
                    : "self-start overflow-hidden rounded-2xl border border-[#4df2c8]/20 bg-[#0e1828]/70 shadow-[0_0_70px_rgba(77,242,200,0.07)] backdrop-blur-md"
                }
              >
                {/* slim toolbar */}
                <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-2">
                  <span className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-xs text-slate-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4df2c8] shadow-[0_0_10px_2px_rgba(77,242,200,0.7)]" />
                    3D Model Viewer
                  </span>

                  <button
                    onClick={toggleFullscreen}
                    className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-[#4df2c8]/50 hover:bg-[#4df2c8]/10 hover:text-white"
                  >
                    {expanded ? (
                      <>
                        <Minimize2 size={14} />
                        Exit Fullscreen
                      </>
                    ) : (
                      <>
                        <Maximize2 size={14} />
                        Fullscreen
                      </>
                    )}
                  </button>
                </div>

                {/* canvas stage: fixed height normally, fills the screen when expanded */}
                <div
                  className={
                    expanded
                      ? "relative min-h-0 flex-1"
                      : "relative h-[440px] md:h-[600px]"
                  }
                  style={{
                    background:
                      "radial-gradient(circle at 50% 42%, #10243a 0%, #0a1322 62%, #070d18 100%)",
                  }}
                >
                  {expanded && (
                    <>
                      {/* fullscreen-only magic: aurora glows + larger, denser DNA */}
                      <div
                        className="pointer-events-none absolute -left-24 top-1/4 h-[420px] w-[420px] rounded-full bg-[#4df2c8]/15 blur-[110px]"
                        style={{ animation: "drift 16s ease-in-out infinite alternate" }}
                      />
                      <div
                        className="pointer-events-none absolute -right-24 bottom-1/4 h-[460px] w-[460px] rounded-full bg-[#8b7bff]/18 blur-[120px]"
                        style={{ animation: "drift 20s -7s ease-in-out infinite alternate" }}
                      />
                      <div
                        className="pointer-events-none absolute left-1/3 top-0 h-[300px] w-[300px] rounded-full bg-[#ff7ac6]/10 blur-[110px]"
                        style={{ animation: "drift 24s -12s ease-in-out infinite alternate" }}
                      />
                      
                    </>
                  )}

                  <div className="absolute inset-0">
                    <Scene modelUrl={modelUrl} />
                  </div>

                  {/* HUD corner marks */}
                  <span className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-[#4df2c8]/60" />
                  <span className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r border-t border-[#4df2c8]/60" />
                  <span className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b border-l border-[#4df2c8]/60" />
                  <span className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b border-r border-[#4df2c8]/60" />

                  {/* control hints: floating over the canvas instead of a tall bar */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
                    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-full border border-white/10 bg-[#050a14]/70 px-4 py-1.5 text-[11px] text-slate-400 backdrop-blur-md">
                      <span className="flex items-center gap-1.5">
                        <RotateCcw size={13} className="text-[#4df2c8]" />
                        Drag to rotate
                      </span>

                      <span className="flex items-center gap-1.5">
                        <ZoomIn size={13} className="text-[#4df2c8]" />
                        Scroll to zoom
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Move3D size={13} className="text-[#4df2c8]" />
                        Right-drag to pan
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Information panel */}
              <aside
                style={reveal(0.3)}
                className="relative self-start overflow-hidden rounded-2xl border border-white/10 bg-[#0e1828]/70 p-6 backdrop-blur-md"
              >
                <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4df2c8] to-transparent" />

                <div className="mb-5 flex items-center gap-2 text-[#4df2c8]">
                  <Info size={18} />
                  <h2 className="text-sm font-bold text-white">
                    About this model
                  </h2>
                </div>

                <h3 className="mb-2 font-[family-name:var(--font-display)] text-xl font-bold">
                  {model.title}
                </h3>

                {model.scientific_name && (
                  <p className="mb-4 font-[family-name:var(--font-mono)] text-xs italic text-slate-500">
                    {model.scientific_name}
                  </p>
                )}

                <p className="text-sm leading-7 text-slate-400">
                  {model.description || "No description is available yet."}
                </p>

                {model.learning_objectives?.length > 0 && (
                  <div className="mt-7 border-t border-white/10 pt-5">
                    <h4 className="mb-4 text-sm font-semibold">
                      Learning objectives
                    </h4>

                    <ul className="space-y-3">
                      {model.learning_objectives.map((objective, index) => (
                        <li
                          key={objective}
                          style={reveal(0.5 + index * 0.1)}
                          className="flex gap-3 text-sm leading-6 text-slate-400"
                        >
                          <span className="text-[#4df2c8] drop-shadow-[0_0_6px_rgba(77,242,200,0.8)]">
                            ●
                          </span>
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-7 rounded-xl border border-[#4df2c8]/20 bg-[#4df2c8]/5 p-4">
                  <p className="text-xs leading-6 text-slate-300">
                    Select a visible part of the model to inspect its mesh name.
                    Verified anatomical descriptions and individual structure
                    information will be added in the next development stage.
                  </p>
                </div>
              </aside>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}