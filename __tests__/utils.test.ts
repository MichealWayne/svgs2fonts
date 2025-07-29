/**
 * @module utils.test
 * @author Wayne<michealwayne@163.com>
 * @Date 2025-07-27
 * @description Tests for utils module
 */

import {
  debugLog,
  errorLog,
  getIconStrUnicode,
  isNumber,
  isObject,
  isString,
  isSuccessResult,
  log,
  LogLevel,
  warnLog,
} from '../src/utils/utils';

// Mock console methods to avoid test output pollution
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
};

beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

describe('Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Logging functions', () => {
    it('should export log function', () => {
      expect(typeof log).toBe('function');
      log('test message');
      // In non-dev environment, logging might be suppressed
    });

    it('should export errorLog function', () => {
      expect(typeof errorLog).toBe('function');
      errorLog('error message');
    });

    it('should export warnLog function', () => {
      expect(typeof warnLog).toBe('function');
      warnLog('warning message');
    });

    it('should export debugLog function', () => {
      expect(typeof debugLog).toBe('function');
      debugLog('debug message');
    });

    it('should handle multiple arguments in log functions', () => {
      log('message', 'with', 'multiple', 'args');
      errorLog('error', 'with', 'details');
      warnLog('warning', 'with', 'context');
      debugLog('debug', 'with', 'info');
    });
  });

  describe('Type guards', () => {
    describe('isSuccessResult', () => {
      it('should return true for SUCCESS_FLAG', () => {
        expect(isSuccessResult(true)).toBe(true);
      });

      it('should return false for non-success values', () => {
        expect(isSuccessResult(false)).toBe(false);
        expect(isSuccessResult(null)).toBe(false);
        expect(isSuccessResult(undefined)).toBe(false);
        expect(isSuccessResult(0)).toBe(false);
        expect(isSuccessResult('')).toBe(false);
        expect(isSuccessResult({})).toBe(false);
      });
    });

    describe('isString', () => {
      it('should return true for strings', () => {
        expect(isString('hello')).toBe(true);
        expect(isString('')).toBe(true);
        expect(isString('123')).toBe(true);
      });

      it('should return false for non-strings', () => {
        expect(isString(123)).toBe(false);
        expect(isString(null)).toBe(false);
        expect(isString(undefined)).toBe(false);
        expect(isString({})).toBe(false);
        expect(isString([])).toBe(false);
        expect(isString(true)).toBe(false);
      });
    });

    describe('isNumber', () => {
      it('should return true for finite numbers', () => {
        expect(isNumber(123)).toBe(true);
        expect(isNumber(0)).toBe(true);
        expect(isNumber(-123)).toBe(true);
        expect(isNumber(3.14)).toBe(true);
      });

      it('should return false for non-numbers and infinite values', () => {
        expect(isNumber('123')).toBe(false);
        expect(isNumber(null)).toBe(false);
        expect(isNumber(undefined)).toBe(false);
        expect(isNumber({})).toBe(false);
        expect(isNumber([])).toBe(false);
        expect(isNumber(true)).toBe(false);
        expect(isNumber(Infinity)).toBe(false);
        expect(isNumber(-Infinity)).toBe(false);
        expect(isNumber(NaN)).toBe(false);
      });
    });

    describe('isObject', () => {
      it('should return true for plain objects', () => {
        expect(isObject({})).toBe(true);
        expect(isObject({ key: 'value' })).toBe(true);
      });

      it('should return false for non-objects', () => {
        expect(isObject(null)).toBe(false);
        expect(isObject(undefined)).toBe(false);
        expect(isObject('string')).toBe(false);
        expect(isObject(123)).toBe(false);
        expect(isObject(true)).toBe(false);
        expect(isObject([])).toBe(false);
      });
    });
  });

  describe('Unicode generation', () => {
    describe('getIconStrUnicode', () => {
      it('should generate unicode for icon names', () => {
        const unicode1 = getIconStrUnicode('icon1', 10000);
        const unicode2 = getIconStrUnicode('icon2', 10000);

        expect(typeof unicode1).toBe('number');
        expect(typeof unicode2).toBe('number');
        expect(unicode1).toBeGreaterThanOrEqual(10000);
        expect(unicode2).toBeGreaterThanOrEqual(10000);
      });

      it('should generate consistent unicode for same icon name', () => {
        const unicode1 = getIconStrUnicode('test-icon', 15000);
        const unicode2 = getIconStrUnicode('test-icon', 15000);

        expect(unicode1).toBe(unicode2);
      });

      it('should generate different unicode for different icon names', () => {
        const unicode1 = getIconStrUnicode('icon-a', 20000);
        const unicode2 = getIconStrUnicode('icon-b', 20000);

        expect(unicode1).not.toBe(unicode2);
      });

      it('should respect different start unicode values', () => {
        const unicode1 = getIconStrUnicode('test', 10000);
        const unicode2 = getIconStrUnicode('test', 20000);

        expect(unicode1).toBeGreaterThanOrEqual(10000);
        expect(unicode2).toBeGreaterThanOrEqual(20000);
      });

      it('should handle empty icon names', () => {
        const unicode = getIconStrUnicode('', 30000);
        expect(typeof unicode).toBe('number');
        expect(unicode).toBeGreaterThanOrEqual(30000);
      });

      it('should handle special characters in icon names', () => {
        const unicode1 = getIconStrUnicode('icon-with-dashes', 40000);
        const unicode2 = getIconStrUnicode('icon_with_underscores', 40000);
        const unicode3 = getIconStrUnicode('icon.with.dots', 40000);

        expect(typeof unicode1).toBe('number');
        expect(typeof unicode2).toBe('number');
        expect(typeof unicode3).toBe('number');
        expect(unicode1).toBeGreaterThanOrEqual(40000);
        expect(unicode2).toBeGreaterThanOrEqual(40000);
        expect(unicode3).toBeGreaterThanOrEqual(40000);
      });
    });
  });

  describe('LogLevel enum', () => {
    it('should export LogLevel enum', () => {
      expect(LogLevel).toBeDefined();
      expect(LogLevel.DEBUG).toBe(0);
      expect(LogLevel.INFO).toBe(1);
      expect(LogLevel.WARN).toBe(2);
      expect(LogLevel.ERROR).toBe(3);
    });
  });

  describe('Edge cases', () => {
    it('should handle null and undefined in type guards', () => {
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
      expect(isObject(null)).toBe(false);
      expect(isObject(undefined)).toBe(false);
    });

    it('should handle edge cases in unicode generation', () => {
      // Test with very long icon names
      const longName = 'a'.repeat(1000);
      const unicode = getIconStrUnicode(longName, 50000);
      expect(typeof unicode).toBe('number');
      expect(unicode).toBeGreaterThanOrEqual(50000);
    });
  });
});
