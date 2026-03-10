'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { aggregate, percentile, SUPPORTED_WINDOWS, isValidWindow } = require('../../src/aggregation');

describe('Aggregation', () => {
  describe('aggregate', () => {
    it('returns nulls for empty array', () => {
      const result = aggregate([]);
      assert.strictEqual(result.count, 0);
      assert.strictEqual(result.min, null);
      assert.strictEqual(result.max, null);
      assert.strictEqual(result.avg, null);
      assert.strictEqual(result.p95, null);
      assert.strictEqual(result.p99, null);
    });

    it('returns nulls for null input', () => {
      const result = aggregate(null);
      assert.strictEqual(result.count, 0);
    });

    it('computes correct min', () => {
      const points = [
        { timestamp: 1, value: 10 },
        { timestamp: 2, value: 5 },
        { timestamp: 3, value: 20 }
      ];
      assert.strictEqual(aggregate(points).min, 5);
    });

    it('computes correct max', () => {
      const points = [
        { timestamp: 1, value: 10 },
        { timestamp: 2, value: 5 },
        { timestamp: 3, value: 20 }
      ];
      assert.strictEqual(aggregate(points).max, 20);
    });

    it('computes correct average', () => {
      const points = [
        { timestamp: 1, value: 10 },
        { timestamp: 2, value: 20 },
        { timestamp: 3, value: 30 }
      ];
      assert.strictEqual(aggregate(points).avg, 20);
    });

    it('rounds average to 2 decimal places', () => {
      const points = [
        { timestamp: 1, value: 1 },
        { timestamp: 2, value: 2 },
        { timestamp: 3, value: 3 }
      ];
      assert.strictEqual(aggregate(points).avg, 2);
    });

    it('returns null p95/p99 for < 20 data points', () => {
      const points = Array.from({ length: 10 }, (_, i) => ({
        timestamp: i,
        value: i * 10
      }));
      const result = aggregate(points);
      assert.strictEqual(result.p95, null);
      assert.strictEqual(result.p99, null);
    });

    it('computes p95 and p99 for >= 20 data points', () => {
      const points = Array.from({ length: 100 }, (_, i) => ({
        timestamp: i,
        value: i + 1 // 1 to 100
      }));
      const result = aggregate(points);
      assert.ok(result.p95 !== null, 'p95 should not be null');
      assert.ok(result.p99 !== null, 'p99 should not be null');
      assert.ok(result.p95 >= 95, `p95 should be >= 95, got ${result.p95}`);
      assert.ok(result.p99 >= 99, `p99 should be >= 99, got ${result.p99}`);
    });

    it('handles single data point', () => {
      const points = [{ timestamp: 1, value: 42 }];
      const result = aggregate(points);
      assert.strictEqual(result.count, 1);
      assert.strictEqual(result.min, 42);
      assert.strictEqual(result.max, 42);
      assert.strictEqual(result.avg, 42);
    });
  });

  describe('percentile', () => {
    it('returns null for empty array', () => {
      assert.strictEqual(percentile([], 0.95), null);
    });

    it('returns the value for single-element array', () => {
      assert.strictEqual(percentile([42], 0.95), 42);
    });

    it('computes p95 correctly for sorted array', () => {
      const values = Array.from({ length: 100 }, (_, i) => i + 1); // 1-100
      const p95 = percentile(values, 0.95);
      assert.strictEqual(p95, 95);
    });

    it('computes p99 correctly for sorted array', () => {
      const values = Array.from({ length: 100 }, (_, i) => i + 1); // 1-100
      const p99 = percentile(values, 0.99);
      assert.strictEqual(p99, 99);
    });

    it('computes p50 (median) correctly', () => {
      const values = Array.from({ length: 100 }, (_, i) => i + 1);
      const p50 = percentile(values, 0.50);
      assert.strictEqual(p50, 50);
    });
  });

  describe('SUPPORTED_WINDOWS', () => {
    it('contains expected windows', () => {
      assert.deepStrictEqual(SUPPORTED_WINDOWS, ['1m', '5m', '15m', '1h']);
    });
  });

  describe('isValidWindow', () => {
    it('returns true for valid windows', () => {
      for (const w of ['1m', '5m', '15m', '1h']) {
        assert.ok(isValidWindow(w), `${w} should be valid`);
      }
    });

    it('returns false for invalid windows', () => {
      assert.ok(!isValidWindow('2m'));
      assert.ok(!isValidWindow('30s'));
      assert.ok(!isValidWindow('invalid'));
    });
  });
});
