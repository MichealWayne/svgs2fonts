/**
 * @module SingleDirectoryProcessor.test
 * @author Wayne<michealwayne@163.com>
 * @Date 2025-07-27
 * @description Tests for SingleDirectoryProcessor
 */

import { ConfigurationManager } from '../src/config/ConfigurationManager';
import { SingleDirectoryProcessor } from '../src/processors/SingleDirectoryProcessor';

// Mock the builders
jest.mock('../src/builders/SVGBuilder');
jest.mock('../src/builders/FontsBuilder');
jest.mock('../src/builders/DemoBuilder');

// Mock the utils
jest.mock('../src/utils', () => ({
  log: jest.fn(),
}));

describe('SingleDirectoryProcessor', () => {
  let processor: SingleDirectoryProcessor;
  let mockConfigManager: jest.Mocked<ConfigurationManager>;
  let mockPerformanceTracker: any;

  beforeEach(() => {
    // Create mock configuration manager
    mockConfigManager = {
      getOptions: jest.fn().mockReturnValue({
        src: './test-svgs',
        fontName: 'test-font',
        dist: './dist',
        verbose: false,
        noDemo: false,
        unicodeStart: 0xe000,
        debug: false,
        demoUnicodeHTML: '',
        demoFontClassHTML: '',
      }),
    } as any;

    // Create mock performance tracker
    mockPerformanceTracker = {
      startPhase: jest.fn(),
      endPhase: jest.fn(),
    };

    processor = new SingleDirectoryProcessor(mockConfigManager, mockPerformanceTracker);
  });

  describe('Constructor', () => {
    it('should create processor with config manager', () => {
      expect(processor).toBeInstanceOf(SingleDirectoryProcessor);
    });

    it('should create processor without performance tracker', () => {
      const processorWithoutTracker = new SingleDirectoryProcessor(mockConfigManager);
      expect(processorWithoutTracker).toBeInstanceOf(SingleDirectoryProcessor);
    });
  });

  describe('process method', () => {
    beforeEach(() => {
      // Mock the builders to return successful results
      const mockSVGBuilder = {
        createSvgsFont: jest.fn().mockResolvedValue(true),
        clearCache: jest.fn(),
      };

      const mockFontBuilder = {
        ttf: jest.fn().mockResolvedValue(true),
        eot: jest.fn().mockResolvedValue(true),
        woff: jest.fn().mockResolvedValue(true),
        woff2: jest.fn().mockResolvedValue(true),
      };

      const mockDemoBuilder = {
        html: jest.fn().mockResolvedValue(true),
      };

      // Mock the builder constructors
      const SVGBuilder = require('../src/builders/SVGBuilder').default;
      const FontsBuilder = require('../src/builders/FontsBuilder').default;
      const DemoBuilder = require('../src/builders/DemoBuilder').default;

      SVGBuilder.mockImplementation(() => mockSVGBuilder);
      FontsBuilder.mockImplementation(() => mockFontBuilder);
      DemoBuilder.mockImplementation(() => mockDemoBuilder);
    });

    it('should process successfully with all steps', async () => {
      const result = await processor.process();

      expect(result).toBe(true);
      expect(mockPerformanceTracker.startPhase).toHaveBeenCalledWith('SVG Processing');
      expect(mockPerformanceTracker.endPhase).toHaveBeenCalledWith('SVG Processing');
      expect(mockPerformanceTracker.startPhase).toHaveBeenCalledWith('Font Generation');
      expect(mockPerformanceTracker.endPhase).toHaveBeenCalledWith('Font Generation');
      expect(mockPerformanceTracker.startPhase).toHaveBeenCalledWith('Demo Generation');
      expect(mockPerformanceTracker.endPhase).toHaveBeenCalledWith('Demo Generation');
    });

    it('should skip demo generation when noDemo is true', async () => {
      mockConfigManager.getOptions.mockReturnValue({
        src: './test-svgs',
        fontName: 'test-font',
        dist: './dist',
        verbose: false,
        noDemo: true,
        unicodeStart: 0xe000,
        debug: false,
        demoUnicodeHTML: '',
        demoFontClassHTML: '',
      });

      const result = await processor.process();

      expect(result).toBe(true);
      expect(mockPerformanceTracker.startPhase).not.toHaveBeenCalledWith('Demo Generation');
    });

    it('should handle SVG processing failure', async () => {
      const mockSVGBuilder = {
        createSvgsFont: jest.fn().mockResolvedValue(false),
        clearCache: jest.fn(),
      };

      const SVGBuilder = require('../src/builders/SVGBuilder').default;
      SVGBuilder.mockImplementation(() => mockSVGBuilder);

      const result = await processor.process();

      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('SVG processing failed');
    });

    it('should handle font generation failure', async () => {
      const mockFontBuilder = {
        ttf: jest.fn().mockResolvedValue(false), // Fail TTF generation
        eot: jest.fn().mockResolvedValue(true),
        woff: jest.fn().mockResolvedValue(true),
        woff2: jest.fn().mockResolvedValue(true),
      };

      const FontsBuilder = require('../src/builders/FontsBuilder').default;
      FontsBuilder.mockImplementation(() => mockFontBuilder);

      const result = await processor.process();

      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('Font generation failed');
    });

    it('should handle demo generation failure', async () => {
      const mockDemoBuilder = {
        html: jest.fn().mockResolvedValue(false),
      };

      const DemoBuilder = require('../src/builders/DemoBuilder').default;
      DemoBuilder.mockImplementation(() => mockDemoBuilder);

      const result = await processor.process();

      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('Demo generation failed');
    });

    it('should handle exceptions during processing', async () => {
      const mockSVGBuilder = {
        createSvgsFont: jest.fn().mockRejectedValue(new Error('Unexpected error')),
        clearCache: jest.fn(),
      };

      const SVGBuilder = require('../src/builders/SVGBuilder').default;
      SVGBuilder.mockImplementation(() => mockSVGBuilder);

      const result = await processor.process();

      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('Unexpected error');
    });

    it('should clear cache after processing', async () => {
      const mockSVGBuilder = {
        createSvgsFont: jest.fn().mockResolvedValue(true),
        clearCache: jest.fn(),
      };

      const SVGBuilder = require('../src/builders/SVGBuilder').default;
      SVGBuilder.mockImplementation(() => mockSVGBuilder);

      await processor.process();

      expect(mockSVGBuilder.clearCache).toHaveBeenCalled();
    });

    it('should log success when verbose is enabled', async () => {
      mockConfigManager.getOptions.mockReturnValue({
        src: './test-svgs',
        fontName: 'test-font',
        dist: './dist',
        verbose: true,
        noDemo: false,
        unicodeStart: 0xe000,
        debug: false,
        demoUnicodeHTML: '',
        demoFontClassHTML: '',
      });

      const { log } = require('../src/utils');

      await processor.process();

      expect(log).toHaveBeenCalledWith('[svgs2fonts] Font generation completed successfully');
    });

    it('should not log when verbose is disabled', async () => {
      // Ensure verbose is false in the default config
      mockConfigManager.getOptions.mockReturnValue({
        src: './test-svgs',
        fontName: 'test-font',
        dist: './dist',
        verbose: false,
        noDemo: false,
        unicodeStart: 0xe000,
        debug: false,
        demoUnicodeHTML: '',
        demoFontClassHTML: '',
      });

      const { log } = require('../src/utils');

      await processor.process();

      expect(log).not.toHaveBeenCalled();
    });

    it('should work without performance tracker', async () => {
      const processorWithoutTracker = new SingleDirectoryProcessor(mockConfigManager);

      const result = await processorWithoutTracker.process();

      expect(result).toBe(true);
      // Should not throw errors when performance tracker methods are called
    });
  });

  describe('Builder creation', () => {
    it('should create builders with correct options', async () => {
      const options = {
        src: './custom-svgs',
        fontName: 'custom-font',
        dist: './custom-dist',
        verbose: true,
        noDemo: false,
        unicodeStart: 0xe000,
        debug: false,
        demoUnicodeHTML: '',
        demoFontClassHTML: '',
      };

      mockConfigManager.getOptions.mockReturnValue(options);

      await processor.process();

      const SVGBuilder = require('../src/builders/SVGBuilder').default;
      const FontsBuilder = require('../src/builders/FontsBuilder').default;
      const DemoBuilder = require('../src/builders/DemoBuilder').default;

      expect(SVGBuilder).toHaveBeenCalledWith(options);
      expect(FontsBuilder).toHaveBeenCalledWith(expect.any(Object));
      expect(DemoBuilder).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should not create demo builder when noDemo is true', async () => {
      mockConfigManager.getOptions.mockReturnValue({
        src: './test-svgs',
        fontName: 'test-font',
        dist: './dist',
        verbose: false,
        noDemo: true,
        unicodeStart: 0xe000,
        debug: false,
        demoUnicodeHTML: '',
        demoFontClassHTML: '',
      });

      await processor.process();

      const DemoBuilder = require('../src/builders/DemoBuilder').default;
      // Reset the mock call count before this test
      DemoBuilder.mockClear();

      await processor.process();

      expect(DemoBuilder).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should convert string errors to Error objects', async () => {
      const mockSVGBuilder = {
        createSvgsFont: jest.fn().mockRejectedValue('String error'),
        clearCache: jest.fn(),
      };

      const SVGBuilder = require('../src/builders/SVGBuilder').default;
      SVGBuilder.mockImplementation(() => mockSVGBuilder);

      const result = await processor.process();

      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('String error');
    });

    it('should handle non-Error objects', async () => {
      const mockSVGBuilder = {
        createSvgsFont: jest.fn().mockRejectedValue({ message: 'Object error' }),
        clearCache: jest.fn(),
      };

      const SVGBuilder = require('../src/builders/SVGBuilder').default;
      SVGBuilder.mockImplementation(() => mockSVGBuilder);

      const result = await processor.process();

      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('[object Object]');
    });
  });

  describe('Performance tracking', () => {
    it('should track all phases when performance tracker is provided', async () => {
      // Clear previous calls
      mockPerformanceTracker.startPhase.mockClear();
      mockPerformanceTracker.endPhase.mockClear();

      await processor.process();

      expect(mockPerformanceTracker.startPhase).toHaveBeenCalledTimes(3);
      expect(mockPerformanceTracker.endPhase).toHaveBeenCalledTimes(3);

      expect(mockPerformanceTracker.startPhase).toHaveBeenNthCalledWith(1, 'SVG Processing');
      expect(mockPerformanceTracker.endPhase).toHaveBeenNthCalledWith(1, 'SVG Processing');
      expect(mockPerformanceTracker.startPhase).toHaveBeenNthCalledWith(2, 'Font Generation');
      expect(mockPerformanceTracker.endPhase).toHaveBeenNthCalledWith(2, 'Font Generation');
      expect(mockPerformanceTracker.startPhase).toHaveBeenNthCalledWith(3, 'Demo Generation');
      expect(mockPerformanceTracker.endPhase).toHaveBeenNthCalledWith(3, 'Demo Generation');
    });

    it('should handle performance tracker gracefully when methods fail', async () => {
      // Create a new processor with a failing performance tracker
      const failingTracker = {
        startTime: Date.now(),
        phases: {},
        startPhase: jest.fn().mockImplementation(() => {
          throw new Error('Tracker error');
        }),
        endPhase: jest.fn(),
        getSummary: jest.fn().mockReturnValue(''),
      };

      const processorWithFailingTracker = new SingleDirectoryProcessor(
        mockConfigManager,
        failingTracker
      );

      // Should not fail the entire process due to performance tracker errors
      const result = await processorWithFailingTracker.process();
      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('Tracker error');
    });
  });
});
