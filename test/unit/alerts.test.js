'use strict';

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { AlertEngine, DEFAULT_RULES } = require('../../src/alerts');

describe('AlertEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new AlertEngine();
  });

  describe('constructor', () => {
    it('initializes with default rules', () => {
      assert.strictEqual(engine.rules.length, DEFAULT_RULES.length);
    });

    it('accepts custom rules', () => {
      const custom = [{ id: 'test', metric: 'cpu', operator: '>', value: 50, severity: 'info', message: 'test' }];
      const e = new AlertEngine(custom);
      assert.strictEqual(e.rules.length, 1);
    });

    it('starts with no active alerts', () => {
      assert.strictEqual(engine.getActive().length, 0);
    });

    it('starts with empty history', () => {
      assert.strictEqual(engine.getHistory().length, 0);
    });
  });

  describe('evaluate', () => {
    it('triggers alert when threshold exceeded', () => {
      const now = Date.now();
      const metrics = {
        cpu: { timestamp: now, value: 95 },
        memory: { timestamp: now, value: 50 },
        errorRate: { timestamp: now, value: 1 },
        requestsPerSec: { timestamp: now, value: 100 }
      };

      const changes = engine.evaluate(metrics);
      assert.ok(changes.length > 0, 'Should have triggered alerts');

      const cpuAlert = changes.find(c => c.id === 'cpu-high');
      assert.ok(cpuAlert, 'CPU high alert should trigger');
      assert.strictEqual(cpuAlert.event, 'triggered');
      assert.strictEqual(cpuAlert.currentValue, 95);
    });

    it('clears alert when threshold no longer exceeded', () => {
      const now = Date.now();

      // First: trigger
      engine.evaluate({
        cpu: { timestamp: now, value: 95 },
        memory: { timestamp: now, value: 50 },
        errorRate: { timestamp: now, value: 1 },
        requestsPerSec: { timestamp: now, value: 100 }
      });

      assert.ok(engine.getActive().length > 0, 'Should have active alerts');

      // Then: clear
      const changes = engine.evaluate({
        cpu: { timestamp: now + 1000, value: 50 },
        memory: { timestamp: now + 1000, value: 50 },
        errorRate: { timestamp: now + 1000, value: 1 },
        requestsPerSec: { timestamp: now + 1000, value: 100 }
      });

      const cleared = changes.find(c => c.id === 'cpu-high' && c.event === 'cleared');
      assert.ok(cleared, 'CPU alert should be cleared');
    });

    it('does not duplicate active alerts', () => {
      const now = Date.now();
      const metrics = {
        cpu: { timestamp: now, value: 95 },
        memory: { timestamp: now, value: 50 },
        errorRate: { timestamp: now, value: 1 },
        requestsPerSec: { timestamp: now, value: 100 }
      };

      engine.evaluate(metrics);
      const firstCount = engine.getActive().length;

      engine.evaluate(metrics);
      assert.strictEqual(engine.getActive().length, firstCount);
    });

    it('triggers memory alert for memory > 85%', () => {
      const now = Date.now();
      engine.evaluate({
        cpu: { timestamp: now, value: 50 },
        memory: { timestamp: now, value: 90 },
        errorRate: { timestamp: now, value: 1 },
        requestsPerSec: { timestamp: now, value: 100 }
      });

      const active = engine.getActive();
      const memAlert = active.find(a => a.id === 'memory-high');
      assert.ok(memAlert, 'Memory high alert should trigger');
    });

    it('triggers error rate alert for errorRate > 5%', () => {
      const now = Date.now();
      engine.evaluate({
        cpu: { timestamp: now, value: 50 },
        memory: { timestamp: now, value: 50 },
        errorRate: { timestamp: now, value: 8 },
        requestsPerSec: { timestamp: now, value: 100 }
      });

      const active = engine.getActive();
      const errAlert = active.find(a => a.id === 'error-rate-high');
      assert.ok(errAlert, 'Error rate alert should trigger');
    });

    it('updates current value on active alert', () => {
      const now = Date.now();
      engine.evaluate({
        cpu: { timestamp: now, value: 95 },
        memory: { timestamp: now, value: 50 },
        errorRate: { timestamp: now, value: 1 },
        requestsPerSec: { timestamp: now, value: 100 }
      });

      engine.evaluate({
        cpu: { timestamp: now + 1000, value: 98 },
        memory: { timestamp: now + 1000, value: 50 },
        errorRate: { timestamp: now + 1000, value: 1 },
        requestsPerSec: { timestamp: now + 1000, value: 100 }
      });

      const cpuAlert = engine.getActive().find(a => a.id === 'cpu-high');
      assert.strictEqual(cpuAlert.currentValue, 98);
    });

    it('skips metrics not present in input', () => {
      const changes = engine.evaluate({
        cpu: { timestamp: Date.now(), value: 50 }
      });
      // Should not throw, just skip missing metrics
      assert.ok(Array.isArray(changes));
    });
  });

  describe('getActive', () => {
    it('returns array of active alerts', () => {
      const result = engine.getActive();
      assert.ok(Array.isArray(result));
    });
  });

  describe('getHistory', () => {
    it('returns alert history with limit', () => {
      const now = Date.now();

      // Trigger an alert
      engine.evaluate({
        cpu: { timestamp: now, value: 95 },
        memory: { timestamp: now, value: 50 },
        errorRate: { timestamp: now, value: 1 },
        requestsPerSec: { timestamp: now, value: 100 }
      });

      const history = engine.getHistory(10);
      assert.ok(history.length > 0, 'History should have entries');
      assert.ok(history[0].event === 'triggered');
    });
  });

  describe('addRule', () => {
    it('adds a new rule', () => {
      const initialCount = engine.rules.length;
      engine.addRule({ id: 'custom', metric: 'cpu', operator: '>', value: 75, severity: 'info', message: 'test' });
      assert.strictEqual(engine.rules.length, initialCount + 1);
    });

    it('throws for invalid rule', () => {
      assert.throws(() => engine.addRule({}), /Rule must have/);
    });
  });

  describe('removeRule', () => {
    it('removes a rule by ID', () => {
      const initialCount = engine.rules.length;
      engine.removeRule('cpu-high');
      assert.strictEqual(engine.rules.length, initialCount - 1);
    });

    it('clears active alert when rule removed', () => {
      const now = Date.now();
      engine.evaluate({
        cpu: { timestamp: now, value: 95 },
        memory: { timestamp: now, value: 50 },
        errorRate: { timestamp: now, value: 1 },
        requestsPerSec: { timestamp: now, value: 100 }
      });

      engine.removeRule('cpu-high');
      const cpuAlert = engine.getActive().find(a => a.id === 'cpu-high');
      assert.strictEqual(cpuAlert, undefined);
    });
  });

  describe('getRules', () => {
    it('returns a copy of rules', () => {
      const rules = engine.getRules();
      assert.strictEqual(rules.length, DEFAULT_RULES.length);
      rules.push({ id: 'extra' });
      assert.strictEqual(engine.rules.length, DEFAULT_RULES.length); // original unchanged
    });
  });

  describe('DEFAULT_RULES', () => {
    it('includes CPU > 90% rule', () => {
      const rule = DEFAULT_RULES.find(r => r.id === 'cpu-high');
      assert.ok(rule);
      assert.strictEqual(rule.value, 90);
      assert.strictEqual(rule.operator, '>');
    });

    it('includes memory > 85% rule', () => {
      const rule = DEFAULT_RULES.find(r => r.id === 'memory-high');
      assert.ok(rule);
      assert.strictEqual(rule.value, 85);
    });

    it('includes error rate > 5% rule', () => {
      const rule = DEFAULT_RULES.find(r => r.id === 'error-rate-high');
      assert.ok(rule);
      assert.strictEqual(rule.value, 5);
    });
  });
});
