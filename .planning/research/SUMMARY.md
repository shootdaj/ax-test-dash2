# Research Summary: Real-Time Analytics Dashboard

## Stack Decision

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Runtime | Node.js | 20 LTS | Project requirement, Vercel-compatible |
| Backend | Express | 4.x | Lightweight, standard, serverless-friendly |
| Frontend | Vanilla JS | ES2022 | No build step, simple Vercel deployment |
| Charts | Chart.js | 4.x | Feature-rich, lightweight, canvas-based |
| Layout | CSS Grid | Native | No deps, responsive dashboard grids |
| Styling | CSS Custom Properties | Native | Dark theme theming, no preprocessor needed |
| Storage | In-memory | N/A | Project requirement, no external services |
| Deploy | Vercel | Latest | Project requirement, serverless |

## Table Stakes Features

1. **Simulated metrics** — CPU, memory, req/sec, error rate with realistic patterns
2. **Time-series storage** — in-memory with retention limits and seed data
3. **Aggregation** — min/max/avg/p95/p99 over configurable windows
4. **Threshold alerts** — configurable rules with visual indicators
5. **Dark theme dashboard** — line charts, gauges, sparklines, responsive grid
6. **Live polling** — 3-5 second update interval

## Critical Architecture Decisions

1. **On-demand data generation** — Vercel serverless has no persistent background process. Generate/backfill data points on each request rather than using setInterval.
2. **Deterministic simulation** — Use timestamp-based seeding so data is consistent and fills gaps naturally.
3. **Memory bounds** — Cap all arrays, prune on insert, never unbounded storage.

## Top Risks

1. Serverless cold starts reset in-memory state → seed data on init
2. No background process in Vercel → on-demand data generation
3. Chart.js perf with large datasets → limit to 100 points per chart
4. Vercel routing → careful vercel.json + full path Express routes

## Build Sequence

1. Backend core (simulator, store, aggregation, API)
2. Alert engine and extended API
3. Frontend (dark theme, all chart types, alert UI)
4. Polish (responsive layout, dashboard config, integration)
