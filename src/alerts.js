'use strict';

/**
 * Alert Engine
 *
 * Threshold-based alerting system that evaluates rules against current
 * metric values and tracks active/historical alerts.
 */

const DEFAULT_RULES = [
  { id: 'cpu-high', metric: 'cpu', operator: '>', value: 90, severity: 'critical', message: 'CPU usage above 90%' },
  { id: 'memory-high', metric: 'memory', operator: '>', value: 85, severity: 'warning', message: 'Memory usage above 85%' },
  { id: 'error-rate-high', metric: 'errorRate', operator: '>', value: 5, severity: 'critical', message: 'Error rate above 5%' },
  { id: 'requests-low', metric: 'requestsPerSec', operator: '<', value: 10, severity: 'warning', message: 'Request rate below 10 req/s' }
];

class AlertEngine {
  constructor(rules) {
    this.rules = rules || [...DEFAULT_RULES];
    this.activeAlerts = new Map(); // key: rule.id, value: alert object
    this.alertHistory = [];
    this.maxHistory = 100;
  }

  /**
   * Evaluate all rules against current metric values
   * @param {object} metrics - { cpu: {timestamp, value}, memory: {timestamp, value}, ... }
   * @returns {Array} Newly triggered or cleared alerts
   */
  evaluate(metrics) {
    const changes = [];

    for (const rule of this.rules) {
      const metricData = metrics[rule.metric];
      if (!metricData) continue;

      const triggered = this._checkRule(rule, metricData.value);

      if (triggered && !this.activeAlerts.has(rule.id)) {
        // New alert triggered
        const alert = {
          id: rule.id,
          metric: rule.metric,
          rule: { operator: rule.operator, value: rule.value },
          severity: rule.severity,
          message: rule.message,
          currentValue: metricData.value,
          triggeredAt: metricData.timestamp || Date.now(),
          status: 'active'
        };
        this.activeAlerts.set(rule.id, alert);
        this._addToHistory({ ...alert, event: 'triggered' });
        changes.push({ ...alert, event: 'triggered' });
      } else if (!triggered && this.activeAlerts.has(rule.id)) {
        // Alert cleared
        const existing = this.activeAlerts.get(rule.id);
        const cleared = {
          ...existing,
          clearedAt: metricData.timestamp || Date.now(),
          status: 'cleared',
          event: 'cleared'
        };
        this.activeAlerts.delete(rule.id);
        this._addToHistory(cleared);
        changes.push(cleared);
      } else if (triggered && this.activeAlerts.has(rule.id)) {
        // Update current value on active alert
        const existing = this.activeAlerts.get(rule.id);
        existing.currentValue = metricData.value;
      }
    }

    return changes;
  }

  /**
   * Check if a rule condition is met
   */
  _checkRule(rule, value) {
    switch (rule.operator) {
      case '>': return value > rule.value;
      case '>=': return value >= rule.value;
      case '<': return value < rule.value;
      case '<=': return value <= rule.value;
      case '==': return value === rule.value;
      case '!=': return value !== rule.value;
      default: return false;
    }
  }

  /**
   * Get all currently active alerts
   */
  getActive() {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Get alert history
   * @param {number} limit - Max number of entries to return
   */
  getHistory(limit = 50) {
    return this.alertHistory.slice(-limit);
  }

  /**
   * Add a custom rule
   */
  addRule(rule) {
    if (!rule.id || !rule.metric || !rule.operator || rule.value === undefined) {
      throw new Error('Rule must have id, metric, operator, and value');
    }
    this.rules.push(rule);
  }

  /**
   * Remove a rule by ID
   */
  removeRule(ruleId) {
    this.rules = this.rules.filter(r => r.id !== ruleId);
    this.activeAlerts.delete(ruleId);
  }

  /**
   * Get all configured rules
   */
  getRules() {
    return [...this.rules];
  }

  _addToHistory(entry) {
    this.alertHistory.push(entry);
    while (this.alertHistory.length > this.maxHistory) {
      this.alertHistory.shift();
    }
  }
}

// Singleton
let engineInstance = null;

function getAlertEngine() {
  if (!engineInstance) {
    engineInstance = new AlertEngine();
  }
  return engineInstance;
}

function resetAlertEngine() {
  engineInstance = null;
}

module.exports = {
  AlertEngine,
  getAlertEngine,
  resetAlertEngine,
  DEFAULT_RULES
};
