'use strict';

const { generateRange, METRIC_NAMES } = require('./simulator');

/**
 * In-Memory Time-Series Store
 *
 * Stores data points per metric with configurable retention and max points.
 * Seeds historical data on initialization.
 */

const DEFAULT_MAX_POINTS = 1800; // ~1 hour at 2-second intervals
const DEFAULT_RETENTION_MS = 3600 * 1000; // 1 hour
const SEED_INTERVAL_MS = 2000; // 2-second intervals for seed data

class TimeSeriesStore {
  constructor(options = {}) {
    this.maxPoints = options.maxPoints || DEFAULT_MAX_POINTS;
    this.retentionMs = options.retentionMs || DEFAULT_RETENTION_MS;
    this.data = {};

    for (const metric of METRIC_NAMES) {
      this.data[metric] = [];
    }

    // Seed with historical data
    if (options.seed !== false) {
      this.seed();
    }
  }

  /**
   * Seed the store with historical data covering the retention window
   */
  seed() {
    const now = Date.now();
    const start = now - this.retentionMs;

    for (const metric of METRIC_NAMES) {
      this.data[metric] = generateRange(metric, start, now, SEED_INTERVAL_MS);
      this._prune(metric);
    }
  }

  /**
   * Add a data point to a metric's time series
   */
  addPoint(metric, point) {
    if (!this.data[metric]) {
      this.data[metric] = [];
    }

    this.data[metric].push(point);
    this._prune(metric);

    return point;
  }

  /**
   * Get latest data point for a metric
   */
  getLatest(metric) {
    const series = this.data[metric];
    if (!series || series.length === 0) return null;
    return series[series.length - 1];
  }

  /**
   * Get latest data points for all metrics
   */
  getAllLatest() {
    const result = {};
    for (const metric of METRIC_NAMES) {
      result[metric] = this.getLatest(metric);
    }
    return result;
  }

  /**
   * Get time-series data for a metric within a time window
   * @param {string} metric - Metric name
   * @param {string} window - Time window string (1m, 5m, 15m, 1h)
   */
  getHistory(metric, window = '15m') {
    const series = this.data[metric];
    if (!series) return [];

    const windowMs = parseWindow(window);
    const cutoff = Date.now() - windowMs;

    return series.filter(p => p.timestamp >= cutoff);
  }

  /**
   * Get the number of data points stored for a metric
   */
  getSize(metric) {
    return (this.data[metric] || []).length;
  }

  /**
   * Get total data points across all metrics
   */
  getTotalSize() {
    let total = 0;
    for (const metric of METRIC_NAMES) {
      total += this.getSize(metric);
    }
    return total;
  }

  /**
   * Prune old data points beyond retention limit and max points cap
   */
  _prune(metric) {
    const series = this.data[metric];
    if (!series) return;

    // Remove points beyond retention
    const cutoff = Date.now() - this.retentionMs;
    while (series.length > 0 && series[0].timestamp < cutoff) {
      series.shift();
    }

    // Cap at max points
    while (series.length > this.maxPoints) {
      series.shift();
    }
  }
}

/**
 * Parse a window string like '5m', '1h' into milliseconds
 */
function parseWindow(window) {
  const match = window.match(/^(\d+)(m|h|s)$/);
  if (!match) return 15 * 60 * 1000; // default 15m

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 3600 * 1000;
    default: return 15 * 60 * 1000;
  }
}

// Singleton store instance
let storeInstance = null;

function getStore(options) {
  if (!storeInstance) {
    storeInstance = new TimeSeriesStore(options);
  }
  return storeInstance;
}

function resetStore() {
  storeInstance = null;
}

module.exports = {
  TimeSeriesStore,
  getStore,
  resetStore,
  parseWindow
};
