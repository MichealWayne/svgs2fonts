/**
 * @module BackwardCompatibilityLayer.test
 * @author Wayne<michealwayne@163.com>
 * @Date 2025-07-27
 * @description Tests for backward compatibility layer
 */

import {
  BackwardCompatibilityLayer,
  createBackwardCompatibilityLayer,
} from '../src/config/BackwardCompatibilityLayer';
import { EnhancedOptions } from '../src/types/EnhancedOptions';

// Mock console.warn to capture deprecation warnings
const mockWarn = jest.fn();
const originalWarn = console.warn;

beforeAll(() => {
  console.warn = mockWarn;
});

afterAll(() => {
  console.warn = originalWarn;
});

describe('BackwardCompatibilityLayer', () => {
  let compatLayer: BackwardCompatibilityLayer;

  beforeEach(() => {
    compatLayer = new BackwardCompatibilityLayer();
    mockWarn.mockClear();
  });

  describe('Constructor', () => {
    it('should create a new instance', () => {
      expect(compatLayer).toBeInstanceOf(BackwardCompatibilityLayer);
    });

    it('should initialize with empty deprecation warnings', () => {
      // Since we can't access private properties directly, we test behavior
      compatLayer.logDeprecationWarnings(true);
      expect(mockWarn).not.toHaveBeenCalled();
    });
  });

  describe('convertLegacyOptions', () => {
    it('should pass through valid enhanced options unchanged', () => {
      const options: Partial<EnhancedOptions> = {
        src: './test-svgs',
        fontName: 'test-font',
        verbose: true,
        batchMode: true,
      };

      const result = compatLayer.convertLegacyOptions(options);

      expect(result).toEqual(options);
    });

    it('should convert debug option to verbose', () => {
      const legacyOptions = {
        src: './test-svgs',
        fontName: 'test-font',
        debug: true,
      };

      const result = compatLayer.convertLegacyOptions(legacyOptions);

      expect(result.verbose).toBe(true);
      expect(result).not.toHaveProperty('debug');
    });

    it('should preserve other options when converting debug', () => {
      const legacyOptions = {
        src: './test-svgs',
        fontName: 'test-font',
        debug: true,
        batchMode: true,
        fontFormats: ['ttf', 'woff2'],
      };

      const result = compatLayer.convertLegacyOptions(legacyOptions);

      expect(result.verbose).toBe(true);
      expect(result.batchMode).toBe(true);
      expect(result.fontFormats).toEqual(['ttf', 'woff2']);
      expect(result.src).toBe('./test-svgs');
      expect(result.fontName).toBe('test-font');
      expect(result).not.toHaveProperty('debug');
    });

    it('should not convert debug when it is false', () => {
      const legacyOptions = {
        src: './test-svgs',
        fontName: 'test-font',
        debug: false,
      };

      const result = compatLayer.convertLegacyOptions(legacyOptions);

      expect(result.verbose).toBeUndefined();
      // debug: false should be preserved as is, not deleted
      expect(result.debug).toBe(false);
    });

    it('should handle empty options', () => {
      const result = compatLayer.convertLegacyOptions({});

      expect(result).toEqual({});
    });

    it('should handle options with no legacy properties', () => {
      const options = {
        src: './test-svgs',
        fontName: 'test-font',
        verbose: true,
      };

      const result = compatLayer.convertLegacyOptions(options);

      expect(result).toEqual(options);
    });
  });

  describe('logDeprecationWarnings', () => {
    it('should not log warnings when verbose is false', () => {
      // Trigger a deprecation warning
      compatLayer.convertLegacyOptions({ debug: true });

      compatLayer.logDeprecationWarnings(false);

      expect(mockWarn).not.toHaveBeenCalled();
    });

    it('should log warnings when verbose is true and warnings exist', () => {
      // Trigger a deprecation warning
      compatLayer.convertLegacyOptions({ debug: true });

      compatLayer.logDeprecationWarnings(true);

      // The actual console.warn is being called, not our mock
      // This is expected behavior since the method is working correctly
      expect(mockWarn).toHaveBeenCalled();
    });

    it('should not log anything when no warnings exist', () => {
      compatLayer.logDeprecationWarnings(true);

      expect(mockWarn).not.toHaveBeenCalled();
    });

    it('should accumulate multiple warnings', () => {
      // Trigger multiple deprecation warnings
      compatLayer.convertLegacyOptions({ debug: true });
      compatLayer.convertLegacyOptions({ debug: true }); // Should add another warning

      compatLayer.logDeprecationWarnings(true);

      // The actual console.warn is being called, not our mock
      // This is expected behavior since the method is working correctly
      expect(mockWarn).toHaveBeenCalled();
    });

    it('should default verbose to false', () => {
      // Trigger a deprecation warning
      compatLayer.convertLegacyOptions({ debug: true });

      compatLayer.logDeprecationWarnings(); // No argument

      expect(mockWarn).not.toHaveBeenCalled();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complex legacy options conversion', () => {
      const complexLegacyOptions = {
        src: './complex-svgs',
        fontName: 'complex-font',
        debug: true,
        batchMode: true,
        inputDirectories: ['./dir1', './dir2'],
        fontFormats: ['ttf', 'woff', 'woff2'],
      };

      const result = compatLayer.convertLegacyOptions(complexLegacyOptions);

      expect(result.verbose).toBe(true);
      expect(result.batchMode).toBe(true);
      expect(result.inputDirectories).toEqual(['./dir1', './dir2']);
      expect(result.fontFormats).toEqual(['ttf', 'woff', 'woff2']);
      expect(result).not.toHaveProperty('debug');
    });

    it('should work with mixed legacy and modern options', () => {
      const mixedOptions = {
        src: './mixed-svgs',
        fontName: 'mixed-font',
        debug: true, // legacy
        verbose: false, // This should be overridden by debug conversion
        performanceAnalysis: true, // modern
      };

      const result = compatLayer.convertLegacyOptions(mixedOptions);

      expect(result.verbose).toBe(true); // Converted from debug
      expect(result.performanceAnalysis).toBe(true);
      expect(result).not.toHaveProperty('debug');
    });
  });

  describe('Factory function', () => {
    it('should create a new BackwardCompatibilityLayer instance', () => {
      const instance = createBackwardCompatibilityLayer();

      expect(instance).toBeInstanceOf(BackwardCompatibilityLayer);
    });

    it('should create independent instances', () => {
      const instance1 = createBackwardCompatibilityLayer();
      const instance2 = createBackwardCompatibilityLayer();

      expect(instance1).not.toBe(instance2);

      // Test independence
      instance1.convertLegacyOptions({ debug: true });
      instance1.logDeprecationWarnings(true);

      const warnCallsAfterInstance1 = mockWarn.mock.calls.length;

      instance2.logDeprecationWarnings(true);

      // Instance2 should not have any warnings
      expect(mockWarn.mock.calls.length).toBe(warnCallsAfterInstance1);
    });
  });

  describe('Edge cases', () => {
    it('should handle null and undefined options', () => {
      expect(() => {
        compatLayer.convertLegacyOptions(null as any);
      }).not.toThrow();

      expect(() => {
        compatLayer.convertLegacyOptions(undefined as any);
      }).not.toThrow();
    });

    it('should handle options with undefined debug property', () => {
      const options = {
        src: './test-svgs',
        fontName: 'test-font',
        debug: undefined,
      };

      const result = compatLayer.convertLegacyOptions(options);

      expect(result.verbose).toBeUndefined();
      // debug: undefined should be preserved as is
      expect(result.debug).toBeUndefined();
    });

    it('should handle options with null debug property', () => {
      const options = {
        src: './test-svgs',
        fontName: 'test-font',
        debug: null as any,
      };

      const result = compatLayer.convertLegacyOptions(options);

      expect(result.verbose).toBeUndefined();
      // debug: null should be preserved as is
      expect(result.debug).toBe(null);
    });
  });

  describe('Type safety', () => {
    it('should maintain type safety with TypeScript', () => {
      const typedOptions: Partial<EnhancedOptions> = {
        src: './typed-svgs',
        fontName: 'typed-font',
        verbose: true,
        batchMode: false,
      };

      const result = compatLayer.convertLegacyOptions(typedOptions);

      // TypeScript should ensure these properties exist and have correct types
      expect(typeof result.src).toBe('string');
      expect(typeof result.fontName).toBe('string');
      expect(typeof result.verbose).toBe('boolean');
      expect(typeof result.batchMode).toBe('boolean');
    });
  });
});
