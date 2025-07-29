/**
 * @module EnhancedOptions.test
 * @author Wayne<michealwayne@163.com>
 * @Date 2025-07-27
 * @description Tests for EnhancedOptions type definitions
 */

import { EnhancedOptions } from '../src/types/EnhancedOptions';
import { FontFormat } from '../src/types/FontTypes';

describe('EnhancedOptions', () => {
  describe('Type definitions', () => {
    it('should allow basic required options', () => {
      const options: Partial<EnhancedOptions> = {
        src: './test-svgs',
        fontName: 'test-font',
      };

      expect(options.src).toBe('./test-svgs');
      expect(options.fontName).toBe('test-font');
    });

    it('should allow font format options', () => {
      const options: Partial<EnhancedOptions> = {
        src: './test-svgs',
        fontName: 'test-font',
        fontFormats: ['ttf', 'woff', 'woff2'] as FontFormat[],
      };

      expect(options.fontFormats).toEqual(['ttf', 'woff', 'woff2']);
    });

    it('should allow batch processing options', () => {
      const options: Partial<EnhancedOptions> = {
        src: './test-svgs',
        fontName: 'test-font',
        batchMode: true,
        inputDirectories: ['./dir1', './dir2'],
        batchSize: 10,
        continueOnError: true,
      };

      expect(options.batchMode).toBe(true);
      expect(options.inputDirectories).toEqual(['./dir1', './dir2']);
      expect(options.batchSize).toBe(10);
      expect(options.continueOnError).toBe(true);
    });

    it('should allow monitoring options', () => {
      const options: Partial<EnhancedOptions> = {
        src: './test-svgs',
        fontName: 'test-font',
        verbose: true,
        performanceAnalysis: true,
      };

      expect(options.verbose).toBe(true);
      expect(options.performanceAnalysis).toBe(true);
    });

    it('should allow progress callback', () => {
      const mockCallback = jest.fn();
      const options: Partial<EnhancedOptions> = {
        src: './test-svgs',
        fontName: 'test-font',
        progressCallback: mockCallback,
      };

      expect(options.progressCallback).toBe(mockCallback);
    });

    it('should allow all options together', () => {
      const mockCallback = jest.fn();
      const options: Partial<EnhancedOptions> = {
        src: './test-svgs',
        fontName: 'test-font',
        fontFormats: ['ttf', 'woff2'] as FontFormat[],
        batchMode: true,
        inputDirectories: ['./dir1', './dir2'],
        batchSize: 5,
        continueOnError: false,
        verbose: true,
        progressCallback: mockCallback,
        performanceAnalysis: true,
      };

      expect(options.src).toBe('./test-svgs');
      expect(options.fontName).toBe('test-font');
      expect(options.fontFormats).toEqual(['ttf', 'woff2']);
      expect(options.batchMode).toBe(true);
      expect(options.inputDirectories).toEqual(['./dir1', './dir2']);
      expect(options.batchSize).toBe(5);
      expect(options.continueOnError).toBe(false);
      expect(options.verbose).toBe(true);
      expect(options.progressCallback).toBe(mockCallback);
      expect(options.performanceAnalysis).toBe(true);
    });
  });

  describe('Optional properties', () => {
    it('should work with minimal options', () => {
      const options: Partial<EnhancedOptions> = {
        src: './minimal',
        fontName: 'minimal-font',
      };

      // All other properties should be optional
      expect(options.fontFormats).toBeUndefined();
      expect(options.batchMode).toBeUndefined();
      expect(options.inputDirectories).toBeUndefined();
      expect(options.batchSize).toBeUndefined();
      expect(options.continueOnError).toBeUndefined();
      expect(options.verbose).toBeUndefined();
      expect(options.progressCallback).toBeUndefined();
      expect(options.performanceAnalysis).toBeUndefined();
    });

    it('should allow partial batch options', () => {
      const options: Partial<EnhancedOptions> = {
        src: './test-svgs',
        fontName: 'test-font',
        batchMode: true,
        // inputDirectories is optional even when batchMode is true
      };

      expect(options.batchMode).toBe(true);
      expect(options.inputDirectories).toBeUndefined();
    });

    it('should allow partial monitoring options', () => {
      const options: Partial<EnhancedOptions> = {
        src: './test-svgs',
        fontName: 'test-font',
        verbose: true,
        // performanceAnalysis is optional
      };

      expect(options.verbose).toBe(true);
      expect(options.performanceAnalysis).toBeUndefined();
    });
  });

  describe('Type compatibility', () => {
    it('should be compatible with InitOptionsParams', () => {
      // This test ensures EnhancedOptions extends InitOptionsParams properly
      const baseOptions = {
        src: './test-svgs',
        dist: './dist',
        fontName: 'test-font',
        unicodeStart: 0xe000,
        debug: false,
        noDemo: false,
        demoUnicodeHTML: '<span>&#x{{unicode}};</span>',
        demoFontClassHTML: '<span class="{{fontClass}}">{{name}}</span>',
      };

      const enhancedOptions: Partial<EnhancedOptions> = {
        ...baseOptions,
        fontFormats: ['ttf', 'woff2'] as FontFormat[],
        verbose: true,
      };

      expect(enhancedOptions.src).toBe('./test-svgs');
      expect(enhancedOptions.dist).toBe('./dist');
      expect(enhancedOptions.fontName).toBe('test-font');
      expect(enhancedOptions.fontFormats).toEqual(['ttf', 'woff2']);
      expect(enhancedOptions.verbose).toBe(true);
    });

    it('should allow function types for callbacks', () => {
      const progressCallback = (progress: { completed: number; total: number }) => {
        console.log(`Progress: ${progress.completed}/${progress.total}`);
      };

      const options: Partial<EnhancedOptions> = {
        src: './test-svgs',
        fontName: 'test-font',
        progressCallback,
      };

      expect(typeof options.progressCallback).toBe('function');
    });
  });

  describe('Default values and validation', () => {
    it('should handle boolean options correctly', () => {
      const options: Partial<EnhancedOptions> = {
        src: './test-svgs',
        fontName: 'test-font',
        batchMode: false,
        continueOnError: false,
        verbose: false,
        performanceAnalysis: false,
      };

      expect(options.batchMode).toBe(false);
      expect(options.continueOnError).toBe(false);
      expect(options.verbose).toBe(false);
      expect(options.performanceAnalysis).toBe(false);
    });

    it('should handle array options correctly', () => {
      const options: Partial<EnhancedOptions> = {
        src: './test-svgs',
        fontName: 'test-font',
        fontFormats: [],
        inputDirectories: [],
      };

      expect(Array.isArray(options.fontFormats)).toBe(true);
      expect(Array.isArray(options.inputDirectories)).toBe(true);
      expect(options.fontFormats).toHaveLength(0);
      expect(options.inputDirectories).toHaveLength(0);
    });

    it('should handle number options correctly', () => {
      const options: Partial<EnhancedOptions> = {
        src: './test-svgs',
        fontName: 'test-font',
        batchSize: 0,
      };

      expect(typeof options.batchSize).toBe('number');
      expect(options.batchSize).toBe(0);
    });
  });

  describe('Complex scenarios', () => {
    it('should support nested configuration objects', () => {
      const options: Partial<EnhancedOptions> = {
        src: './test-svgs',
        fontName: 'test-font',
        // These would be part of InitOptionsParams if they exist
        dist: './output',
        unicodeStart: 0xf000,
      };

      expect(options.dist).toBe('./output');
      expect(options.unicodeStart).toBe(0xf000);
    });

    it('should handle large batch configurations', () => {
      const largeDirectoryList = Array.from({ length: 100 }, (_, i) => `./dir${i}`);

      const options: Partial<EnhancedOptions> = {
        src: './test-svgs',
        fontName: 'test-font',
        batchMode: true,
        inputDirectories: largeDirectoryList,
        batchSize: 50,
        continueOnError: true,
      };

      expect(options.inputDirectories).toHaveLength(100);
      expect(options.batchSize).toBe(50);
    });

    it('should support complex progress callback scenarios', () => {
      const progressHistory: any[] = [];

      const progressCallback = (progress: any) => {
        progressHistory.push({ ...progress, timestamp: Date.now() });
      };

      const options: Partial<EnhancedOptions> = {
        src: './test-svgs',
        fontName: 'test-font',
        progressCallback,
        verbose: true,
        performanceAnalysis: true,
      };

      // Simulate progress updates
      options.progressCallback?.({ completed: 1, total: 10, phase: 'processing' as any });
      options.progressCallback?.({ completed: 5, total: 10, phase: 'processing' as any });
      options.progressCallback?.({ completed: 10, total: 10, phase: 'processing' as any });

      expect(progressHistory).toHaveLength(3);
      expect(progressHistory[0].completed).toBe(1);
      expect(progressHistory[1].completed).toBe(5);
      expect(progressHistory[2].completed).toBe(10);
    });
  });
});
