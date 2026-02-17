export type ChannelBaseline = {
  medianViews: number;
  medianDurationSec: number;
  topTopics: string[];
  uploadCadencePerMonth: number;
};

export type IdeaCard = {
  id: string;
  title: string;
  coreAudience: string;
  promise: string;
  curiosityGap: string;
  noveltyType: "format" | "angle" | "collab" | "challenge";
  estimatedEffort: "low" | "medium" | "high";
};

export type PackageScore = {
  clarity: number;
  curiosity: number;
  specificity: number;
  audienceFit: number;
  novelty: number;
  total: number;
};

export type ScoredPackage = {
  title: string;
  thumbnailConcept: string;
  score: PackageScore;
  rationale: string;
  riskFlags: string[];
};

export type CreativeBrief = {
  selectedIdeaTitle: string;
  selectedPackaging: string;
  hooks: string[];
  beatOutline: string[];
  retentionCheckpoints: string[];
  visualProofPrompts: string[];
  ctaPlacement: string;
};

export type LearningInsight = {
  id: string;
  lesson: string;
  confidence: number;
  actionForNextVideo: string;
};

export type WorkspaceSnapshotPayload = {
  channelId: string;
  niche: string;
  ideas: IdeaCard[];
  selectedIdea: IdeaCard | null;
  packages: ScoredPackage[];
  brief: CreativeBrief | null;
  insights: LearningInsight[];
  videoUrl: string;
};

export type WorkspaceSnapshot = {
  id: string;
  createdAt: string;
  channelId: string;
  niche: string;
  topIdeaTitle: string;
  payload: WorkspaceSnapshotPayload;
};
