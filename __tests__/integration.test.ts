/**
 * @module integration.test
 * @author Wayne<michealwayne@163.com>
 * @Date 2025-07-18 20:00:00
 * @description Integration tests for svgs2fonts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { init } from '../src/index';
import { EnhancedOptions } from '../src/types/OptionType';

// Create a temporary directory for test output
const TEST_OUTPUT_DIR = path.join(os.tmpdir(), 'svgs2fonts-integration-test');
const TEST_SVG_DIR = path.join(__dirname, '../examples/svg');

// Mock fs module for some operations
jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs');
  return {
    ...originalFs,
    // Override specific methods as needed
    existsSync: jest.fn().mockImplementation((path: string) => {
      // Always return true for SVG directory
      if (path === TEST_SVG_DIR) {
        return true;
      }
      // Use real implementation for other paths
      return originalFs.existsSync(path);
    }),
  };
});

describe('Integration Tests', () => {
  // Setup and cleanup
  beforeAll(() => {
    // Create test output directory if it doesn't exist
    if (!fs.existsSync(TEST_OUTPUT_DIR)) {
      fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test output directory
    if (fs.existsSync(TEST_OUTPUT_DIR)) {
      fs.rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
    }
  });

  describe('Basic Workflow', () => {
    it('should generate fonts from SVGs with default options', async () => {
      // Basic options
      const options: EnhancedOptions = {
        src: TEST_SVG_DIR,
        dist: path.join(TEST_OUTPUT_DIR, 'basic'),
        fontName: 'basic-test-font',
      };

      // Run the font generation
      const result = await init(options);

      // Verify success
      expect(result).toBe(true);

      // Verify output files exist
      expect(fs.existsSync(path.join(options.dist, `${options.fontName}.ttf`))).toBe(true);
      expect(fs.existsSync(path.join(options.dist, `${options.fontName}.woff`))).toBe(true);
      expect(fs.existsSync(path.join(options.dist, `${options.fontName}.woff2`))).toBe(true);
      expect(fs.existsSync(path.join(options.dist, 'demo_unicode.html'))).toBe(true);
      expect(fs.existsSync(path.join(options.dist, 'demo_fontclass.html'))).toBe(true);
    }, 30000); // Increase timeout for integration test

    it('should generate fonts with enhanced options', async () => {
      // Enhanced options
      const options: EnhancedOptions = {
        src: TEST_SVG_DIR,
        dist: path.join(TEST_OUTPUT_DIR, 'enhanced'),
        fontName: 'enhanced-test-font',
        fontFormats: ['ttf', 'woff2', 'variable'],
        maxConcurrency: 4,
        enableCache: true,
        cacheDir: path.join(TEST_OUTPUT_DIR, 'cache'),
        optimization: {
          compressWoff2: true,
          optimizeForWeb: true,
        },
        fontMetrics: {
          baseline: 0.5,
          ascent: 860,
          descent: 140,
        },
        subsetting: {
          includeGlyphs: ['arrow-down-1', 'arrow-up-1', 'check-1'],
        },
        verbose: true,
      };

      // Run the font generation
      const result = await init(options);

      // Verify success
      expect(result).toBe(true);

      // Verify output files exist
      expect(fs.existsSync(path.join(options.dist, `${options.fontName}.ttf`))).toBe(true);
      expect(fs.existsSync(path.join(options.dist, `${options.fontName}.woff2`))).toBe(true);

      // Verify cache directory was created
      expect(fs.existsSync(options.cacheDir!)).toBe(true);
    }, 30000); // Increase timeout for integration test

    it('should generate fonts with custom templates', async () => {
      // Custom template options
      const options: EnhancedOptions = {
        src: TEST_SVG_DIR,
        dist: path.join(TEST_OUTPUT_DIR, 'custom-templates'),
        fontName: 'custom-template-font',
        customTemplates: {
          customHtmlTemplate: path.join(
            __dirname,
            '../examples/custom-templates/custom-html-template.html'
          ),
          customCssTemplate: path.join(
            __dirname,
            '../examples/custom-templates/custom-css-template.css'
          ),
          templateVariables: {
            title: 'Custom Icon Font',
            fontClass: 'custom-icon',
            classNamePrefix: 'icon-',
          },
        },
      };

      // Run the font generation
      const result = await init(options);

      // Verify success
      expect(result).toBe(true);

      // Verify output files exist
      expect(fs.existsSync(path.join(options.dist, `${options.fontName}.ttf`))).toBe(true);
      expect(fs.existsSync(path.join(options.dist, 'demo_unicode.html'))).toBe(true);

      // Read the generated HTML file
      const htmlContent = fs.readFileSync(path.join(options.dist, 'demo_unicode.html'), 'utf-8');

      // Verify custom template was used
      expect(htmlContent).toContain('Custom Icon Font');
    }, 30000); // Increase timeout for integration test
  });

  describe('Batch Processing', () => {
    it('should process multiple input directories', async () => {
      // Create test directories
      const dir1 = path.join(TEST_OUTPUT_DIR, 'batch/dir1');
      const dir2 = path.join(TEST_OUTPUT_DIR, 'batch/dir2');

      fs.mkdirSync(dir1, { recursive: true });
      fs.mkdirSync(dir2, { recursive: true });

      // Copy some SVG files to test directories
      const svgFiles = fs.readdirSync(TEST_SVG_DIR).filter(file => file.endsWith('.svg'));

      // Copy first 5 SVGs to dir1
      for (let i = 0; i < 5 && i < svgFiles.length; i++) {
        fs.copyFileSync(path.join(TEST_SVG_DIR, svgFiles[i]), path.join(dir1, svgFiles[i]));
      }

      // Copy next 5 SVGs to dir2
      for (let i = 5; i < 10 && i < svgFiles.length; i++) {
        fs.copyFileSync(path.join(TEST_SVG_DIR, svgFiles[i]), path.join(dir2, svgFiles[i]));
      }

      // Batch processing options
      const options: EnhancedOptions = {
        fontName: 'batch-test-font',
        dist: path.join(TEST_OUTPUT_DIR, 'batch/output'),
        batchMode: true,
        inputDirectories: [dir1, dir2],
        outputPattern: '[name]/[fontname]',
        maxConcurrency: 2,
      };

      // Run the font generation
      const result = await init(options);

      // Verify success
      expect(result).toBe(true);

      // Verify output directories and files exist
      expect(fs.existsSync(path.join(options.dist, 'dir1'))).toBe(true);
      expect(fs.existsSync(path.join(options.dist, 'dir2'))).toBe(true);
      expect(fs.existsSync(path.join(options.dist, 'dir1', 'batch-test-font.ttf'))).toBe(true);
      expect(fs.existsSync(path.join(options.dist, 'dir2', 'batch-test-font.ttf'))).toBe(true);
    }, 60000); // Increase timeout for batch processing
  });

  describe('Error Handling', () => {
    it('should handle missing SVG directory gracefully', async () => {
      // Options with non-existent directory
      const options: EnhancedOptions = {
        src: path.join(TEST_OUTPUT_DIR, 'non-existent-dir'),
        dist: path.join(TEST_OUTPUT_DIR, 'error-handling'),
        fontName: 'error-test-font',
      };

      // Mock existsSync to return false for this specific path
      (fs.existsSync as jest.Mock).mockImplementationOnce((path: string) => {
        if (path === options.src) {
          return false;
        }
        return jest.requireActual('fs').existsSync(path);
      });

      // Run the font generation
      const result = await init(options);

      // Verify failure
      expect(result).toBe(false);
    });

    it('should handle empty SVG directory gracefully', async () => {
      // Create empty directory
      const emptyDir = path.join(TEST_OUTPUT_DIR, 'empty-dir');
      fs.mkdirSync(emptyDir, { recursive: true });

      // Options with empty directory
      const options: EnhancedOptions = {
        src: emptyDir,
        dist: path.join(TEST_OUTPUT_DIR, 'error-handling'),
        fontName: 'empty-test-font',
      };

      // Run the font generation
      const result = await init(options);

      // Verify failure
      expect(result).toBe(false);
    });

    it('should handle invalid SVG files gracefully', async () => {
      // Create directory with invalid SVG
      const invalidDir = path.join(TEST_OUTPUT_DIR, 'invalid-svg-dir');
      fs.mkdirSync(invalidDir, { recursive: true });

      // Create an invalid SVG file
      fs.writeFileSync(
        path.join(invalidDir, 'invalid.svg'),
        '<not-valid-svg>This is not a valid SVG</not-valid-svg>'
      );

      // Options with invalid SVG
      const options: EnhancedOptions = {
        src: invalidDir,
        dist: path.join(TEST_OUTPUT_DIR, 'error-handling'),
        fontName: 'invalid-test-font',
      };

      // Run the font generation
      const result = await init(options);

      // It might still succeed with warnings, but should not crash
      expect(typeof result).toBe('boolean');
    });
  });
});
