# Architecture Research: Real-Time Analytics Dashboard

## Component Overview

```
┌─────────────────────────────────────────────┐
│              Frontend (Browser)              │
│  ┌─────────┐ ┌─────────┐ ┌───────────────┐  │
│  │ Charts  │ │ Gauges  │ │ Alert Banner  │  │
│  │(Chart.js)│ │         │ │               │  │
│  └────┬────┘ └────┬────┘ └──────┬────────┘  │
│       └───────────┼─────────────┘            │
│              Polling Layer                   │
│         (fetch every 2-5 seconds)            │
└─────────────────┬───────────────────────────┘
                  │ HTTP GET /api/metrics
                  │ HTTP GET /api/alerts
┌─────────────────┴───────────────────────────┐
│              Backend (Express)               │
│  ┌──────────────┐  ┌─────────────────────┐   │
│  │  API Routes  │  │  Metrics Simulator  │   │
│  │  /api/*      │  │  (generates data)   │   │
│  └──────┬───────┘  └─────────┬───────────┘   │
│         │                    │               │
│  ┌──────┴────────────────────┴───────────┐   │
│  │         In-Memory Store               │   │
│  │  - Time-series arrays                 │   │
│  │  - Aggregation cache                  │   │
│  │  - Alert state                        │   │
│  │  - Dashboard config                   │   │
│  └───────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

## Components

### 1. Metrics Simulator (`src/simulator.js`)
- Generates realistic metric values using random walks with mean reversion
- Runs on an interval (every 1-2 seconds)
- Produces: CPU %, memory %, req/sec, error rate
- Includes occasional spikes and anomalies for realism

### 2. Time-Series Store (`src/store.js`)
- In-memory arrays per metric
- Each data point: `{ timestamp, value }`
- Configurable retention (e.g., last 1 hour)
- Auto-pruning of old data
- Seed data generation on startup

### 3. Aggregation Engine (`src/aggregation.js`)
- Computes min, max, avg, p95, p99 over time windows
- Supports multiple window sizes (1m, 5m, 15m, 1h)
- Called on-demand per API request (not pre-computed)

### 4. Alert Engine (`src/alerts.js`)
- Threshold-based rules (e.g., `{ metric: "cpu", operator: ">", value: 90 }`)
- Evaluates on each new data point
- Tracks active alerts and alert history
- Default rules for common thresholds

### 5. API Routes (`src/routes.js`)
- `GET /api/metrics/current` — latest values for all metrics
- `GET /api/metrics/history?metric=cpu&window=15m` — time-series data
- `GET /api/metrics/aggregation?metric=cpu&window=5m` — aggregated stats
- `GET /api/alerts` — active alerts
- `GET /api/alerts/history` — alert history
- `GET /api/dashboard/config` — dashboard layout configuration
- `GET /health` — health check

### 6. Frontend (`public/`)
- `index.html` — dashboard shell with responsive grid
- `css/dashboard.css` — dark theme styles
- `js/app.js` — main application, polling, chart management
- `js/charts.js` — Chart.js wrapper for time-series charts
- `js/gauges.js` — gauge chart implementations
- `js/sparklines.js` — sparkline mini-charts
- `js/heatmap.js` — heat map visualization
- `js/alerts.js` — alert banner management

## Data Flow

1. Simulator generates data points every 1-2 seconds
2. Data points stored in time-series store
3. Alert engine evaluates each new point against rules
4. Frontend polls `/api/metrics/current` every 2-5 seconds
5. Frontend periodically fetches history for chart updates
6. Charts, gauges, sparklines update with new data
7. Alert banner shows/hides based on active alerts

## Build Order

1. **Phase 1:** Backend core — simulator, store, aggregation, basic API
2. **Phase 2:** Alert engine and remaining API endpoints
3. **Phase 3:** Frontend — dark theme, charts, gauges, sparklines, heat map, alerts UI
4. **Phase 4:** Polish — responsive grid, dashboard config, integration testing
