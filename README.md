# Hub — Personal Operations Dashboard

A calm, always-on personal dashboard for an iPad home screen: flight training progress, live airport weather, school schedule, tasks, and calendar in one glanceable view. Built as a static React app — no backend, no login, all data lives in the browser on your device.

## What's inside

- **React 19 + TypeScript + Vite 8**
- **Tailwind CSS v4** for styling, **Framer Motion** for animation, **Lucide** icons
- **Live data, no API keys required:**
  - Weather — [Open-Meteo](https://open-meteo.com/)
  - METAR / TAF — [Aviation Weather Center](https://aviationweather.gov/)
- **Drag-to-reorder widget grid** ([dnd-kit](https://dndkit.com/))
- **PWA** — installable to the iPad home screen, works full-screen, caches itself for offline load (`vite-plugin-pwa`)
- **Persistence** — tasks, calendar events, class schedule, flight hours, quick links, and all settings are saved to `localStorage`. Nothing is sent to a server.

## Widgets

| Widget | Notes |
|---|---|
| Daily Overview | Greeting, next event, remaining task count |
| Weather | Current conditions, 24-hr hourly strip, 7-day forecast |
| Airport | Live METAR/TAF, flight category (VFR/MVFR/IFR/LIFR), crosswind calculator, density altitude, NOTAM link |
| Calendar | Add/remove events, today + upcoming list |
| Tasks | Categories (School/Aviation/Personal/Maintenance), priority, due dates |
| Flight Progress | Certificate/rating progress bars, total hours, currency goals |
| School | Class schedule, assignments |
| Quick Launch | Custom shortcut buttons (ForeFlight, Canvas, email, etc.) |

Tap any widget to open its detail view. Drag the grip icon (visible on hover) to reorder. All of this is configurable from the settings gear in the top right — name, home airport, home location (for weather), theme, accent color, and which widgets are enabled.

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

```bash
npm run build      # production build -> dist/
npm run preview    # serve the production build locally
```

## Deploying: GitHub + Netlify

### 1. Push to GitHub

From inside the project folder:

```bash
git init
git add .
git commit -m "Initial commit: Hub dashboard"
```

Create a new empty repo on GitHub (no README/license, so it stays empty), then:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Netlify

**Option A — connect the repo (recommended, auto-deploys on every push):**

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
2. Choose GitHub, authorize Netlify, and select your repo.
3. Build settings are already defined in `netlify.toml` (build command `npm run build`, publish directory `dist`) — Netlify will detect them automatically. Just click **Deploy**.
4. Every future `git push` to `main` redeploys automatically.

**Option B — drag and drop (no GitHub needed, but no auto-deploy):**

1. Run `npm run build` locally.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the `dist` folder in.

### 3. Add to iPad home screen

1. Open the deployed Netlify URL in Safari on the iPad.
2. Tap the Share icon → **Add to Home Screen**.
3. Launch it from the home screen icon — it runs full-screen with no browser chrome.

## Notes on scope / what's simplified from the original spec

To keep this a static site deployable for free on Netlify with zero paid services or servers:

- **No account system / Supabase / Firebase auth** — this is a single-user personal device dashboard, so all data is stored locally in the browser instead. If you later want the same data to sync across devices (e.g. iPad + phone), that's the natural point to add a small backend (Supabase's free tier works well) — the data layer is isolated in `src/lib/data.ts` and `src/lib/storage.ts` so it can be swapped for real API calls without touching the widgets.
- **Calendar is manual-entry**, not connected to Apple Calendar (CalDAV) or Google Calendar — both require an OAuth backend, which means a server. The `CalendarEvent` type and widget are already shaped to accept synced events if you add that later.
- **Airport data**: the Aviation Weather Center API is public and requires no key. If aviationweather.gov ever changes its CORS policy, that widget would need a tiny proxy function (a single Netlify Function is enough — no other backend needed) — it's an easy add if it comes up.

Everything else from the brief — widget grid, drag/resize positioning (currently reorder; resize can be added), live weather, live METAR/TAF, flight progress, tasks, school, quick launch, theming, PWA — is implemented and working today.
