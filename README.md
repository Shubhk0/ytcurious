# YTCurious

AI copilot MVP for YouTube creators focused on:
- Idea generation
- Packaging scoring (title + thumbnail concepts)
- Retention-aware creative brief generation
- Learning loop ingestion

## Tech
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Static export for GitHub Pages
- Free public API integrations (no paid backend required for MVP demo)

## Run locally
1. Install dependencies:
   - `npm install`
2. Start dev server:
   - `npm run dev`
3. Open:
   - `http://localhost:3000`
   - Dashboard: `http://localhost:3000/app`

## GitHub Pages deploy
1. Push this project to GitHub.
2. In repo settings, enable Pages and set source to "GitHub Actions".
3. Merge to `main`.
4. Workflow `.github/workflows/deploy-pages.yml` will build, deploy `out/`, and run a smoke check against the deployed URL.

## Autopilot mode
- `.github/workflows/autopilot-updates.yml` runs every Monday at 06:00 UTC (and manually on demand).
- It upgrades npm dependencies, validates build, commits changes to `main`, and pushes automatically.
- That push triggers `.github/workflows/deploy-pages.yml`, so GitHub Pages stays up to date with no manual deploy.

One-time repo settings to confirm:
1. `Settings -> Actions -> General -> Workflow permissions`: set to `Read and write permissions`.
2. `Settings -> Pages`: source should remain `GitHub Actions`.

## Implemented in this scaffold (static-safe)
- Landing page and MVP dashboard UI.
- Client-side workflow for:
  - channel sync simulation
  - idea generation
  - packaging scoring
  - creative brief generation
  - learning loop insights
- No server APIs required for MVP preview.

## Free APIs currently used
- Wikipedia OpenSearch + Summary API
  - Fetches topic context to enrich idea generation.
- Datamuse API
  - Fetches semantically related terms to diversify title angles.
- YouTube oEmbed endpoint
  - Fetches public metadata (title/author/thumbnail) for pasted video URL.

All calls are client-side with graceful fallback when an endpoint fails.

## Next implementation steps
 - Add hosted backend (separate service) for:
   - YouTube OAuth + analytics fetch
   - persistent storage
   - real LLM calls
 - Connect frontend to backend using public HTTPS endpoints.
 - Add auth and billing.
