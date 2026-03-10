# Requirements: ax-test-dash2

**Defined:** 2026-03-10
**Core Value:** Real-time visibility into system metrics with instant alerting when thresholds are breached

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Metrics Simulation

- [ ] **SIM-01**: System generates realistic CPU usage data (0-100%) with trends and occasional spikes
- [ ] **SIM-02**: System generates realistic memory usage data (0-100%) with gradual drift patterns
- [ ] **SIM-03**: System generates realistic requests/sec data with variable load patterns
- [ ] **SIM-04**: System generates realistic error rate data (0-100%) correlated with high load
- [ ] **SIM-05**: Simulated data is generated on-demand per request with timestamp-based determinism

### Data Storage

- [ ] **STOR-01**: System stores time-series data points as `{ timestamp, value }` per metric
- [ ] **STOR-02**: System seeds historical data on startup covering the last hour
- [ ] **STOR-03**: System enforces retention limits and prunes old data automatically
- [ ] **STOR-04**: System caps memory usage with configurable maximum data points per metric

### Aggregation

- [ ] **AGG-01**: System computes min value over a configurable time window
- [ ] **AGG-02**: System computes max value over a configurable time window
- [ ] **AGG-03**: System computes average value over a configurable time window
- [ ] **AGG-04**: System computes p95 percentile over a configurable time window
- [ ] **AGG-05**: System computes p99 percentile over a configurable time window
- [ ] **AGG-06**: System supports time windows of 1m, 5m, 15m, and 1h

### Alerting

- [ ] **ALRT-01**: System supports threshold-based alert rules with metric, operator, and value
- [ ] **ALRT-02**: System evaluates alert rules against current metric values
- [ ] **ALRT-03**: System tracks active alerts with timestamp and triggering value
- [ ] **ALRT-04**: System maintains alert history
- [ ] **ALRT-05**: System provides default alert rules for common thresholds (CPU > 90%, memory > 85%, error rate > 5%)

### API

- [ ] **API-01**: GET /api/metrics/current returns latest values for all metrics
- [ ] **API-02**: GET /api/metrics/history returns time-series data for a specific metric and time window
- [ ] **API-03**: GET /api/metrics/aggregation returns aggregated stats for a metric and window
- [ ] **API-04**: GET /api/alerts returns currently active alerts
- [ ] **API-05**: GET /api/alerts/history returns historical alert data
- [ ] **API-06**: GET /api/dashboard/config returns dashboard layout configuration
- [ ] **API-07**: GET /health returns service health status

### Frontend Visualization

- [ ] **VIS-01**: Dashboard displays real-time line/area charts for each metric's time-series data
- [ ] **VIS-02**: Dashboard displays gauge charts showing current value for each metric
- [ ] **VIS-03**: Dashboard displays sparklines for compact trend visualization in metric cards
- [ ] **VIS-04**: Dashboard displays a heat map visualization for multi-metric correlation
- [ ] **VIS-05**: Dashboard updates charts via polling every 3-5 seconds
- [ ] **VIS-06**: Dashboard uses a dark theme optimized for monitoring

### Frontend Layout

- [ ] **LAY-01**: Dashboard uses a responsive grid layout that adapts to screen sizes
- [ ] **LAY-02**: Dashboard displays alert banners for active alerts at the top
- [ ] **LAY-03**: Dashboard organizes widgets in a logical monitoring layout (overview, charts, details)

## v2 Requirements

### Enhanced Features

- **ENH-01**: User can customize dashboard layout via drag-and-drop
- **ENH-02**: User can create custom alert rules through the UI
- **ENH-03**: User can export metric data as CSV or JSON
- **ENH-04**: Dashboard supports zoom and pan on time-series charts

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real server monitoring | Project uses simulated data only |
| User authentication | Single public dashboard, no multi-user |
| Persistent storage | In-memory only per project requirements |
| WebSocket streaming | Polling simpler for Vercel serverless |
| Email/SMS notifications | Visual alerts only |
| Multi-dashboard support | Single dashboard instance |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SIM-01 | Phase 1 | Pending |
| SIM-02 | Phase 1 | Pending |
| SIM-03 | Phase 1 | Pending |
| SIM-04 | Phase 1 | Pending |
| SIM-05 | Phase 1 | Pending |
| STOR-01 | Phase 1 | Pending |
| STOR-02 | Phase 1 | Pending |
| STOR-03 | Phase 1 | Pending |
| STOR-04 | Phase 1 | Pending |
| AGG-01 | Phase 1 | Pending |
| AGG-02 | Phase 1 | Pending |
| AGG-03 | Phase 1 | Pending |
| AGG-04 | Phase 1 | Pending |
| AGG-05 | Phase 1 | Pending |
| AGG-06 | Phase 1 | Pending |
| ALRT-01 | Phase 2 | Pending |
| ALRT-02 | Phase 2 | Pending |
| ALRT-03 | Phase 2 | Pending |
| ALRT-04 | Phase 2 | Pending |
| ALRT-05 | Phase 2 | Pending |
| API-01 | Phase 2 | Pending |
| API-02 | Phase 2 | Pending |
| API-03 | Phase 2 | Pending |
| API-04 | Phase 2 | Pending |
| API-05 | Phase 2 | Pending |
| API-06 | Phase 2 | Pending |
| API-07 | Phase 2 | Pending |
| VIS-01 | Phase 3 | Pending |
| VIS-02 | Phase 3 | Pending |
| VIS-03 | Phase 3 | Pending |
| VIS-04 | Phase 3 | Pending |
| VIS-05 | Phase 3 | Pending |
| VIS-06 | Phase 3 | Pending |
| LAY-01 | Phase 4 | Pending |
| LAY-02 | Phase 4 | Pending |
| LAY-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 35 total
- Mapped to phases: 35
- Unmapped: 0

---
*Requirements defined: 2026-03-10*
*Last updated: 2026-03-10 after initial definition*
