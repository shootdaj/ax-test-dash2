# ax-test-dash2

## What This Is

A real-time analytics dashboard that displays simulated server metrics (CPU, memory, requests/sec, error rate) with live-updating visualizations. Built as a Node.js web app deployed to Vercel, it provides time-series data storage, statistical aggregation, threshold-based alerting, and a dark-themed responsive frontend with charts, gauges, sparklines, and heat maps.

## Core Value

Real-time visibility into system metrics with instant alerting when thresholds are breached — the dashboard must show live-updating data and surface alerts immediately.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Simulated metrics engine generating CPU, memory, requests/sec, and error rate data
- [ ] In-memory time-series storage with seed data on startup
- [ ] Statistical aggregation: min, max, avg, p95, p99 over configurable windows
- [ ] Threshold-based alert rules with configurable conditions
- [ ] Dashboard configuration system for layout and widget settings
- [ ] Live polling API endpoint for real-time data
- [ ] Dark-themed responsive frontend
- [ ] Real-time line/area charts for time-series data
- [ ] Gauge charts for current metric values
- [ ] Sparklines for compact trend visualization
- [ ] Heat map visualization for multi-dimensional data
- [ ] Alert banners showing active alerts
- [ ] Responsive grid layout adapting to screen sizes

### Out of Scope

- Persistent database storage — in-memory only for this version
- User authentication — public dashboard
- Multi-tenant/multi-user — single dashboard instance
- Real metrics collection from actual servers — simulated only
- WebSocket-based streaming — polling-based updates

## Context

This is a dogfooding test for the AX build system. The project exercises both backend API development and frontend visualization work, making it a good test of AX's full lifecycle including the frontend design step. The stack is Node.js with Express, deployed to Vercel as a serverless function.

## Constraints

- **Stack**: Node.js with Express backend, vanilla JS or lightweight frontend framework
- **Deployment**: Vercel serverless (api/index.js entry point)
- **Storage**: In-memory only — no external databases or services needed
- **Data**: Simulated/generated metrics, not real server monitoring

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| In-memory storage | Simplicity, no external deps, sufficient for demo | — Pending |
| Simulated metrics | Eliminates need for real infrastructure monitoring | — Pending |
| Polling over WebSockets | Simpler Vercel deployment, sufficient update frequency | — Pending |
| Dark theme | Standard for monitoring dashboards, reduces eye strain | — Pending |

---
*Last updated: 2026-03-10 after initialization*
