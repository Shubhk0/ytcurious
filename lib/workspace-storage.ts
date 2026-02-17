import type { WorkspaceSnapshot, WorkspaceSnapshotPayload } from "@/lib/types";

const STORAGE_KEY = "ytcurious.workspace.snapshots.v1";
const JUSTJSON_COLLECTION_KEY = "ytcurious.justjson.collection.v1";
const JUSTJSON_BASE_URL = "https://justjson.dev";

type StorageProvider = "justjson" | "local";

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

function getJustJsonPreferredCollection() {
  return process.env.NEXT_PUBLIC_JUSTJSON_COLLECTION?.trim() ?? "";
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

function readJustJsonCollectionId(): string {
  if (typeof window === "undefined") {
    return "";
  }
  const preferred = getJustJsonPreferredCollection();
  if (preferred) {
    return preferred;
  }
  return window.localStorage.getItem(JUSTJSON_COLLECTION_KEY) ?? "";
}

function writeJustJsonCollectionId(collectionId: string) {
  if (typeof window === "undefined") {
    return;
  }
  if (getJustJsonPreferredCollection()) {
    return;
  }
  window.localStorage.setItem(JUSTJSON_COLLECTION_KEY, collectionId);
}

async function createJustJsonCollection(): Promise<string> {
  const response = await fetch(`${JUSTJSON_BASE_URL}/api/collections/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  });
  if (!response.ok) {
    throw new Error(`JustJSON create collection failed (${response.status})`);
  }

  const body = (await response.json()) as {
    collection_id?: string;
    id?: string;
    collectionId?: string;
  };
  const collectionId = body.collection_id ?? body.id ?? body.collectionId ?? "";
  if (!collectionId) {
    throw new Error("JustJSON returned no collection id.");
  }
  writeJustJsonCollectionId(collectionId);
  return collectionId;
}

async function ensureJustJsonCollectionId(): Promise<string> {
  const existing = readJustJsonCollectionId();
  if (existing) {
    return existing;
  }
  return createJustJsonCollection();
}

async function saveJustJson(payload: WorkspaceSnapshotPayload): Promise<SaveResult> {
  const snapshot = buildSnapshot(payload);
  const collectionId = await ensureJustJsonCollectionId();
  const response = await fetch(`${JUSTJSON_BASE_URL}/api/collections/${collectionId}/entries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: snapshot.id,
      data: snapshot
    })
  });
  if (!response.ok) {
    throw new Error(`JustJSON save failed (${response.status})`);
  }
  return { provider: "justjson", snapshot };
}

async function listJustJson(limit = 10): Promise<ListResult> {
  const collectionId = readJustJsonCollectionId();
  if (!collectionId) {
    return { provider: "justjson", snapshots: [] };
  }

  const response = await fetch(`${JUSTJSON_BASE_URL}/api/collections/${collectionId}/`);
  if (!response.ok) {
    throw new Error(`JustJSON list failed (${response.status})`);
  }

  const json = (await response.json()) as
    | Array<{ id: string; data: WorkspaceSnapshot }>
    | { entries?: Array<{ id: string; data: WorkspaceSnapshot }> };
  const entries = Array.isArray(json) ? json : json.entries ?? [];
  const snapshots = entries
    .map((entry) => entry.data)
    .filter(Boolean)
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
    .slice(0, limit);

  return { provider: "justjson", snapshots };
}

export async function saveWorkspaceSnapshot(payload: WorkspaceSnapshotPayload): Promise<SaveResult> {
  try {
    return await saveJustJson(payload);
  } catch {
    return saveLocal(payload);
  }
}

export async function listWorkspaceSnapshots(limit = 10): Promise<ListResult> {
  try {
    return await listJustJson(limit);
  } catch {
    return listLocal();
  }
}
