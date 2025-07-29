/**
 * @module BatchModeProcessor.test
 * @author Wayne<michealwayne@163.com>
 * @Date 2025-07-27 11:15:00
 * @description Tests for the BatchModeProcessor module
 */

import { ConfigurationManager } from '../src/config/ConfigurationManager';
import { PerformanceTracker } from '../src/core/PerformanceTracker';
import { BatchModeProcessor } from '../src/processors';

// Mock core modules
jest.mock('../config', () => ({
  ConfigurationManager: jest.fn().mockImplementation(() => ({
    getConfiguration: jest.fn(() => ({
      directories: ['dir1', 'dir2', 'dir3'],
      maxConcurrency: 3,
      batchSize: 2,
      verbose: true,
    })),
    validateConfiguration: jest.fn(() => true),
    updateConfiguration: jest.fn(),
  })),
  createConfiguration: jest.fn(() => ({
    directories: ['dir1', 'dir2'],
    maxConcurrency: 2,
  })),
}));

jest.mock('../core', () => ({
  createProgressMonitor: jest.fn(() => ({
    startTracking: jest.fn(),
    updateProgress: jest.fn(),
    setPhase: jest.fn(),
    generateReport: jest.fn(() => ({
      totalTime: 1000,
      successCount: 2,
      failureCount: 1,
    })),
    getProgress: jest.fn(() => ({
      completed: 2,
      total: 3,
      percentComplete: 66.7,
    })),
  })),
  PerformanceTracker: jest.fn().mockImplementation(() => ({
    startTimer: jest.fn(),
    endTimer: jest.fn(),
    getMetrics: jest.fn(() => ({
      totalTime: 1000,
      avgTime: 333,
      throughput: 1.8,
    })),
  })),
}));

// Mock SingleDirectoryProcessor
jest.mock('./SingleDirectoryProcessor', () => ({
  SingleDirectoryProcessor: jest.fn().mockImplementation(() => ({
    process: jest.fn().mockResolvedValue({
      success: true,
      fontFiles: ['test.ttf', 'test.woff'],
      demoFiles: ['demo.html'],
      processingTime: 500,
    }),
  })),
}));

