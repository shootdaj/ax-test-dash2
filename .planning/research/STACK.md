# Stack Research: Real-Time Analytics Dashboard

## Recommended Stack

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Express 4.x — lightweight, well-suited for API endpoints and serving static files
- **No database:** In-memory storage using plain JS objects/arrays — sufficient for simulated data

### Frontend
- **No framework needed:** Vanilla JS with modern ES modules
- **Charts:** Chart.js 4.x (14k+ GitHub stars, lightweight, canvas-based, great for real-time updates)
- **Layout:** CSS Grid for responsive dashboard layout
- **Styling:** CSS custom properties for dark theme theming

### Deployment
- **Platform:** Vercel (serverless functions)
- **Entry point:** `api/index.js` exporting Express app
- **Static files:** Served from `public/` directory

## Rationale

| Choice | Why | Confidence |
|--------|-----|------------|
| Express | Standard for Node.js APIs, Vercel-compatible | High |
| Chart.js | Best balance of features/size for dashboards, supports line/gauge/bar charts | High |
| Vanilla JS | No build step needed, keeps deployment simple for Vercel | High |
| CSS Grid | Native, no dependencies, perfect for responsive dashboard layouts | High |
| In-memory storage | Project requirement, simplifies deployment | High |

## What NOT to Use

| Library | Why Not |
|---------|---------|
| D3.js | Overkill for this scope, steep learning curve |
| React/Vue/Angular | Adds build complexity, unnecessary for a single-page dashboard |
| Socket.io | WebSockets add complexity on Vercel serverless; polling is simpler and sufficient |
| Grafana/Prometheus | Full monitoring stacks — we're building a custom lightweight version |
| TypeScript | Adds build step, unnecessary for this scope |

## Key Dependencies

```json
{
  "express": "^4.21.0",
  "chart.js": "^4.4.0"
}
```

Chart.js will be loaded via CDN on the frontend. Only Express is a server dependency.
