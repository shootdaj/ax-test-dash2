'use strict';

/**
 * Aggregation Engine
 *
 * Computes statistical aggregations over time-series data:
 * min, max, avg, p95, p99 over configurable windows.
 */

/**
 * Compute aggregation stats for an array of data points
 * @param {Array<{timestamp: number, value: number}>} points
 * @returns {object} Aggregation result
 */
function aggregate(points) {
  if (!points || points.length === 0) {
    return {
      count: 0,
      min: null,
      max: null,
      avg: null,
      p95: null,
      p99: null
    };
  }

  const values = points.map(p => p.value).sort((a, b) => a - b);
  const count = values.length;

  // Need minimum sample size for meaningful percentiles
  const hasEnoughData = count >= 20;

  return {
    count,
    min: values[0],
    max: values[count - 1],
    avg: Math.round((values.reduce((s, v) => s + v, 0) / count) * 100) / 100,
    p95: hasEnoughData ? percentile(values, 0.95) : null,
    p99: hasEnoughData ? percentile(values, 0.99) : null
  };
}

/**
 * Calculate percentile value from sorted array
 * Uses the nearest-rank method
 * @param {number[]} sortedValues - Sorted array of numbers
 * @param {number} p - Percentile (0-1), e.g. 0.95 for p95
 * @returns {number}
 */
function percentile(sortedValues, p) {
  if (sortedValues.length === 0) return null;
  if (sortedValues.length === 1) return sortedValues[0];

  const index = Math.ceil(p * sortedValues.length) - 1;
  return sortedValues[Math.min(index, sortedValues.length - 1)];
}

/**
 * Supported aggregation windows
 */
const SUPPORTED_WINDOWS = ['1m', '5m', '15m', '1h'];

/**
 * Validate that a window string is supported
 */
function isValidWindow(window) {
  return SUPPORTED_WINDOWS.includes(window);
}

module.exports = {
  aggregate,
  percentile,
  SUPPORTED_WINDOWS,
  isValidWindow
};