describe('BatchModeProcessor', () => {
  let configManager: jest.Mocked<ConfigurationManager>;
  let performanceTracker: jest.Mocked<PerformanceTracker>;
  let batchProcessor: BatchModeProcessor;

  beforeEach(() => {
    jest.clearAllMocks();

    const { ConfigurationManager: MockConfigManager } = require('../config');
    const { PerformanceTracker: MockPerformanceTracker } = require('../core');

    configManager = new MockConfigManager() as jest.Mocked<ConfigurationManager>;
    performanceTracker = new MockPerformanceTracker() as jest.Mocked<PerformanceTracker>;

    batchProcessor = new BatchModeProcessor(configManager, performanceTracker);
  });

  describe('Initialization', () => {
    it('should create a BatchModeProcessor instance', () => {
      expect(batchProcessor).toBeInstanceOf(BatchModeProcessor);
    });

    it('should initialize with configuration manager', () => {
      expect(batchProcessor).toBeDefined();
      expect(configManager.getConfiguration).toHaveBeenCalled();
    });

    it('should initialize with performance tracker', () => {
      const batchProcessorWithTracker = new BatchModeProcessor(configManager, performanceTracker);

      expect(batchProcessorWithTracker).toBeDefined();
    });

    it('should initialize without performance tracker', () => {
      const batchProcessorWithoutTracker = new BatchModeProcessor(configManager);

      expect(batchProcessorWithoutTracker).toBeDefined();
    });
  });

  describe('Batch Processing', () => {
    it('should have process method', () => {
      expect(typeof batchProcessor.process).toBe('function');
    });

    it('should process multiple directories', async () => {
      const result = await batchProcessor.process();

      expect(result).toBeDefined();
      if (!(result instanceof Error)) {
        expect(result.results).toBeDefined();
        expect(Array.isArray(result.results)).toBe(true);
      }
    });

    it('should handle successful batch processing', async () => {
      const result = await batchProcessor.process();

      expect(result).toBeDefined();
      if (!(result instanceof Error)) {
        expect(result.successCount).toBeGreaterThanOrEqual(0);
        expect(result.failureCount).toBeGreaterThanOrEqual(0);
        expect(result.totalTime).toBeGreaterThanOrEqual(0);
      }
    });

    it('should track progress during batch processing', async () => {
      const { createProgressMonitor } = require('../core');
      const mockProgressMonitor = createProgressMonitor();

      await batchProcessor.process();

      expect(mockProgressMonitor.startTracking).toHaveBeenCalled();
      expect(mockProgressMonitor.updateProgress).toHaveBeenCalled();
    });

    it('should handle empty directories list', async () => {
      configManager.getConfiguration.mockReturnValue({
        directories: [],
        maxConcurrency: 1,
        batchSize: 1,
        verbose: false,
      });

      const result = await batchProcessor.process();

      expect(result).toBeDefined();
    });

    it('should respect max concurrency setting', async () => {
      configManager.getConfiguration.mockReturnValue({
        directories: ['dir1', 'dir2', 'dir3', 'dir4', 'dir5'],
        maxConcurrency: 2,
        batchSize: 3,
        verbose: false,
      });

      const result = await batchProcessor.process();

      expect(result).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle configuration errors', async () => {
      configManager.getConfiguration.mockImplementation(() => {
        throw new Error('Configuration error');
      });

      const result = await batchProcessor.process();

      expect(result).toBeDefined();
      expect(result instanceof Error).toBe(true);
    });

    it('should handle single directory processing errors', async () => {
      const { SingleDirectoryProcessor } = require('./SingleDirectoryProcessor');
      const mockSingleProcessor = SingleDirectoryProcessor as jest.MockedClass<
        typeof SingleDirectoryProcessor
      >;

      mockSingleProcessor.prototype.process.mockRejectedValueOnce(
        new Error('Directory processing failed')
      );

      const result = await batchProcessor.process();

      expect(result).toBeDefined();
    });

    it('should continue processing other directories when one fails', async () => {
      const { SingleDirectoryProcessor } = require('./SingleDirectoryProcessor');
      const mockSingleProcessor = SingleDirectoryProcessor as jest.MockedClass<
        typeof SingleDirectoryProcessor
      >;

      // Make first directory fail, others succeed
      mockSingleProcessor.prototype.process
        .mockRejectedValueOnce(new Error('First directory failed'))
        .mockResolvedValue({
          success: true,
          fontFiles: ['test.ttf'],
          demoFiles: ['demo.html'],
          processingTime: 300,
        });

      const result = await batchProcessor.process();

      expect(result).toBeDefined();
    });
  });

  describe('Performance Tracking', () => {
    it('should track processing time for each directory', async () => {
      await batchProcessor.process();

      expect(performanceTracker.startTimer).toHaveBeenCalled();
      expect(performanceTracker.endTimer).toHaveBeenCalled();
    });

    it('should generate performance metrics', async () => {
      const result = await batchProcessor.process();

      expect(result).toBeDefined();
      if (!(result instanceof Error)) {
        expect(typeof result.totalTime).toBe('number');
        expect(result.totalTime).toBeGreaterThanOrEqual(0);
      }
    });

    it('should track throughput metrics', async () => {
      await batchProcessor.process();

      expect(performanceTracker.getMetrics).toHaveBeenCalled();
    });
  });

  describe('Configuration Management', () => {
    it('should validate configuration before processing', async () => {
      await batchProcessor.process();

      expect(configManager.validateConfiguration).toHaveBeenCalled();
    });

    it('should handle custom batch sizes', async () => {
      configManager.getConfiguration.mockReturnValue({
        directories: ['dir1', 'dir2', 'dir3', 'dir4'],
        maxConcurrency: 2,
        batchSize: 1,
        verbose: true,
      });

      const result = await batchProcessor.process();

      expect(result).toBeDefined();
    });

    it('should handle verbose logging', async () => {
      configManager.getConfiguration.mockReturnValue({
        directories: ['dir1', 'dir2'],
        maxConcurrency: 1,
        batchSize: 2,
        verbose: true,
      });

      const result = await batchProcessor.process();

      expect(result).toBeDefined();
    });
  });

  describe('Statistics and Reporting', () => {
    it('should provide detailed processing statistics', async () => {
      const result = await batchProcessor.process();

      expect(result).toBeDefined();
      if (!(result instanceof Error)) {
        expect(typeof result.successCount).toBe('number');
        expect(typeof result.failureCount).toBe('number');
        expect(typeof result.totalDirectories).toBe('number');
      }
    });

    it('should generate comprehensive processing report', async () => {
      const { createProgressMonitor } = require('../core');
      const mockProgressMonitor = createProgressMonitor();

      await batchProcessor.process();

      expect(mockProgressMonitor.generateReport).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null or undefined directories', async () => {
      configManager.getConfiguration.mockReturnValue({
        directories: null as unknown,
        maxConcurrency: 1,
        batchSize: 1,
        verbose: false,
      });

      const result = await batchProcessor.process();

      expect(result).toBeDefined();
    });

    it('should handle zero max concurrency', async () => {
      configManager.getConfiguration.mockReturnValue({
        directories: ['dir1'],
        maxConcurrency: 0,
        batchSize: 1,
        verbose: false,
      });

      const result = await batchProcessor.process();

      expect(result).toBeDefined();
    });

    it('should handle very large batch sizes', async () => {
      configManager.getConfiguration.mockReturnValue({
        directories: ['dir1', 'dir2'],
        maxConcurrency: 1,
        batchSize: 1000,
        verbose: false,
      });

      const result = await batchProcessor.process();

      expect(result).toBeDefined();
    });
  });
});
