# Today's Store Actions

A mobile-first store operations prototype for H&M managers built in React and Vite. The app helps answer, within seconds, the question: "What are the three most important things I should act on today?"

## Features

- **Today**: store performance (sales vs target and last year, traffic, conversion, basket) and three prioritized actions with owner, deadline and estimated impact
- **Action detail**: evidence, likely causes, recommended next step, confidence and limitations
- **Stock**: replenishment recommendations that keep three hours of sales on the floor, plus returns and product-quality alerts
- **Insights**: business insights and sales, traffic and conversion trends (each chart has a data-table view)
- **Store Intelligence assistant**: deterministic mocked answers built from the same data as the screens, with Thinking Orbs processing states
- Demo controls for scenarios, stale/offline data, a missing stock count and assistant failure
- Light/dark theme, local persistence, mobile bottom navigation and a desktop layout

## Stack

- React + TypeScript
- Vite
- Recharts
- Plain CSS with design tokens (`src/index.css`); no Tailwind or shadcn/ui
- Lucide React
- thinking-orbs
- @lucasmarkes/hairline

## Run locally

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Open the app at http://localhost:5173

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build   # typechecks, then builds
```

## Demo flow

1. Open the overview screen.
2. Review the three priority actions.
3. Open the highest-priority action detail.
4. Ask the assistant a follow-up question.
5. Switch scenarios or simulate stale/offline states in Settings.

## Mock data and scoring

The prototype uses fictional data for Stockholm City, with a reference date of 19 October 2026. Priorities are derived from a transparent formula that weights business impact, urgency, confidence, and actionability.

## Limitations

- Local mock data only; no backend or authentication.
- Assistant is simulated rather than connected to a live LLM.
- This is a prototype for hackathon demonstration purposes.
