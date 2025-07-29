/**
 * @module ProgressMonitor.test
 * @author Wayne<michealwayne@163.com>
 * @Date 2025-07-17 17:30:00
 * @LastEditTime 2025-07-18 10:30:00
 */

import {
  DefaultProgressMonitor,
  ProgressMonitor,
  PerformanceReport,
  CacheStats,
} from '../src/core/ProgressMonitor';

// Mock the utils functions that are actually called
jest.mock('../src/utils/utils', () => ({
  ...jest.requireActual('../src/utils/utils'),
  log: jest.fn(),
}));

// Import the mocked function
import { log } from '../src/utils/utils';
const mockLog = log as jest.MockedFunction<typeof log>;

// Mock console.log to avoid test output pollution
const originalLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalLog;
});

describe('ProgressMonitor', () => {
  let monitor: ProgressMonitor;

  beforeEach(() => {
    monitor = new DefaultProgressMonitor();
    mockLog.mockClear();
  });

  describe('Basic Progress Tracking', () => {
    it('should initialize with default values', () => {
      const progress = monitor.getProgress();

      expect(progress.completed).toBe(0);
      expect(progress.total).toBe(0);
      expect(progress.phase).toBe('initializing');
      expect(progress.startTime).toBeGreaterThan(0);
      expect(progress.percentComplete).toBe(0);
    });

    it('should start tracking with total tasks', () => {
      monitor.startTracking({ total: 100, phase: 'processing' });
      const progress = monitor.getProgress();

      expect(progress.total).toBe(100);
      expect(progress.completed).toBe(0);
      expect(progress.phase).toBe('processing');
      expect(progress.percentComplete).toBe(0);
    });

    it('should update progress correctly', () => {
      monitor.startTracking(100);
      monitor.updateProgress({ completed: 25, current: 'file1.svg' });

      const progress = monitor.getProgress();
      expect(progress.completed).toBe(25);
      expect(progress.current).toBe('file1.svg');
      expect(progress.percentComplete).toBe(25);
    });

    it('should not exceed total when updating progress', () => {
      monitor.startTracking(100);
      monitor.updateProgress(150);

      const progress = monitor.getProgress();
      expect(progress.completed).toBe(100);
      expect(progress.percentComplete).toBe(100);
    });

    it('should calculate estimated time remaining', async () => {
      monitor.startTracking(100);

      // Wait a bit to ensure timing
      await new Promise(resolve => setTimeout(resolve, 50));

      monitor.updateProgress(25);

      const progress = monitor.getProgress();
      expect(progress.estimatedTimeRemaining).toBeDefined();
      expect(progress.estimatedTimeRemaining).toBeGreaterThan(0);
    });
  });

  describe('Phase Management', () => {
    it('should change phases correctly', () => {
      monitor.startTracking({ total: 100, phase: 'svg-processing' });
      monitor.setPhase('font-generation');

      const progress = monitor.getProgress();
      expect(progress.phase).toBe('font-generation');
    });

    it('should record timing when changing phases', async () => {
      monitor.startTracking({ total: 100, phase: 'phase1' });

      // Wait a bit to ensure timing
      await new Promise(resolve => setTimeout(resolve, 10));

      monitor.setPhase('phase2');

      const report = monitor.generateReport();
      expect(report.phaseBreakdown['phase1']).toBeDefined();
      expect(report.phaseBreakdown['phase1'].duration).toBeGreaterThan(0);
    });

    it('should update task breakdown based on phase', () => {
      monitor.recordTiming('svg-processing', 1000);
      monitor.recordTiming('font-generation', 2000);
      monitor.recordTiming('demo-generation', 500);

      const report = monitor.generateReport();
      expect(report.taskBreakdown).toBeDefined();
      expect(report.taskBreakdown?.svgProcessing).toBe(1000);
      expect(report.taskBreakdown?.fontGeneration).toBe(2000);
      expect(report.taskBreakdown?.demoGeneration).toBe(500);
    });
  });

  describe('Timing Recording', () => {
    it('should record custom timing', () => {
      monitor.recordTiming('custom-phase', 1000);

      const report = monitor.generateReport();
      expect(report.phaseBreakdown['custom-phase']).toBeDefined();
      expect(report.phaseBreakdown['custom-phase'].duration).toBe(1000);
    });

    it('should calculate start and end times correctly', () => {
      const duration = 1500;
      monitor.recordTiming('test-phase', duration);

      const report = monitor.generateReport();
      const timing = report.phaseBreakdown['test-phase'];

      expect(timing.endTime - timing.startTime).toBe(duration);
    });

    it('should end ongoing phase timing when generating report', async () => {
      monitor.startTracking({ total: 100, phase: 'ongoing-phase' });

      // Wait a bit to ensure timing
      await new Promise(resolve => setTimeout(resolve, 10));

      const report = monitor.generateReport();
      expect(report.phaseBreakdown['ongoing-phase']).toBeDefined();
      expect(report.phaseBreakdown['ongoing-phase'].duration).toBeGreaterThan(0);
    });
  });

  describe('File Statistics', () => {
    it('should record file statistics', () => {
      monitor.recordFileStats({
        processedFiles: 50,
        failedFiles: 2,
        totalInputSize: 1024000,
        totalOutputSize: 512000,
      });

      const report = monitor.generateReport();
      expect(report.fileStats.processedFiles).toBe(50);
      expect(report.fileStats.failedFiles).toBe(2);
      expect(report.fileStats.totalInputSize).toBe(1024000);
      expect(report.fileStats.totalOutputSize).toBe(512000);
    });

    it('should merge file statistics correctly', () => {
      monitor.recordFileStats({ processedFiles: 25 });
      monitor.recordFileStats({ failedFiles: 3 });

      const report = monitor.generateReport();
      expect(report.fileStats.processedFiles).toBe(25);
      expect(report.fileStats.failedFiles).toBe(3);
    });
  });

  describe('Cache Statistics', () => {
    it('should record cache statistics', () => {
      monitor.recordCacheStats({
        hits: 10,
        misses: 5,
        savedTime: 2000,
      });

      const report = monitor.generateReport();
      expect(report.cacheStats).toBeDefined();
      expect(report.cacheStats?.hits).toBe(10);
      expect(report.cacheStats?.misses).toBe(5);
      expect(report.cacheStats?.savedTime).toBe(2000);
    });

    it('should calculate hit rate correctly', () => {
      monitor.recordCacheStats({
        hits: 15,
        misses: 5,
      });

      const report = monitor.generateReport();
      expect(report.cacheStats?.hitRate).toBe(75); // 15 / (15 + 5) * 100
    });

    it('should handle zero cache accesses', () => {
      monitor.recordCacheStats({
        hits: 0,
        misses: 0,
      });

      const report = monitor.generateReport();
      expect(report.cacheStats?.hitRate).toBe(0);
    });
  });

  describe('Performance Report Generation', () => {
    it('should generate comprehensive performance report', async () => {
      monitor.startTracking({ total: 100, phase: 'processing' });
      monitor.updateProgress(50);
      monitor.recordFileStats({
        processedFiles: 50,
        totalOutputSize: 1024000,
      });
      monitor.recordCacheStats({
        hits: 20,
        misses: 30,
        savedTime: 5000,
      });

      // Wait to ensure some time passes
      await new Promise(resolve => setTimeout(resolve, 10));

      const report = monitor.generateReport();

      expect(report.totalTime).toBeGreaterThan(0);
      expect(report.fileStats.processedFiles).toBe(50);
      expect(report.throughput.filesPerSecond).toBeGreaterThan(0);
      expect(report.throughput.bytesPerSecond).toBeGreaterThan(0);
      expect(report.cacheStats?.hitRate).toBe(40); // 20 / (20 + 30) * 100
      expect(report.taskBreakdown).toBeDefined();
    });

    it('should calculate throughput correctly', async () => {
      monitor.startTracking(100);
      monitor.recordFileStats({
        processedFiles: 10,
        totalOutputSize: 2048000,
      });

      // Wait to ensure measurable time
      await new Promise(resolve => setTimeout(resolve, 100));

      const report = monitor.generateReport();

      expect(report.throughput.filesPerSecond).toBeGreaterThan(0);
      expect(report.throughput.bytesPerSecond).toBeGreaterThan(0);
    });
  });

  describe('Progress Callbacks', () => {
    it('should call progress callbacks on updates', () => {
      const callback = jest.fn();
      monitor.onProgress(callback);

      monitor.startTracking(100);
      monitor.updateProgress({ completed: 25, current: 'test.svg' });

      expect(callback).toHaveBeenCalledWith({
        completed: 25,
        total: 100,
        current: 'test.svg',
        phase: 'processing',
      });
    });

    it('should handle multiple callbacks', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      monitor.onProgress(callback1);
      monitor.onProgress(callback2);

      monitor.startTracking(50);

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      const goodCallback = jest.fn();

      monitor.onProgress(errorCallback);
      monitor.onProgress(goodCallback);

      // Should not throw despite error callback
      expect(() => {
        monitor.startTracking(10);
      }).not.toThrow();

      expect(goodCallback).toHaveBeenCalled();
    });
  });

  describe('Memory Usage Tracking', () => {
    it('should record memory usage', () => {
      monitor.recordMemoryUsage();

      const report = monitor.generateReport();
      expect(report.memoryUsage).toBeDefined();
      expect(typeof report.memoryUsage.currentMemoryUsage).toBe('number');
      expect(typeof report.memoryUsage.peakMemoryUsage).toBe('number');
    });

    it('should track peak memory usage', () => {
      monitor.recordMemoryUsage();
      const initialPeak = monitor.generateReport().memoryUsage.peakMemoryUsage;

      monitor.recordMemoryUsage();
      const secondPeak = monitor.generateReport().memoryUsage.peakMemoryUsage;

      expect(secondPeak).toBeGreaterThanOrEqual(initialPeak);
    });
  });

  describe('Progress Logging', () => {
    it('should log progress when forced', () => {
      monitor.startTracking({ total: 100, phase: 'test-phase' });
      monitor.logProgress(true);

      expect(mockLog).toHaveBeenCalled();
    });

    it('should include estimated time remaining in log when available', async () => {
      monitor.startTracking({ total: 100, phase: 'test-phase' });
      await new Promise(resolve => setTimeout(resolve, 10));
      monitor.updateProgress(25);
      monitor.logProgress(true);

      const calls = mockLog.mock.calls.flat().join(' ');
      expect(calls).toContain('remaining');
    });

    it('should include current item in log when available', () => {
      monitor.startTracking({ total: 100, phase: 'test-phase' });
      monitor.updateProgress({ completed: 25, current: 'current-item' });
      monitor.logProgress(true);

      const calls = mockLog.mock.calls.flat().join(' ');
      expect(calls).toContain('current-item');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all state', () => {
      monitor.startTracking({ total: 100, phase: 'test-phase' });
      monitor.updateProgress({ completed: 50, current: 'test.svg' });
      monitor.recordTiming('custom', 1000);
      monitor.recordFileStats({ processedFiles: 25 });
      monitor.recordCacheStats({ hits: 10, misses: 5 });

      monitor.reset();

      const progress = monitor.getProgress();
      const report = monitor.generateReport();

      expect(progress.completed).toBe(0);
      expect(progress.total).toBe(0);
      expect(progress.phase).toBe('initializing');
      expect(progress.percentComplete).toBe(0);
      expect(Object.keys(report.phaseBreakdown)).toHaveLength(0);
      expect(report.fileStats.processedFiles).toBe(0);
      expect(report.cacheStats?.hits).toBe(0);
      expect(report.taskBreakdown?.svgProcessing).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero total tasks', () => {
      monitor.startTracking(0);
      monitor.updateProgress(0);

      const report = monitor.generateReport();
      expect(report.throughput.filesPerSecond).toBe(0);
    });

    it('should handle negative progress values', () => {
      monitor.startTracking(100);
      monitor.updateProgress(-10);

      const progress = monitor.getProgress();
      expect(progress.completed).toBe(0);
    });

    it('should handle undefined current file', () => {
      monitor.startTracking(100);
      monitor.updateProgress(25);

      const progress = monitor.getProgress();
      expect(progress.current).toBeUndefined();
    });
  });

  describe('Factory Function', () => {
    it('should create a progress monitor instance', () => {
      const { createProgressMonitor } = require('../src/core/ProgressMonitor');
      const monitor = createProgressMonitor();

      expect(monitor).toBeInstanceOf(DefaultProgressMonitor);
    });
  });
});
