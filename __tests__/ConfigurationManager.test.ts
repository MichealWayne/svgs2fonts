/**
 * @module ConfigurationManager.test
 * @author Wayne<michealwayne@163.com>
 * @Date 2025-07-17 15:30:00
 * @description Tests for the enhanced configuration system
 */

import {
  ConfigurationManager,
  ConfigurationError,
  createConfiguration,
  validateConfiguration,
} from '../src/config/ConfigurationManager';
import { EnhancedOptions, FontFormat } from '../src/types/OptionType';

describe('ConfigurationManager', () => {
  // Save original environment
  const originalEnv = process.env;

  // Reset environment variables before each test
  beforeEach(() => {
    process.env = { ...originalEnv };
    // Clear any SVGS2FONTS_ environment variables
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('SVGS2FONTS_')) {
        delete process.env[key];
      }
    });
  });

  // Restore original environment after all tests
  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Basic Configuration', () => {
    it('should create configuration with default values', () => {
      const config = new ConfigurationManager({
        src: './test-svgs',
        fontName: 'test-font',
      });

      const options = config.getOptions();
      expect(options.fontName).toBe('test-font');
      expect(options.src).toBe('./test-svgs');
      expect(options.maxConcurrency).toBeGreaterThan(0);
      expect(options.enableCache).toBe(true);
      expect(options.fontFormats).toContain('woff2');
    });

    it('should merge user options with defaults', () => {
      const config = new ConfigurationManager({
        src: './test-svgs',
        fontName: 'custom-font',
        maxConcurrency: 4,
        verbose: true,
      });

      const options = config.getOptions();
      expect(options.fontName).toBe('custom-font');
      expect(options.maxConcurrency).toBe(4);
      expect(options.verbose).toBe(true);
      expect(options.enableCache).toBe(true); // default value preserved
    });

    it('should properly merge nested objects', () => {
      const config = new ConfigurationManager({
        src: './test-svgs',
        fontName: 'test-font',
        fontMetrics: {
          baseline: 0.5,
        },
        optimization: {
          compressWoff2: false,
        },
        customTemplates: {
          templateVariables: {
            title: 'Custom Title',
          },
        },
      });

      const options = config.getOptions();
      expect(options.fontMetrics?.baseline).toBe(0.5);
      expect(options.fontMetrics?.ascent).toBeUndefined(); // Default preserved
      expect(options.optimization?.compressWoff2).toBe(false);
      expect(options.optimization?.optimizeForWeb).toBe(true); // Default preserved
      expect(options.customTemplates?.templateVariables?.title).toBe('Custom Title');
    });
  });

  describe('Environment Variables', () => {
    it('should load configuration from environment variables', () => {
      process.env.SVGS2FONTS_SRC = './env-svgs';
      process.env.SVGS2FONTS_FONT_NAME = 'env-font';
      process.env.SVGS2FONTS_MAX_CONCURRENCY = '3';
      process.env.SVGS2FONTS_ENABLE_CACHE = 'false';
      process.env.SVGS2FONTS_VERBOSE = 'true';

      const config = new ConfigurationManager({});
      const options = config.getOptions();

      expect(options.src).toBe('./env-svgs');
      expect(options.fontName).toBe('env-font');
      expect(options.maxConcurrency).toBe(3);
      expect(options.enableCache).toBe(false);
      expect(options.verbose).toBe(true);
    });

    it('should prioritize user options over environment variables', () => {
      process.env.SVGS2FONTS_SRC = './env-svgs';
      process.env.SVGS2FONTS_FONT_NAME = 'env-font';

      const config = new ConfigurationManager({
        src: './user-svgs',
        fontName: 'user-font',
      });

      const options = config.getOptions();
      expect(options.src).toBe('./user-svgs');
      expect(options.fontName).toBe('user-font');
    });
  });

  describe('Validation', () => {
    it('should throw error for missing required fields', () => {
      expect(() => {
        new ConfigurationManager({});
      }).toThrow(ConfigurationError);
    });

    it('should throw error for invalid font formats', () => {
      expect(() => {
        new ConfigurationManager({
          src: './test-svgs',
          fontName: 'test-font',
          fontFormats: ['invalid-format' as any],
        });
      }).toThrow(ConfigurationError);
    });

    it('should throw error for invalid concurrency', () => {
      expect(() => {
        new ConfigurationManager({
          src: './test-svgs',
          fontName: 'test-font',
          maxConcurrency: 0,
        });
      }).toThrow(ConfigurationError);
    });

    it('should throw error for invalid unicode ranges', () => {
      expect(() => {
        new ConfigurationManager({
          src: './test-svgs',
          fontName: 'test-font',
          subsetting: {
            unicodeRanges: [{ start: 100, end: 50 }],
          },
        });
      }).toThrow(ConfigurationError);
    });

    it('should throw error for batch mode without input directories', () => {
      expect(() => {
        new ConfigurationManager({
          src: './test-svgs',
          fontName: 'test-font',
          batchMode: true,
        });
      }).toThrow(ConfigurationError);
    });

    it('should validate configuration without creating a manager', () => {
      expect(() => {
        validateConfiguration({});
      }).toThrow(ConfigurationError);

      // Should not throw with valid config
      expect(() => {
        validateConfiguration({
          src: './test-svgs',
          fontName: 'test-font',
        });
      }).not.toThrow();
    });
  });

  describe('Feature Detection', () => {
    it('should detect enabled features', () => {
      const config = new ConfigurationManager({
        src: './test-svgs',
        fontName: 'test-font',
        verbose: true,
        enableCache: false,
      });

      expect(config.isFeatureEnabled('verbose')).toBe(true);
      expect(config.isFeatureEnabled('enableCache')).toBe(false);
    });
  });

  describe('Option Groups', () => {
    it('should return performance options', () => {
      const config = new ConfigurationManager({
        src: './test-svgs',
        fontName: 'test-font',
        maxConcurrency: 6,
        enableCache: false,
        streamProcessing: true,
      });

      const perfOptions = config.getPerformanceOptions();
      expect(perfOptions.maxConcurrency).toBe(6);
      expect(perfOptions.enableCache).toBe(false);
      expect(perfOptions.streamProcessing).toBe(true);
    });

    it('should return monitoring options', () => {
      const config = new ConfigurationManager({
        src: './test-svgs',
        fontName: 'test-font',
        verbose: true,
        debug: true,
        performanceAnalysis: true,
      });

      const monitorOptions = config.getMonitoringOptions();
      expect(monitorOptions.verbose).toBe(true);
      expect(monitorOptions.debug).toBe(true);
      expect(monitorOptions.performanceAnalysis).toBe(true);
    });

    it('should return font options', () => {
      const config = new ConfigurationManager({
        src: './test-svgs',
        fontName: 'test-font',
        fontFormats: ['woff2', 'variable'] as FontFormat[],
        fontMetrics: {
          baseline: 0.5,
        },
      });

      const fontOptions = config.getFontOptions();
      expect(fontOptions.fontFormats).toContain('woff2');
      expect(fontOptions.fontFormats).toContain('variable');
      expect(fontOptions.fontMetrics?.baseline).toBe(0.5);
    });

    it('should return batch options', () => {
      const config = new ConfigurationManager({
        src: './test-svgs',
        fontName: 'test-font',
        batchMode: true,
        inputDirectories: ['./dir1', './dir2'],
        outputPattern: '[name]-[fontname]',
      });

      const batchOptions = config.getBatchOptions();
      expect(batchOptions.batchMode).toBe(true);
      expect(batchOptions.inputDirectories).toHaveLength(2);
      expect(batchOptions.outputPattern).toBe('[name]-[fontname]');
    });

    it('should return template options', () => {
      const config = new ConfigurationManager({
        src: './test-svgs',
        fontName: 'test-font',
        customTemplates: {
          customHtmlTemplate: '<html></html>',
          templateVariables: {
            title: 'Custom Title',
          },
        },
      });

      const templateOptions = config.getTemplateOptions();
      expect(templateOptions?.customHtmlTemplate).toBe('<html></html>');
      expect(templateOptions?.templateVariables?.title).toBe('Custom Title');
    });
  });

  describe('Batch Processing', () => {
    it('should resolve output paths for batch mode', () => {
      const config = new ConfigurationManager({
        src: './test-svgs',
        fontName: 'test-font',
        batchMode: true,
        inputDirectories: ['./dir1', './dir2'],
      });

      // Default pattern is [name]/[fontname]
      expect(config.resolveOutputPath('./dir1')).toBe('dist/dir1/test-font');

      // With custom pattern
      config.updateOptions({ outputPattern: 'output/[name]-[fontname]' });
      expect(config.resolveOutputPath('./dir1')).toBe('dist/output/dir1-test-font');
    });
  });

  describe('Progress Monitoring', () => {
    it('should create progress callback with phase information', () => {
      let lastProgress: any = null;
      const progressCallback = (progress: any) => {
        lastProgress = progress;
      };

      const config = new ConfigurationManager({
        src: './test-svgs',
        fontName: 'test-font',
        progressCallback,
      });

      const phaseCallback = config.createProgressCallback('SVG Processing');
      phaseCallback?.({ completed: 5, total: 10 });

      expect(lastProgress).not.toBeNull();
      expect(lastProgress.completed).toBe(5);
      expect(lastProgress.total).toBe(10);
      expect(lastProgress.phase).toBe('SVG Processing');
    });

    it('should return undefined if no progress callback is set', () => {
      const config = new ConfigurationManager({
        src: './test-svgs',
        fontName: 'test-font',
      });

      const phaseCallback = config.createProgressCallback('SVG Processing');
      expect(phaseCallback).toBeUndefined();
    });
  });

  describe('Factory Function', () => {
    it('should create configuration using factory', () => {
      const config = createConfiguration({
        src: './test-svgs',
        fontName: 'factory-font',
      });

      expect(config).toBeInstanceOf(ConfigurationManager);
      expect(config.getOption('fontName')).toBe('factory-font');
    });
  });

  describe('Configuration Summary', () => {
    it('should generate readable summary', () => {
      const config = new ConfigurationManager({
        src: './test-svgs',
        fontName: 'summary-font',
        verbose: true,
        batchMode: true,
        inputDirectories: ['./dir1', './dir2'],
        streamProcessing: true,
        performanceAnalysis: true,
        subsetting: {
          includeGlyphs: ['a', 'b'],
        },
      });

      const summary = config.getSummary();
      expect(summary).toContain('summary-font');
      expect(summary).toContain('./test-svgs');
      expect(summary).toContain('enabled');
      expect(summary).toContain('Batch Mode: 2');
      expect(summary).toContain('Stream Processing: enabled');
      expect(summary).toContain('Performance Analysis: enabled');
      expect(summary).toContain('Font Subsetting: enabled');
    });
  });

  describe('Configuration Updates', () => {
    it('should update configuration with new options', () => {
      const config = new ConfigurationManager({
        src: './test-svgs',
        fontName: 'test-font',
      });

      config.updateOptions({
        fontName: 'updated-font',
        verbose: true,
      });

      const options = config.getOptions();
      expect(options.fontName).toBe('updated-font');
      expect(options.verbose).toBe(true);
      expect(options.src).toBe('./test-svgs'); // Preserved
    });

    it('should validate options after update', () => {
      const config = new ConfigurationManager({
        src: './test-svgs',
        fontName: 'test-font',
      });

      expect(() => {
        config.updateOptions({
          maxConcurrency: 0, // Invalid
        });
      }).toThrow(ConfigurationError);
    });
  });
});
