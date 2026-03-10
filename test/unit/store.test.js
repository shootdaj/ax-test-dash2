'use strict';

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { TimeSeriesStore, parseWindow } = require('../../src/store');
const { METRIC_NAMES } = require('../../src/simulator');

describe('TimeSeriesStore', () => {
  let store;

  beforeEach(() => {
    store = new TimeSeriesStore({ seed: false, maxPoints: 100 });
  });

  describe('constructor', () => {
    it('initializes empty arrays for all metrics', () => {
      for (const metric of METRIC_NAMES) {
        assert.ok(Array.isArray(store.data[metric]));
        assert.strictEqual(store.data[metric].length, 0);
      }
    });

    it('sets default maxPoints', () => {
      const s = new TimeSeriesStore({ seed: false });
      assert.strictEqual(s.maxPoints, 1800);
    });

    it('accepts custom maxPoints', () => {
      assert.strictEqual(store.maxPoints, 100);
    });
  });

  describe('seed', () => {
    it('populates data for all metrics', () => {
      store.seed();
      for (const metric of METRIC_NAMES) {
        assert.ok(store.data[metric].length > 0, `${metric} should have data after seeding`);
      }
    });

    it('respects maxPoints cap', () => {
      store.seed();
      for (const metric of METRIC_NAMES) {
        assert.ok(store.data[metric].length <= store.maxPoints);
      }
    });
  });

  describe('addPoint', () => {
    it('adds a data point to the specified metric', () => {
      const point = { timestamp: Date.now(), value: 42 };
      store.addPoint('cpu', point);
      assert.strictEqual(store.data.cpu.length, 1);
      assert.deepStrictEqual(store.data.cpu[0], point);
    });

    it('returns the added point', () => {
      const point = { timestamp: Date.now(), value: 42 };
      const result = store.addPoint('cpu', point);
      assert.deepStrictEqual(result, point);
    });

    it('prunes when maxPoints exceeded', () => {
      const s = new TimeSeriesStore({ seed: false, maxPoints: 3 });
      for (let i = 0; i < 5; i++) {
        s.addPoint('cpu', { timestamp: Date.now() + i * 1000, value: i });
      }
      assert.strictEqual(s.data.cpu.length, 3);
      assert.strictEqual(s.data.cpu[0].value, 2); // oldest points pruned
    });
  });

  describe('getLatest', () => {
    it('returns the most recent data point', () => {
      const now = Date.now();
      store.addPoint('cpu', { timestamp: now - 1000, value: 10 });
      store.addPoint('cpu', { timestamp: now, value: 20 });
      const latest = store.getLatest('cpu');
      assert.strictEqual(latest.value, 20);
    });

    it('returns null for empty metric', () => {
      const latest = store.getLatest('cpu');
      assert.strictEqual(latest, null);
    });
  });

  describe('getAllLatest', () => {
    it('returns latest values for all metrics', () => {
      const now = Date.now();
      store.addPoint('cpu', { timestamp: now, value: 50 });
      store.addPoint('memory', { timestamp: now, value: 60 });
      const result = store.getAllLatest();
      assert.strictEqual(result.cpu.value, 50);
      assert.strictEqual(result.memory.value, 60);
      assert.strictEqual(result.requestsPerSec, null);
      assert.strictEqual(result.errorRate, null);
    });
  });

  describe('getHistory', () => {
    it('returns points within time window', () => {
      const now = Date.now();
      store.addPoint('cpu', { timestamp: now - 120000, value: 10 }); // 2 min ago
      store.addPoint('cpu', { timestamp: now - 30000, value: 20 });  // 30 sec ago
      store.addPoint('cpu', { timestamp: now, value: 30 });          // now

      const history = store.getHistory('cpu', '1m');
      assert.strictEqual(history.length, 2); // 30sec ago + now
    });

    it('returns empty array for unknown metric', () => {
      const history = store.getHistory('unknown', '5m');
      assert.deepStrictEqual(history, []);
    });
  });

  describe('getSize', () => {
    it('returns count of stored points', () => {
      const now = Date.now();
      store.addPoint('cpu', { timestamp: now - 1000, value: 10 });
      store.addPoint('cpu', { timestamp: now, value: 20 });
      assert.strictEqual(store.getSize('cpu'), 2);
    });

    it('returns 0 for empty metric', () => {
      assert.strictEqual(store.getSize('cpu'), 0);
    });
  });

  describe('getTotalSize', () => {
    it('returns total points across all metrics', () => {
      const now = Date.now();
      store.addPoint('cpu', { timestamp: now, value: 10 });
      store.addPoint('memory', { timestamp: now - 1000, value: 20 });
      store.addPoint('memory', { timestamp: now, value: 30 });
      assert.strictEqual(store.getTotalSize(), 3);
    });
  });
});

describe('parseWindow', () => {
  it('parses seconds', () => {
    assert.strictEqual(parseWindow('30s'), 30000);
  });

  it('parses minutes', () => {
    assert.strictEqual(parseWindow('5m'), 300000);
    assert.strictEqual(parseWindow('15m'), 900000);
  });

  it('parses hours', () => {
    assert.strictEqual(parseWindow('1h'), 3600000);
  });

  it('returns 15m default for invalid input', () => {
    assert.strictEqual(parseWindow('invalid'), 900000);
  });
});
