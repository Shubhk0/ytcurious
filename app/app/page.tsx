import { CreatorDashboard } from "@/components/creator-dashboard";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <section className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="mb-3 flex justify-end">
          <ThemeToggle />
        </div>
        <h1 className="text-3xl font-semibold md:text-4xl">Creator Dashboard</h1>
        <p className="mt-2 text-sm text-black/70">Plan packaging first, then build script structure and reduce empty-view risk.</p>
      </section>
      <CreatorDashboard />
    </main>
  );
}
