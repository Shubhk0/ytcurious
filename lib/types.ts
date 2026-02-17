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
  clickPotential: number;
  respectTime: number;
  giveMore: number;
  curiosityGap: number;
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
  questionChain: string[];
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

export type ShotPlanStep = {
  id: string;
  beat: string;
  objective: string;
  primaryShot: string;
  bRoll: string;
  onScreenText: string;
  editNote: string;
};

export type PackagePerformanceLog = {
  id: string;
  packageTitle: string;
  thumbnailConcept: string;
  selectedHook: string;
  ctrPercent: number;
  retention30sPercent: number;
  createdAt: string;
};

export type NichePlaybook = {
  id: string;
  label: string;
  defaultDurationMin: number;
  hookFormula: string;
  thumbnailFormula: string;
  questionChain: string[];
  scriptTemplate: string[];
};

export type EmptyViewsAssessment = {
  riskScore: number;
  riskLabel: "Low" | "Medium" | "High";
  reasons: string[];
  fixes: string[];
};

export type WorkspaceSnapshotPayload = {
  channelId: string;
  niche: string;
  preTitleAngle: string;
  preThumbnailConcept: string;
  preFirst15sHook: string;
  targetDurationMin: number;
  questionChain: string[];
  bestRiskScore?: number;
  winningPackage?: ScoredPackage | null;
  ideas: IdeaCard[];
  selectedIdea: IdeaCard | null;
  packages: ScoredPackage[];
  brief: CreativeBrief | null;
  insights: LearningInsight[];
  videoUrl: string;
  hookOptions?: string[];
  selectedHook?: string;
  scriptDraft?: string;
  shotPlan?: ShotPlanStep[];
  packagePerformanceLog?: PackagePerformanceLog[];
  activePlaybookId?: string;
  nextVideoRecommendations?: string[];
  exportMarkdown?: string;
};

export type WorkspaceSnapshot = {
  id: string;
  createdAt: string;
  channelId: string;
  niche: string;
  topIdeaTitle: string;
  payload: WorkspaceSnapshotPayload;
};
