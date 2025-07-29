/**
 * @module PerformanceTracker.test
 * @author Wayne<michealwayne@163.com>
 * @Date 2025-07-27
 * @description Tests for PerformanceTracker module
 */

import { createPerformanceTracker, PerformanceTracker } from '../src/core/PerformanceTracker';

describe('PerformanceTracker', () => {
  let tracker: PerformanceTracker;

  beforeEach(() => {
    tracker = createPerformanceTracker();
  });

  describe('Initialization', () => {
    it('should create a performance tracker with initial values', () => {
      expect(tracker).toBeDefined();
      expect(typeof tracker.startTime).toBe('number');
      expect(tracker.startTime).toBeGreaterThan(0);
      expect(tracker.phases).toEqual({});
    });

    it('should have required methods', () => {
      expect(typeof tracker.startPhase).toBe('function');
      expect(typeof tracker.endPhase).toBe('function');
      expect(typeof tracker.getSummary).toBe('function');
    });
  });

  describe('Phase tracking', () => {
    it('should start a phase', () => {
      const phaseName = 'test-phase';
      tracker.startPhase(phaseName);

      expect(tracker.phases[phaseName]).toBeDefined();
      expect(typeof tracker.phases[phaseName].start).toBe('number');
      expect(tracker.phases[phaseName].start).toBeGreaterThan(0);
      expect(tracker.phases[phaseName].end).toBeUndefined();
      expect(tracker.phases[phaseName].duration).toBeUndefined();
    });

    it('should end a phase', async () => {
      const phaseName = 'test-phase';
      tracker.startPhase(phaseName);

      // Wait a bit to ensure measurable duration
      await new Promise(resolve => setTimeout(resolve, 10));

      tracker.endPhase(phaseName);

      expect(tracker.phases[phaseName].end).toBeDefined();
      expect(tracker.phases[phaseName].duration).toBeDefined();
      expect(tracker.phases[phaseName].duration).toBeGreaterThan(0);
      expect(tracker.phases[phaseName].end! - tracker.phases[phaseName].start).toBe(
        tracker.phases[phaseName].duration
      );
    });

    it('should handle ending non-existent phase gracefully', () => {
      expect(() => {
        tracker.endPhase('non-existent-phase');
      }).not.toThrow();
    });

    it('should track multiple phases', async () => {
      tracker.startPhase('phase1');
      await new Promise(resolve => setTimeout(resolve, 5));

      tracker.startPhase('phase2');
      await new Promise(resolve => setTimeout(resolve, 5));

      tracker.endPhase('phase1');
      tracker.endPhase('phase2');

      expect(Object.keys(tracker.phases)).toHaveLength(2);
      expect(tracker.phases.phase1.duration).toBeGreaterThan(0);
      expect(tracker.phases.phase2.duration).toBeGreaterThan(0);
    });

    it('should handle overlapping phases', async () => {
      tracker.startPhase('phase1');
      await new Promise(resolve => setTimeout(resolve, 5));

      tracker.startPhase('phase2');
      await new Promise(resolve => setTimeout(resolve, 5));

      tracker.endPhase('phase2');
      await new Promise(resolve => setTimeout(resolve, 5));

      tracker.endPhase('phase1');

      expect(tracker.phases.phase1.duration!).toBeGreaterThan(tracker.phases.phase2.duration!);
    });
  });

  describe('Summary generation', () => {
    it('should generate summary with no phases', () => {
      const summary = tracker.getSummary();

      expect(typeof summary).toBe('string');
      expect(summary).toContain('Total time:');
      expect(summary).toContain('ms');
      expect(summary).toContain('Phases:');
    });

    it('should generate summary with completed phases', async () => {
      tracker.startPhase('svg-processing');
      await new Promise(resolve => setTimeout(resolve, 10));
      tracker.endPhase('svg-processing');

      tracker.startPhase('font-generation');
      await new Promise(resolve => setTimeout(resolve, 15));
      tracker.endPhase('font-generation');

      const summary = tracker.getSummary();

      expect(summary).toContain('Total time:');
      expect(summary).toContain('svg-processing:');
      expect(summary).toContain('font-generation:');
      expect(summary).toContain('ms');
      expect(summary).toContain('%');
    });

    it('should calculate percentages correctly', async () => {
      tracker.startPhase('phase1');
      await new Promise(resolve => setTimeout(resolve, 20));
      tracker.endPhase('phase1');

      const summary = tracker.getSummary();
      const lines = summary.split('\n');
      const phaseLine = lines.find(line => line.includes('phase1:'));

      expect(phaseLine).toBeDefined();
      expect(phaseLine).toMatch(/\(\d+%\)/);
    });

    it('should handle phases without end time', () => {
      tracker.startPhase('ongoing-phase');

      const summary = tracker.getSummary();

      expect(summary).toContain('ongoing-phase:');
      expect(summary).toContain('0ms (NaN%)');
    });

    it('should format summary correctly', async () => {
      tracker.startPhase('test-phase');
      await new Promise(resolve => setTimeout(resolve, 10));
      tracker.endPhase('test-phase');

      const summary = tracker.getSummary();
      const lines = summary.split('\n');

      expect(lines[0]).toMatch(/^Total time: \d+ms$/);
      expect(lines[1]).toBe('Phases:');
      expect(lines[2]).toMatch(/^ {2}test-phase: \d+ms \(\d+%\)$/);
    });
  });

  describe('Time calculations', () => {
    it('should calculate total time correctly', async () => {
      const startTime = tracker.startTime;
      await new Promise(resolve => setTimeout(resolve, 50));

      const summary = tracker.getSummary();
      const totalTimeMatch = summary.match(/Total time: (\d+)ms/);

      expect(totalTimeMatch).toBeTruthy();
      const totalTime = parseInt(totalTimeMatch![1]);
      expect(totalTime).toBeGreaterThanOrEqual(40); // Allow some variance
    });

    it('should handle very short durations', () => {
      tracker.startPhase('quick-phase');
      tracker.endPhase('quick-phase');

      expect(tracker.phases['quick-phase'].duration).toBeGreaterThanOrEqual(0);
    });

    it('should maintain precision for small durations', () => {
      tracker.startPhase('precise-phase');
      // Immediately end to test precision
      tracker.endPhase('precise-phase');

      const duration = tracker.phases['precise-phase'].duration;
      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty phase names', () => {
      expect(() => {
        tracker.startPhase('');
        tracker.endPhase('');
      }).not.toThrow();

      expect(tracker.phases['']).toBeDefined();
    });

    it('should handle special characters in phase names', () => {
      const specialName = 'phase-with_special.chars@123';

      tracker.startPhase(specialName);
      tracker.endPhase(specialName);

      expect(tracker.phases[specialName]).toBeDefined();
      expect(tracker.phases[specialName].duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle multiple starts of same phase', () => {
      tracker.startPhase('duplicate-phase');
      const firstStart = tracker.phases['duplicate-phase'].start;

      // Start again - should overwrite
      tracker.startPhase('duplicate-phase');
      const secondStart = tracker.phases['duplicate-phase'].start;

      expect(secondStart).toBeGreaterThanOrEqual(firstStart);
    });

    it('should handle very long phase names', () => {
      const longName = 'a'.repeat(1000);

      tracker.startPhase(longName);
      tracker.endPhase(longName);

      expect(tracker.phases[longName]).toBeDefined();

      const summary = tracker.getSummary();
      expect(summary).toContain(longName);
    });
  });

  describe('Factory function', () => {
    it('should create new tracker instances', () => {
      const tracker1 = createPerformanceTracker();
      const tracker2 = createPerformanceTracker();

      expect(tracker1).not.toBe(tracker2);
      // Start times might be the same if created very quickly, so we check they're different objects
      expect(tracker1.phases).not.toBe(tracker2.phases);
    });

    it('should create independent tracker instances', () => {
      const tracker1 = createPerformanceTracker();
      const tracker2 = createPerformanceTracker();

      tracker1.startPhase('phase1');
      tracker2.startPhase('phase2');

      expect(Object.keys(tracker1.phases)).toEqual(['phase1']);
      expect(Object.keys(tracker2.phases)).toEqual(['phase2']);
    });
  });

  describe('Performance characteristics', () => {
    it('should handle many phases efficiently', () => {
      const startTime = Date.now();

      // Create many phases
      for (let i = 0; i < 1000; i++) {
        tracker.startPhase(`phase-${i}`);
        tracker.endPhase(`phase-${i}`);
      }

      const endTime = Date.now();
      const operationTime = endTime - startTime;

      // Should complete quickly (less than 1 second)
      expect(operationTime).toBeLessThan(1000);
      expect(Object.keys(tracker.phases)).toHaveLength(1000);
    });

    it('should generate summary efficiently for many phases', () => {
      // Create many phases
      for (let i = 0; i < 100; i++) {
        tracker.startPhase(`phase-${i}`);
        tracker.endPhase(`phase-${i}`);
      }

      const startTime = Date.now();
      const summary = tracker.getSummary();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
      expect(summary).toContain('Total time:');
      expect(summary.split('\n')).toHaveLength(102); // Title + Phases header + 100 phases
    });
  });
});
