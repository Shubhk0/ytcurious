import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <section className="rounded-2xl bg-gradient-to-r from-moss to-emerald-700 p-10 text-white">
        <p className="text-sm uppercase tracking-[0.2em] opacity-80">YTCurious</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight">Plan better YouTube videos with an AI creator copilot</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/90">
          Turn one niche prompt into ideas, title + thumbnail packages, and a retention-aware brief in minutes.
        </p>
        <Link
          href="/app"
          className="mt-8 inline-flex rounded-lg bg-ember px-5 py-3 font-semibold text-white hover:opacity-90"
        >
          Open MVP Dashboard
        </Link>
      </section>
    </main>
  );
}
