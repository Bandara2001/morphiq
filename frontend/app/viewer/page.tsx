
"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  ZoomIn,
  Move3D,
  Info,
} from "lucide-react";

const Scene = dynamic(
  () => import("@/components/3d-viewer/Scene"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-gray-400">
        Loading 3D viewer...
      </div>
    ),
  }
);

export default function ViewerPage() {
  return (
    <main className="min-h-screen bg-[#080d18] text-white">
      {/* Header */}
      <header className="flex h-20 items-center justify-between border-b border-white/10 px-6 md:px-12">
        <Link
          href="/"
          className="flex items-center gap-3 text-xl font-bold"
        >
          <span className="text-[#55dfbd]">✧</span>
          Morphiq<span className="text-[#55dfbd]">.</span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Home
        </Link>
      </header>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        <div className="mb-7">
          <p className="mb-2 text-xs font-bold tracking-[3px] text-[#55dfbd]">
            MORPHIQ 3D EXPLORER
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            Explore a biological cell
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
            Discover the internal structures of a cell using
            an interactive three-dimensional environment.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_290px]">
          {/* 3D viewer */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101827]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="text-sm font-semibold">
                3D Model Viewer
              </span>

              <span className="rounded-full bg-[#55dfbd]/10 px-3 py-1 text-xs text-[#55dfbd]">
                Interactive prototype
              </span>
            </div>

            <div className="h-[420px] md:h-[550px]">
              <Scene />
            </div>

            <div className="flex flex-wrap gap-5 border-t border-white/10 px-5 py-4 text-xs text-gray-400">
              <span className="flex items-center gap-2">
                <RotateCcw size={15} className="text-[#55dfbd]" />
                Drag to rotate
              </span>

              <span className="flex items-center gap-2">
                <ZoomIn size={15} className="text-[#55dfbd]" />
                Scroll to zoom
              </span>

              <span className="flex items-center gap-2">
                <Move3D size={15} className="text-[#55dfbd]" />
                Right-drag to pan
              </span>
            </div>
          </div>

          {/* Information panel */}
          <aside className="rounded-2xl border border-white/10 bg-[#101827] p-6">
            <div className="mb-5 flex items-center gap-2 text-[#55dfbd]">
              <Info size={18} />
              <h2 className="text-sm font-bold text-white">
                About this model
              </h2>
            </div>

            <h3 className="mb-3 text-xl font-bold">
              Animal Cell
            </h3>

            <p className="text-sm leading-7 text-gray-400">
              An animal cell is the basic structural and
              functional unit of animal life. It contains
              specialised structures called organelles that
              perform different cellular functions.
            </p>

            <div className="mt-7 border-t border-white/10 pt-5">
              <h4 className="mb-3 text-sm font-semibold">
                Prototype structures
              </h4>

              <div className="space-y-3 text-sm text-gray-400">
                <p>● Cell membrane</p>
                <p>● Nucleus</p>
                <p>● Nucleolus</p>
                <p>● Mitochondria</p>
                <p>● Vesicles</p>
              </div>
            </div>

            <div className="mt-7 rounded-xl border border-[#55dfbd]/20 bg-[#55dfbd]/5 p-4">
              <p className="text-xs leading-6 text-gray-300">
                This is an early prototype. Individual
                structure selection and scientifically
                accurate models will be added in the
                upcoming development stages.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
