/**
 * @module PerformanceTracker
 * @description Performance tracking utilities extracted from index.ts
 */

export interface PerformanceTracker {
  startTime: number;
  phases: Record<string, { start: number; end?: number; duration?: number }>;
  startPhase(name: string): void;
  endPhase(name: string): void;
  getSummary(): string;
}

export function createPerformanceTracker(): PerformanceTracker {
  const tracker: PerformanceTracker = {
    startTime: Date.now(),
    phases: {},
    startPhase(name: string) {
      this.phases[name] = { start: Date.now() };
    },
    endPhase(name: string) {
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
