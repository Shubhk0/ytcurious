import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <section className="grid gap-6 rounded-3xl border border-black/10 bg-white/75 p-6 shadow-sm backdrop-blur md:grid-cols-[1.25fr_1fr] md:p-12">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-black/65">YTCurious</p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
            Ship more YouTube videos with better packaging before you hit record
          </h1>
          <p className="mt-4 max-w-xl text-base text-black/75 md:text-lg">
            Turn one niche prompt into title angles, thumbnail directions, question-chain planning, retention beats, and
            risk-checked creative briefs.
          </p>
          <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
            <Link href="/app" className="btn-primary">
              Open Creator Dashboard
            </Link>
            <span className="inline-flex items-center rounded-lg border border-black/10 bg-white px-4 py-2 text-sm">
              Static on GitHub Pages
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-[#0d5a40] to-[#11392f] p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Workflow</p>
          <ul className="mt-4 space-y-2 text-sm text-white/90">
            <li>1. Idea engine + browser AI</li>
            <li>2. Pre-packaging board</li>
            <li>3. Click/time/value scoring</li>
            <li>4. Empty-views risk fixes</li>
            <li>5. Brief + retention checkpoints</li>
            <li>6. Save winning packages</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
