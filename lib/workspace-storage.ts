import type { WorkspaceSnapshot, WorkspaceSnapshotPayload } from "@/lib/types";

const STORAGE_KEY = "ytcurious.workspace.snapshots.v1";

type StorageProvider = "supabase" | "local";

type SaveResult = {
  provider: StorageProvider;
  snapshot: WorkspaceSnapshot;
};

type ListResult = {
  provider: StorageProvider;
  snapshots: WorkspaceSnapshot[];
};

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function nowIso() {
  return new Date().toISOString();
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const enabled = url.length > 0 && anonKey.length > 0;
  return { enabled, url, anonKey };
}

function buildSnapshot(payload: WorkspaceSnapshotPayload): WorkspaceSnapshot {
  return {
    id: makeId(),
    createdAt: nowIso(),
    channelId: payload.channelId,
    niche: payload.niche,
    topIdeaTitle: payload.selectedIdea?.title ?? payload.ideas[0]?.title ?? "Untitled",
    payload
  };
}

function readLocalSnapshots(): WorkspaceSnapshot[] {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as WorkspaceSnapshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalSnapshots(snapshots: WorkspaceSnapshot[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
}

async function saveLocal(payload: WorkspaceSnapshotPayload): Promise<SaveResult> {
  const snapshot = buildSnapshot(payload);
  const current = readLocalSnapshots();
  const next = [snapshot, ...current].slice(0, 20);
  writeLocalSnapshots(next);
  return { provider: "local", snapshot };
}

async function listLocal(): Promise<ListResult> {
  return { provider: "local", snapshots: readLocalSnapshots() };
}

async function saveSupabase(payload: WorkspaceSnapshotPayload): Promise<SaveResult> {
  const config = getSupabaseConfig();
  const snapshot = buildSnapshot(payload);
  const body = {
    id: snapshot.id,
    created_at: snapshot.createdAt,
    channel_id: snapshot.channelId,
    niche: snapshot.niche,
    top_idea_title: snapshot.topIdeaTitle,
    payload: snapshot.payload
  };

  const res = await fetch(`${config.url}/rest/v1/workspace_snapshots`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error(`Supabase save failed (${res.status})`);
  }

  return { provider: "supabase", snapshot };
}

async function listSupabase(limit = 10): Promise<ListResult> {
  const config = getSupabaseConfig();
  const query =
    "select=id,created_at,channel_id,niche,top_idea_title,payload&order=created_at.desc&limit=" + String(limit);

  const res = await fetch(`${config.url}/rest/v1/workspace_snapshots?${query}`, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`
    }
  });

  if (!res.ok) {
    throw new Error(`Supabase load failed (${res.status})`);
  }

  const rows = (await res.json()) as Array<{
    id: string;
    created_at: string;
    channel_id: string;
    niche: string;
    top_idea_title: string;
    payload: WorkspaceSnapshotPayload;
  }>;

  const snapshots: WorkspaceSnapshot[] = rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    channelId: row.channel_id,
    niche: row.niche,
    topIdeaTitle: row.top_idea_title,
    payload: row.payload
  }));

  return { provider: "supabase", snapshots };
}

export async function saveWorkspaceSnapshot(payload: WorkspaceSnapshotPayload): Promise<SaveResult> {
  const config = getSupabaseConfig();
  if (config.enabled) {
    try {
      return await saveSupabase(payload);
    } catch {
      return saveLocal(payload);
    }
  }
  return saveLocal(payload);
}

export async function listWorkspaceSnapshots(limit = 10): Promise<ListResult> {
  const config = getSupabaseConfig();
  if (config.enabled) {
    try {
      return await listSupabase(limit);
    } catch {
      return listLocal();
    }
  }
  return listLocal();
}
