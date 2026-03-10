# Roadmap: ax-test-dash2

## Overview

| # | Phase | Goal | Requirements | Plans |
|---|-------|------|--------------|-------|
| 1 | Backend Core | Build metrics simulator, time-series store, and aggregation engine | SIM-01..05, STOR-01..04, AGG-01..06 | 3 |
| 2 | Alerting & API | Build alert engine and all REST API endpoints | ALRT-01..05, API-01..07 | 3 |
| 3 | Frontend Visualization | Build dark-themed dashboard with all chart types and live polling | VIS-01..06 | 3 |
| 4 | Layout & Polish | Responsive grid layout, alert banners, and end-to-end integration | LAY-01..03 | 2 |

---

## Phase 1: Backend Core

**Goal:** Build the metrics simulation engine, in-memory time-series store with seed data, and statistical aggregation engine.

**Requirements:** SIM-01, SIM-02, SIM-03, SIM-04, SIM-05, STOR-01, STOR-02, STOR-03, STOR-04, AGG-01, AGG-02, AGG-03, AGG-04, AGG-05, AGG-06

**Success Criteria:**
1. Simulator generates realistic CPU, memory, req/sec, and error rate values with natural variation
2. Store holds time-series data with automatic pruning at retention limits
3. Seed data populates the last hour of history on startup
4. Aggregation computes min/max/avg/p95/p99 correctly over 1m/5m/15m/1h windows
5. All unit tests pass for simulator, store, and aggregation modules

---

## Phase 2: Alerting & API

**Goal:** Build the threshold-based alert engine with default rules and expose all functionality through REST API endpoints.

**Requirements:** ALRT-01, ALRT-02, ALRT-03, ALRT-04, ALRT-05, API-01, API-02, API-03, API-04, API-05, API-06, API-07

**Success Criteria:**
1. Alert engine evaluates threshold rules and tracks active/historical alerts
2. Default alert rules fire correctly for CPU > 90%, memory > 85%, error rate > 5%
3. All 7 API endpoints return correct data with proper JSON format
4. Health endpoint returns 200 with status information
5. API integration tests verify all endpoints with test data

---

## Phase 3: Frontend Visualization

**Goal:** Build the dark-themed dashboard frontend with real-time line charts, gauge charts, sparklines, heat map, and live polling.

**Requirements:** VIS-01, VIS-02, VIS-03, VIS-04, VIS-05, VIS-06

**Success Criteria:**
1. Dashboard renders with dark theme and professional monitoring aesthetics
2. Line/area charts display time-series data for all 4 metrics
3. Gauge charts show current values with color-coded thresholds
4. Sparklines display compact trends in metric overview cards
5. Heat map visualizes multi-metric correlation data
6. Polling fetches and renders new data every 3-5 seconds without memory leaks

---

## Phase 4: Layout & Polish

**Goal:** Implement responsive grid layout, alert banners, and finalize end-to-end integration with comprehensive testing.

**Requirements:** LAY-01, LAY-02, LAY-03

**Success Criteria:**
1. Dashboard grid adapts correctly to desktop, tablet, and mobile viewport sizes
2. Alert banners appear/disappear at the top when alerts trigger/clear
3. Widget layout follows logical monitoring hierarchy (overview -> charts -> details)
4. All scenario tests pass covering full user workflows
5. Application works correctly when deployed to Vercel

---

*Roadmap created: 2026-03-10*
*Total phases: 4 | Total v1 requirements: 35 | Coverage: 100%*
