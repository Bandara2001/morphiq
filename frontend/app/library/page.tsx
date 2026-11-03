import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, HeartPulse, Microscope } from "lucide-react";

// Decorative floating spores (deterministic, so no hydration mismatch)
const spores = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 43) % 100}%`,
  size: `${3 + ((i * 5) % 6)}px`,
  delay: `${-((i * 1.8) % 14)}s`,
  duration: `${13 + ((i * 3) % 10)}s`,
}));

const reveal = (delay: number): CSSProperties => ({
  opacity: 0,
  animation: `reveal 0.9s ${delay}s cubic-bezier(0.2,0.7,0.2,1) forwards`,
});

export default function BiologyLibraryPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050a14] px-6 py-10 text-white md:px-12">
      {/* ambient glow + spores (classes come from globals.css) */}
      <div className="ambient" aria-hidden="true">
        <span className="ambient-blob blob-a" />
        <span className="ambient-blob blob-b" />
        {spores.map((s, i) => (
          <span
            key={i}
            className="spore"
            style={
              {
                left: s.left,
                width: s.size,
                height: s.size,
                animationDelay: s.delay,
                animationDuration: s.duration,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <Link
          href="/dashboard"
          style={reveal(0.05)}
          className="group mb-10 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-[#4df2c8]"
        >
          <ArrowLeft
            size={17}
            className="transition-transform group-hover:-translate-x-1"
          />
          Back to Dashboard
        </Link>

        <div className="mb-10" style={reveal(0.15)}>
          <div className="mb-3 flex items-center gap-2 text-[#4df2c8]">
            <Microscope size={20} className="drop-shadow-[0_0_8px_rgba(77,242,200,0.6)]" />
            <span className="font-[family-name:var(--font-mono)] text-xs tracking-[3px]">
              <span className="text-[#8b7bff]">// </span>
              MORPHIQ LEARNING LIBRARY
            </span>
          </div>

          <h1 className="bg-gradient-to-r from-white via-white to-[#4df2c8] bg-clip-text font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-transparent md:text-5xl">
            3D Biology Library
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
            Explore biological structures through interactive
            three-dimensional models.
          </p>
        </div>

        <div
          style={reveal(0.3)}
          className="group relative max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0e1828]/70 p-8 backdrop-blur-md transition duration-500 hover:-translate-y-1.5 hover:border-[#ff8da5]/50 hover:shadow-[0_20px_60px_rgba(0,0,0,0.45),0_0_50px_rgba(255,141,165,0.1)]"
        >
          {/* shimmering top edge */}
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff8da5] to-transparent opacity-70" />

          {/* specimen corner bracket */}
          <span className="absolute right-3 top-3 h-4 w-4 border-r border-t border-[#ff8da5]/60 transition-all duration-500 group-hover:h-7 group-hover:w-7" />

          {/* colour bloom on hover */}
          <span className="pointer-events-none absolute -bottom-24 left-1/2 h-40 w-60 -translate-x-1/2 rounded-full bg-[#ff8da5]/25 opacity-0 blur-[40px] transition-opacity duration-500 group-hover:opacity-40" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-md">
              <span className="mb-4 inline-block rounded-full border border-[#ff8da5]/35 px-2.5 py-1 font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[1px] text-[#ff8da5]">
                Interactive 3D model
              </span>

              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
                Human Heart
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                Explore the major structures of the human heart
                and understand how blood flows through its chambers.
              </p>

              <Link
                href="/viewer?id=c2f39c0f-8215-45b3-bbff-22ebf3410476"
                className="primary-button mt-6 !justify-start"
              >
                Explore 3D Model
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* animated heart emblem */}
            <div className="relative mx-auto flex h-36 w-36 shrink-0 items-center justify-center" aria-hidden="true">
              <span className="absolute inset-0 rounded-full border border-dashed border-[#ff8da5]/30 [animation:spin_30s_linear_infinite]">
                <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#ff8da5] shadow-[0_0_16px_4px_rgba(255,141,165,0.7)]" />
              </span>
              <span className="absolute inset-4 rounded-full border border-[#ff8da5]/20 [animation:pulse-ring_2.6s_ease-out_infinite]" />
              <span className="flex h-20 w-20 items-center justify-center rounded-full border border-[#ff8da5]/40 bg-[radial-gradient(circle,rgba(255,141,165,0.25),rgba(255,141,165,0.04))] text-[#ff8da5] shadow-[0_0_40px_rgba(255,141,165,0.25)]">
                <HeartPulse
                  size={38}
                  strokeWidth={1.6}
                  className="[animation:heartbeat_1.6s_ease-in-out_infinite]"
                />
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.18); }
          28% { transform: scale(1); }
          42% { transform: scale(1.12); }
          70% { transform: scale(1); }
        }
      `}</style>
    </main>
  );
}