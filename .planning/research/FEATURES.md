# Features Research: Real-Time Analytics Dashboard

## Table Stakes (Must Have)

### Data Generation
- Simulated CPU usage (0-100%)
- Simulated memory usage (0-100%)
- Simulated requests/sec (variable load)
- Simulated error rate (percentage)
- Realistic data patterns (not pure random — trends, spikes, normal variation)

### Data Storage & Retrieval
- Time-series in-memory storage with configurable retention
- Seed data on startup (so dashboard isn't empty)
- API endpoint for current metrics
- API endpoint for historical data with time range

### Aggregation
- Min, max, average over time windows
- P95 and P99 percentile calculations
- Configurable aggregation windows (1m, 5m, 15m, 1h)

### Visualization
- Line/area charts for time-series trends
- Current value display (gauge or big number)
- Sparklines for compact trends in cards/tiles
- Dark theme (standard for ops dashboards)
- Responsive layout

### Alerting
- Threshold-based rules (e.g., CPU > 90%)
- Visual alert indicators (banners, color changes)
- Alert history

## Differentiators (Nice to Have)

- Heat map for correlated metrics
- Dashboard configuration persistence
- Custom alert rule creation UI
- Export data as CSV/JSON
- Zoom/pan on charts

## Anti-Features (Don't Build)

- Real server monitoring agent — simulated only
- User accounts / auth — single public dashboard
- Email/SMS alert notifications — visual only
- Multi-dashboard support — single dashboard
- Data persistence across restarts — in-memory is fine
