'use strict';

/**
 * Metrics Simulator
 * Generates realistic CPU, memory, requests/sec, and error rate data
 * using random walks with mean reversion and occasional spikes.
 *
 * Data is generated deterministically based on timestamps so that
 * gaps can be filled on-demand (critical for Vercel serverless).
 */

// Seeded pseudo-random number generator (mulberry32)
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate a deterministic value for a metric at a given timestamp
function generateValue(metric, timestamp) {
  const seed = Math.floor(timestamp / 1000); // 1-second granularity
  const rng = mulberry32(seed + metricSeedOffset(metric));

  const base = metricBase(metric);
  const variance = metricVariance(metric);
  const min = metricMin(metric);
  const max = metricMax(metric);

  // Base value with random walk
  let value = base + (rng() - 0.5) * variance * 2;

  // Add time-of-day pattern (sinusoidal)
  const hourOfDay = (timestamp / 3600000) % 24;
  const dailyFactor = Math.sin((hourOfDay / 24) * Math.PI * 2 - Math.PI / 2) * 0.15;
  value += dailyFactor * base;

  // Occasional spikes (roughly 5% of the time)
  if (rng() < 0.05) {
    value += (rng() * variance * 2);
  }

  // Clamp to valid range
  return Math.max(min, Math.min(max, Math.round(value * 100) / 100));
}

function metricSeedOffset(metric) {
  const offsets = { cpu: 0, memory: 10000, requestsPerSec: 20000, errorRate: 30000 };
  return offsets[metric] || 0;
}

function metricBase(metric) {
  const bases = { cpu: 45, memory: 60, requestsPerSec: 150, errorRate: 2 };
  return bases[metric] || 50;
}

function metricVariance(metric) {
  const variances = { cpu: 25, memory: 15, requestsPerSec: 80, errorRate: 3 };
  return variances[metric] || 20;
}

function metricMin(metric) {
  const mins = { cpu: 0, memory: 10, requestsPerSec: 0, errorRate: 0 };
  return mins[metric] || 0;
}

function metricMax(metric) {
  const maxes = { cpu: 100, memory: 100, requestsPerSec: 500, errorRate: 100 };
  return maxes[metric] || 100;
}

const METRIC_NAMES = ['cpu', 'memory', 'requestsPerSec', 'errorRate'];

const METRIC_UNITS = {
  cpu: '%',
  memory: '%',
  requestsPerSec: 'req/s',
  errorRate: '%'
};

/**
 * Generate a single data point for a metric at a timestamp
 */
function generateDataPoint(metric, timestamp) {
  return {
    timestamp,
    value: generateValue(metric, timestamp)
  };
}

/**
 * Generate a range of data points for a metric
 * @param {string} metric - Metric name
 * @param {number} startTime - Start timestamp (ms)
 * @param {number} endTime - End timestamp (ms)
 * @param {number} intervalMs - Interval between points (ms), default 2000
 */
function generateRange(metric, startTime, endTime, intervalMs = 2000) {
  const points = [];
  for (let t = startTime; t <= endTime; t += intervalMs) {
    points.push(generateDataPoint(metric, t));
  }
  return points;
}

module.exports = {
  generateValue,
  generateDataPoint,
  generateRange,
  METRIC_NAMES,
  METRIC_UNITS
};
