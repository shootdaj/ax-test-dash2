'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../../src/app');
const { resetStore } = require('../../src/store');
const { resetAlertEngine } = require('../../src/alerts');

let server;
let baseUrl;

function fetch(path) {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

describe('API Integration Tests', () => {
  before(async () => {
    // Reset state for clean tests
    resetStore();
    resetAlertEngine();

    // Start server on random port
    server = app.listen(0);
    const addr = server.address();
    baseUrl = `http://localhost:${addr.port}`;
  });

  after(() => {
    if (server) server.close();
  });

  describe('GET /health', () => {
    it('returns 200 with ok status', async () => {
      const { status, body } = await fetch('/health');
      assert.strictEqual(status, 200);
      assert.strictEqual(body.status, 'ok');
      assert.ok(body.timestamp);
      assert.ok(body.metrics);
      assert.ok(typeof body.metrics.totalDataPoints === 'number');
    });
  });

  describe('GET /api/metrics/current', () => {
    it('returns current values for all 4 metrics', async () => {
      const { status, body } = await fetch('/api/metrics/current');
      assert.strictEqual(status, 200);
      assert.ok(body.metrics);
      assert.ok(body.metrics.cpu);
      assert.ok(body.metrics.memory);
      assert.ok(body.metrics.requestsPerSec);
      assert.ok(body.metrics.errorRate);
    });

    it('includes units for each metric', async () => {
      const { body } = await fetch('/api/metrics/current');
      assert.strictEqual(body.metrics.cpu.unit, '%');
      assert.strictEqual(body.metrics.memory.unit, '%');
      assert.strictEqual(body.metrics.requestsPerSec.unit, 'req/s');
      assert.strictEqual(body.metrics.errorRate.unit, '%');
    });

    it('includes timestamp', async () => {
      const { body } = await fetch('/api/metrics/current');
      assert.ok(body.timestamp);
      assert.ok(typeof body.timestamp === 'number');
    });
  });

  describe('GET /api/metrics/history', () => {
    it('returns time-series data for a valid metric', async () => {
      const { status, body } = await fetch('/api/metrics/history?metric=cpu&window=5m');
      assert.strictEqual(status, 200);
      assert.strictEqual(body.metric, 'cpu');
      assert.strictEqual(body.window, '5m');
      assert.ok(Array.isArray(body.data));
      assert.ok(typeof body.count === 'number');
    });

    it('returns 400 for missing metric', async () => {
      const { status, body } = await fetch('/api/metrics/history');
      assert.strictEqual(status, 400);
      assert.ok(body.error);
    });

    it('returns 400 for invalid metric', async () => {
      const { status, body } = await fetch('/api/metrics/history?metric=invalid');
      assert.strictEqual(status, 400);
      assert.ok(body.validMetrics);
    });

    it('defaults to 15m window', async () => {
      const { body } = await fetch('/api/metrics/history?metric=cpu');
      assert.strictEqual(body.window, '15m');
    });
  });

  describe('GET /api/metrics/aggregation', () => {
    it('returns aggregated stats', async () => {
      const { status, body } = await fetch('/api/metrics/aggregation?metric=cpu&window=15m');
      assert.strictEqual(status, 200);
      assert.strictEqual(body.metric, 'cpu');
      assert.ok(typeof body.count === 'number');
      assert.ok(body.min !== undefined);
      assert.ok(body.max !== undefined);
      assert.ok(body.avg !== undefined);
    });

    it('returns 400 for invalid window', async () => {
      const { status, body } = await fetch('/api/metrics/aggregation?metric=cpu&window=2m');
      assert.strictEqual(status, 400);
      assert.ok(body.validWindows);
    });

    it('returns 400 for missing metric', async () => {
      const { status } = await fetch('/api/metrics/aggregation');
      assert.strictEqual(status, 400);
    });
  });

  describe('GET /api/alerts', () => {
    it('returns alerts array', async () => {
      const { status, body } = await fetch('/api/alerts');
      assert.strictEqual(status, 200);
      assert.ok(Array.isArray(body.active));
      assert.ok(typeof body.count === 'number');
    });
  });

  describe('GET /api/alerts/history', () => {
    it('returns alert history', async () => {
      const { status, body } = await fetch('/api/alerts/history');
      assert.strictEqual(status, 200);
      assert.ok(Array.isArray(body.history));
      assert.ok(typeof body.count === 'number');
    });
  });

  describe('GET /api/dashboard/config', () => {
    it('returns dashboard configuration', async () => {
      const { status, body } = await fetch('/api/dashboard/config');
      assert.strictEqual(status, 200);
      assert.ok(body.title);
      assert.ok(body.refreshInterval);
      assert.ok(Array.isArray(body.metrics));
      assert.ok(body.layout);
      assert.ok(Array.isArray(body.layout.widgets));
      assert.ok(Array.isArray(body.alertRules));
    });

    it('includes all 4 metrics in config', async () => {
      const { body } = await fetch('/api/dashboard/config');
      assert.strictEqual(body.metrics.length, 4);
      const names = body.metrics.map(m => m.name);
      assert.ok(names.includes('cpu'));
      assert.ok(names.includes('memory'));
      assert.ok(names.includes('requestsPerSec'));
      assert.ok(names.includes('errorRate'));
    });
  });
});
