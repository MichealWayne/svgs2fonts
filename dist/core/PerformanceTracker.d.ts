/**
 * @module PerformanceTracker
 * @description Performance tracking utilities extracted from index.ts
 */
export interface PerformanceTracker {
  startTime: number;
  phases: Record<
    string,
    {
      start: number;
      end?: number;
      duration?: number;
    }
  >;
  startPhase(name: string): void;
  endPhase(name: string): void;
  getSummary(): string;
}
export declare function createPerformanceTracker(): PerformanceTracker;
//# sourceMappingURL=PerformanceTracker.d.ts.map
