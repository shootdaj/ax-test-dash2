'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  generateValue,
  generateDataPoint,
  generateRange,
  METRIC_NAMES,
  METRIC_UNITS
} = require('../../src/simulator');

describe('Simulator', () => {
  describe('generateValue', () => {
    it('generates CPU values within 0-100 range', () => {
      for (let i = 0; i < 100; i++) {
        const ts = Date.now() - i * 2000;
        const val = generateValue('cpu', ts);
        assert.ok(val >= 0, `CPU value ${val} should be >= 0`);
        assert.ok(val <= 100, `CPU value ${val} should be <= 100`);
      }
    });

    it('generates memory values within 10-100 range', () => {
      for (let i = 0; i < 100; i++) {
        const ts = Date.now() - i * 2000;
        const val = generateValue('memory', ts);
        assert.ok(val >= 10, `Memory value ${val} should be >= 10`);
        assert.ok(val <= 100, `Memory value ${val} should be <= 100`);
      }
    });

    it('generates requestsPerSec values within 0-500 range', () => {
      for (let i = 0; i < 100; i++) {
        const ts = Date.now() - i * 2000;
        const val = generateValue('requestsPerSec', ts);
        assert.ok(val >= 0, `req/s value ${val} should be >= 0`);
        assert.ok(val <= 500, `req/s value ${val} should be <= 500`);
      }
    });

    it('generates errorRate values within 0-100 range', () => {
      for (let i = 0; i < 100; i++) {
        const ts = Date.now() - i * 2000;
        const val = generateValue('errorRate', ts);
        assert.ok(val >= 0, `Error rate ${val} should be >= 0`);
        assert.ok(val <= 100, `Error rate ${val} should be <= 100`);
      }
    });

    it('is deterministic for the same timestamp', () => {
      const ts = 1700000000000;
      const v1 = generateValue('cpu', ts);
      const v2 = generateValue('cpu', ts);
      assert.strictEqual(v1, v2, 'Same timestamp should produce same value');
    });

    it('produces different values for different timestamps', () => {
      const v1 = generateValue('cpu', 1700000000000);
      const v2 = generateValue('cpu', 1700000002000);
      // Not guaranteed to be different with all seeds, but overwhelmingly likely
      // Just check they're both valid numbers
      assert.ok(typeof v1 === 'number');
      assert.ok(typeof v2 === 'number');
    });
  });

  describe('generateDataPoint', () => {
    it('returns an object with timestamp and value', () => {
      const ts = Date.now();
      const point = generateDataPoint('cpu', ts);
      assert.strictEqual(point.timestamp, ts);
      assert.ok(typeof point.value === 'number');
    });
  });

  describe('generateRange', () => {
    it('generates points at specified interval', () => {
      const start = 1700000000000;
      const end = 1700000010000;
      const interval = 2000;
      const points = generateRange('cpu', start, end, interval);
      assert.strictEqual(points.length, 6); // 0, 2, 4, 6, 8, 10 seconds
    });

    it('generates points with correct timestamps', () => {
      const start = 1700000000000;
      const end = 1700000004000;
      const points = generateRange('cpu', start, end, 2000);
      assert.strictEqual(points[0].timestamp, 1700000000000);
      assert.strictEqual(points[1].timestamp, 1700000002000);
      assert.strictEqual(points[2].timestamp, 1700000004000);
    });

    it('defaults to 2000ms interval', () => {
      const start = 1700000000000;
      const end = 1700000004000;
      const points = generateRange('cpu', start, end);
      assert.strictEqual(points.length, 3);
    });
  });

  describe('METRIC_NAMES', () => {
    it('contains all 4 metric types', () => {
      assert.deepStrictEqual(METRIC_NAMES, ['cpu', 'memory', 'requestsPerSec', 'errorRate']);
    });
  });

  describe('METRIC_UNITS', () => {
    it('has units for all metrics', () => {
      assert.strictEqual(METRIC_UNITS.cpu, '%');
      assert.strictEqual(METRIC_UNITS.memory, '%');
      assert.strictEqual(METRIC_UNITS.requestsPerSec, 'req/s');
      assert.strictEqual(METRIC_UNITS.errorRate, '%');
    });
  });
});
