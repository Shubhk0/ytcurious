import { CreatorDashboard } from "@/components/creator-dashboard";

export default function DashboardPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <section className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur">
        <h1 className="text-3xl font-semibold md:text-4xl">Creator Dashboard</h1>
        <p className="mt-2 text-sm text-black/70">Plan packaging first, then build script structure and reduce empty-view risk.</p>
      </section>
      <CreatorDashboard />
    </main>
  );
}
