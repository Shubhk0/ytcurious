# YouTube Creator AI Copilot MVP Plan (Web App First)

## Summary
Build an English-first web app for solo YouTube creators that helps them publish more videos by improving the highest-leverage step first: idea + packaging (title/thumbnail angle), then generating a retention-aware creative brief.

This plan is grounded in recurring advice patterns from MrBeast and Colin & Samir: strong concept clarity, packaging before production, and repeatable systems over random uploads.

## Strategy Grounding (Research -> Product Requirements)
1. Packaging is make-or-break.
2. First 30 seconds and pacing drive retention.
3. High-output creators rely on repeatable systems, not one-off inspiration.
4. Audience-centric clarity beats creator-centric wording.
5. Feedback loops (post-publish learning) should improve next ideas.

## Scope Decisions (Locked)
1. Target users: solo/small creators.
2. Surface: web app first (not extension for MVP).
3. Core job-to-be-done: idea + packaging engine.
4. AI mode: assistive copilot (human in loop).
5. Data: YouTube OAuth with read analytics.
6. Validation UX: scorecard + rationale (no fake A/B simulator in MVP).
7. Timeline: 4-6 week MVP.
8. Language: English only.
9. Monetization: lifetime one-time fee.

## Product Spec (MVP)
### 1) Channel Connect
- OAuth connect YouTube channel.
- Pull last 50 videos and performance metadata.
- Build channel baseline (median views, CTR proxy where available, topic clusters).

### 2) Idea Engine
- Input modes: niche prompt, recent winners, competitor URL list.
- Output: 20 ideas with structured fields:
  - core_audience
  - promise
  - curiosity_gap
  - novelty_type
  - estimated_effort

### 3) Packaging Lab
- For each idea, generate 5 title angles and 3 thumbnail concept directions.
- Score each package using a transparent rubric:
  - clarity
  - curiosity
  - specificity
  - audience_fit
  - novelty
- Show "why this might fail" warnings (clickbait risk, vague target, low differentiation).

### 4) Creative Brief Generator
- Convert selected package into a one-page brief:
  - hook options (0-30s)
  - beat-by-beat outline
  - retention checkpoints
  - b-roll / visual proof prompts
  - CTA placement suggestions

### 5) Learning Loop
- After publish, user pastes URL.
- App snapshots early performance and asks creator for qualitative notes.
- App stores lessons and adjusts future recommendations.

## Public APIs / Interfaces / Types
### Endpoints
1. `POST /api/auth/youtube/connect`
   - Starts OAuth flow.
2. `POST /api/channel/sync`
   - Request: `{ channelId: string }`
   - Response: `{ syncedVideos: number, baseline: ChannelBaseline }`
3. `POST /api/ideas/generate`
   - Request: `{ niche: string, goals: string[], references?: string[] }`
   - Response: `{ ideas: IdeaCard[] }`
4. `POST /api/packaging/score`
   - Request: `{ ideaId: string, titles: string[], thumbnailConcepts: string[] }`
   - Response: `{ scoredPackages: ScoredPackage[] }`
5. `POST /api/brief/generate`
   - Request: `{ packageId: string, targetDurationMin?: number }`
   - Response: `{ brief: CreativeBrief }`
6. `POST /api/learning/ingest`
   - Request: `{ videoUrl: string, creatorNotes?: string }`
   - Response: `{ insights: LearningInsight[], appliedToFuture: boolean }`

### Core Types
- `ChannelBaseline`
- `IdeaCard`
- `ScoredPackage`
- `CreativeBrief`
- `LearningInsight`

## Architecture (Decision Complete)
1. Frontend: Next.js (App Router), TypeScript, Tailwind.
2. Backend: Next.js API routes for MVP.
3. DB: Postgres (tables: users, channels, videos, ideas, packages, briefs, insights).
4. AI provider: OpenAI API with rubric-constrained JSON outputs.
5. Jobs: background queue for channel sync and insight refresh.
6. Auth: email + Google, then YouTube OAuth.
7. Observability: structured logs + error tracking + prompt/response audit IDs.

## UX Flow
1. Onboarding: connect YouTube -> select niche -> choose goal (views, watch time, upload consistency).
2. Generate idea batch -> shortlist.
3. Open Packaging Lab -> pick best title/thumbnail direction.
4. Generate Creative Brief -> export to Notion/Docs (plain text in MVP).
5. Post-publish ingest -> receive next-round improvements.

## Test Cases and Scenarios
1. OAuth connect succeeds and sync imports expected video count.
2. Idea generation returns valid structured JSON for 95%+ requests.
3. Packaging scorecard always includes rubric scores and failure warnings.
4. Brief generation includes hook + retention checkpoints for every brief.
5. Learning ingest updates future idea ranking after one feedback cycle.
6. Empty/new channel still works via niche-only mode.
7. Rate-limit and API-failure fallback returns recoverable user messaging.
8. Prompt injection in user input does not break output schema.

## Rollout Plan (4-6 Weeks)
1. Week 1: auth, schema, YouTube sync, baseline stats.
2. Week 2: idea generation pipeline + UI list.
3. Week 3: packaging lab + scoring rubric + explanation UI.
4. Week 4: brief generator + export.
5. Week 5: learning loop + insight memory.
6. Week 6: stabilization, analytics, paywall, launch readiness.

## Success Metrics
1. Activation: user connects channel and generates first idea batch within 15 minutes.
2. Core value: at least 60% of activated users save at least one scored package.
3. Output lift: users report increased weekly upload consistency after 3 weeks.
4. Retention: week-4 retention above 25% for activated users.
5. Revenue: conversion from free to lifetime plan above 5% in first cohort.

## Assumptions and Defaults
1. Web app is superior to extension for MVP due to faster AI workflow iteration and fewer browser-permission constraints.
2. Scorecard + rationale is more trustworthy than synthetic A/B predictions at launch.
3. English-only is sufficient for first validation.
4. Lifetime pricing is accepted for MVP validation, with possible later migration to hybrid pricing.
5. YouTube API access and quota are available for expected early cohort usage.
