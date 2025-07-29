'use strict';
/**
 * @module PerformanceTracker
 * @description Performance tracking utilities extracted from index.ts
 */
Object.defineProperty(exports, '__esModule', { value: true });
exports.createPerformanceTracker = void 0;
function createPerformanceTracker() {
  const tracker = {
    startTime: Date.now(),
    phases: {},
    startPhase(name) {
      this.phases[name] = { start: Date.now() };
    },
    endPhase(name) {
      const phase = this.phases[name];
      if (phase) {
        phase.end = Date.now();
        phase.duration = phase.end - phase.start;
      }
    },
    getSummary() {
      const totalDuration = Date.now() - this.startTime;
      const phaseDetails = Object.entries(this.phases)
        .map(([name, data]) => {
          const duration = data.duration || 0;
          const percentage = Math.round((duration / totalDuration) * 100);
          return `${name}: ${duration}ms (${percentage}%)`;
        })
        .join('\n  ');
      return `Total time: ${totalDuration}ms\nPhases:\n  ${phaseDetails}`;
    },
  };
  return tracker;
}
exports.createPerformanceTracker = createPerformanceTracker;
//# sourceMappingURL=PerformanceTracker.js.map
