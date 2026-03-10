'use strict';

const express = require('express');
const { getStore } = require('./store');
const { aggregate, isValidWindow, SUPPORTED_WINDOWS } = require('./aggregation');
const { getAlertEngine } = require('./alerts');
const { METRIC_NAMES, METRIC_UNITS, generateDataPoint } = require('./simulator');

const router = express.Router();

/**
 * GET /api/metrics/current
 * Returns latest values for all metrics
 */
router.get('/api/metrics/current', (req, res) => {
  const store = getStore();

  // Generate a fresh data point for each metric and add to store
  const now = Date.now();
  for (const metric of METRIC_NAMES) {
    const point = generateDataPoint(metric, now);
    store.addPoint(metric, point);
  }

  // Evaluate alerts with current values
  const alertEngine = getAlertEngine();
  alertEngine.evaluate(store.getAllLatest());

  const current = store.getAllLatest();
  const result = {};

  for (const metric of METRIC_NAMES) {
    const data = current[metric];
    result[metric] = {
      value: data ? data.value : null,
      timestamp: data ? data.timestamp : null,
      unit: METRIC_UNITS[metric]
    };
  }

  res.json({
    metrics: result,
    activeAlerts: alertEngine.getActive().length,
    timestamp: now
  });
});

/**
 * GET /api/metrics/history
 * Returns time-series data for a specific metric
 * Query params: metric (required), window (optional, default 15m)
 */
router.get('/api/metrics/history', (req, res) => {
  const { metric, window = '15m' } = req.query;

  if (!metric || !METRIC_NAMES.includes(metric)) {
    return res.status(400).json({
      error: 'Invalid or missing metric parameter',
      validMetrics: METRIC_NAMES
    });
  }

  const store = getStore();
  const points = store.getHistory(metric, window);

  res.json({
    metric,
    window,
    unit: METRIC_UNITS[metric],
    count: points.length,
    data: points
  });
});

/**
 * GET /api/metrics/aggregation
 * Returns aggregated stats for a metric over a time window
 * Query params: metric (required), window (optional, default 15m)
 */
router.get('/api/metrics/aggregation', (req, res) => {
  const { metric, window = '15m' } = req.query;

  if (!metric || !METRIC_NAMES.includes(metric)) {
    return res.status(400).json({
      error: 'Invalid or missing metric parameter',
      validMetrics: METRIC_NAMES
    });
  }

  if (!isValidWindow(window)) {
    return res.status(400).json({
      error: 'Invalid window parameter',
      validWindows: SUPPORTED_WINDOWS
    });
  }

  const store = getStore();
  const points = store.getHistory(metric, window);
  const stats = aggregate(points);

  res.json({
    metric,
    window,
    unit: METRIC_UNITS[metric],
    ...stats
  });
});

/**
 * GET /api/alerts
 * Returns currently active alerts
 */
router.get('/api/alerts', (req, res) => {
  const alertEngine = getAlertEngine();
  res.json({
    active: alertEngine.getActive(),
    count: alertEngine.getActive().length
  });
});

/**
 * GET /api/alerts/history
 * Returns alert history
 * Query params: limit (optional, default 50)
 */
router.get('/api/alerts/history', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  const alertEngine = getAlertEngine();
  const history = alertEngine.getHistory(limit);

  res.json({
    history,
    count: history.length
  });
});

/**
 * GET /api/dashboard/config
 * Returns dashboard layout configuration
 */
router.get('/api/dashboard/config', (req, res) => {
  res.json({
    title: 'Real-Time Analytics Dashboard',
    refreshInterval: 3000,
    metrics: METRIC_NAMES.map(name => ({
      name,
      unit: METRIC_UNITS[name],
      chartType: 'line',
      showGauge: true,
      showSparkline: true
    })),
    layout: {
      columns: 2,
      widgets: [
        { id: 'overview', type: 'metric-cards', position: { row: 0, col: 0, colspan: 2 } },
        { id: 'cpu-chart', type: 'time-series', metric: 'cpu', position: { row: 1, col: 0 } },
        { id: 'memory-chart', type: 'time-series', metric: 'memory', position: { row: 1, col: 1 } },
        { id: 'requests-chart', type: 'time-series', metric: 'requestsPerSec', position: { row: 2, col: 0 } },
        { id: 'errors-chart', type: 'time-series', metric: 'errorRate', position: { row: 2, col: 1 } },
        { id: 'heatmap', type: 'heatmap', position: { row: 3, col: 0, colspan: 2 } }
      ]
    },
    alertRules: getAlertEngine().getRules()
  });
});

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  const store = getStore();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    metrics: {
      totalDataPoints: store.getTotalSize(),
      metricsTracked: METRIC_NAMES.length
    }
  });
});

module.exports = router;
