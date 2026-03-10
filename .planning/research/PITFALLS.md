# Pitfalls Research: Real-Time Analytics Dashboard

## Critical Pitfalls

### 1. Memory Leaks in Time-Series Storage
**Risk:** Unbounded arrays grow until process crashes
**Warning signs:** Increasing memory usage over time, eventual OOM
**Prevention:**
- Cap array sizes with configurable retention
- Prune old data on every insert
- Track array sizes in health endpoint
**Phase:** Phase 1 (must be built into store from the start)

### 2. Vercel Serverless Cold Starts Reset State
**Risk:** In-memory data lost on every cold start, dashboard shows empty
**Warning signs:** Empty dashboard after idle periods
**Prevention:**
- Generate seed data on module initialization (not in request handler)
- Seed data should cover the last hour so charts aren't empty
- Accept that data resets on cold starts — document this as a known limitation
**Phase:** Phase 1

### 3. Simulator Running in Serverless Context
**Risk:** Vercel serverless functions only run during requests — no persistent background process
**Warning signs:** No new data points between requests
**Prevention:**
- Generate data on-demand when requests come in, not via setInterval
- On each request, fill in any "gaps" since the last request with simulated points
- OR: generate the full time-series history deterministically based on timestamps
**Phase:** Phase 1 (fundamental architecture decision)

### 4. Chart.js Performance with Large Datasets
**Risk:** Rendering thousands of data points causes janky updates
**Warning signs:** Laggy charts, high CPU in browser
**Prevention:**
- Limit displayed data points (e.g., max 100 per chart)
- Downsample server-side for longer time windows
- Use `animation: false` for real-time updates
**Phase:** Phase 3

### 5. Polling Frequency vs Serverless Costs
**Risk:** Aggressive polling keeps functions warm but increases costs
**Warning signs:** High function invocation count
**Prevention:**
- Default to 3-5 second polling interval
- Consider adaptive polling (slower when idle)
**Phase:** Phase 3

## Minor Pitfalls

### 6. Percentile Calculation Edge Cases
**Risk:** p95/p99 on small datasets gives misleading results
**Prevention:** Return null for aggregations with < 20 data points

### 7. Chart.js Dark Theme Integration
**Risk:** Default Chart.js colors designed for light backgrounds
**Prevention:** Set Chart.js defaults for colors, grid lines, and text at initialization

### 8. Vercel Route Configuration
**Risk:** Routes not matching, 404s on API calls
**Prevention:** Careful vercel.json configuration with correct rewrites. Express routes must use full paths (/api/metrics, not /metrics)
