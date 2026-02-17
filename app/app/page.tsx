import { CreatorDashboard } from "@/components/creator-dashboard";

export default function DashboardPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold">Creator Dashboard</h1>
      <p className="mt-2 text-sm text-black/70">MVP workflow: sync to ideas to packaging to brief to learning.</p>
      <CreatorDashboard />
    </main>
  );
}
