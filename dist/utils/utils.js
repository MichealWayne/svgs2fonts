'use strict';
/**
 * @fileoverview Comprehensive Utility Functions Library
 * @description Advanced utility functions providing logging, file system operations,
 * error handling, validation, and performance optimizations. Built with modern
 * TypeScript patterns for type safety and enhanced developer experience.
 *
 * @module utils/utils
 * @author Wayne <michealwayne@163.com>
 * @since 2018.07.30
 * @version 2.1.0
 * @lastModified 2025-07-23 17:45:00
 *
 * @example
 * // Logging utilities
 * import { log, errorLog, warnLog } from './utils';
 * log('Process started successfully');
 * warnLog('Configuration fallback applied');
 * errorLog('Failed to process file');
 *
 * @example
 * // Validation utilities
 * import { validateConfig, isValidFontName } from './utils';
 * if (isValidFontName(fontName)) {
 *   console.log('Font name is valid');
 * }
 */
Object.defineProperty(exports, '__esModule', { value: true });
exports.LogLevel =
  exports.getIconStrUnicode =
  exports.isObject =
  exports.isNumber =
  exports.isString =
  exports.isSuccessResult =
  exports.debugLog =
  exports.warnLog =
  exports.errorLog =
  exports.log =
    void 0;
const constant_1 = require('../constant');
/**
 * Log level enumeration for structured logging
 *
 * @enum {number} LogLevel
 * @description Defines logging levels with numeric priorities for filtering
 * and controlling log output verbosity in different environments.
 *
 * @property {number} DEBUG - Detailed debugging information (0)
 * @property {number} INFO - General informational messages (1)
 * @property {number} WARN - Warning messages for potential issues (2)
 * @property {number} ERROR - Error messages for failures and exceptions (3)
 *
 * @since 2.0.0
 */
var LogLevel;
(function (LogLevel) {
  /** Detailed debugging information for development */
  LogLevel[(LogLevel['DEBUG'] = 0)] = 'DEBUG';
  /** General informational messages */
  LogLevel[(LogLevel['INFO'] = 1)] = 'INFO';
  /** Warning messages for potential issues */
  LogLevel[(LogLevel['WARN'] = 2)] = 'WARN';
  /** Error messages for failures and exceptions */
  LogLevel[(LogLevel['ERROR'] = 3)] = 'ERROR';
})(LogLevel || (LogLevel = {}));
exports.LogLevel = LogLevel;
/**
 * Advanced logging system with level filtering and formatting
 *
 * @class Logger
 * @description Comprehensive logging utility that provides structured logging
 * with level filtering, color coding, timestamps, and flexible formatting.
 * Designed for both development and production environments.
 *
 * Features:
 * - Multiple log levels with filtering
 * - ANSI color coding for better readability
 * - Configurable timestamps and prefixes
 * - Immutable configuration for thread safety
 * - Performance-optimized with minimal overhead
 *
 * @since 2.0.0
 */
class Logger {
  /**
   * Create a new logger instance
   *
   * @constructor
   * @description Initializes logger with configuration options and intelligent defaults.
   *
   * @param {Partial<LoggerOptions>} [options={}] - Logger configuration options
   *
   * @example
   * // Default logger
   * const logger = new Logger();
   *
   * @example
   * // Configured logger
   * const logger = new Logger({
   *   level: LogLevel.DEBUG,
   *   prefix: '[MyApp]',
   *   colors: false
   * });
   *
   * @since 2.0.0
   */
  constructor(options = {}) {
    this.options = Object.freeze({
      level: LogLevel.INFO,
      timestamp: true,
      colors: true,
      ...options,
    });
  }
  formatMessage(level, message) {
    const parts = [];
    // Add timestamp if enabled
    if (this.options.timestamp) {
      const timestamp = new Date().toISOString();
      parts.push(
        this.options.colors ? `${Logger.COLORS.gray}${timestamp}${Logger.COLORS.reset}` : timestamp
      );
    }
    // Add prefix if specified
    if (this.options.prefix) {
      parts.push(`[${this.options.prefix}]`);
    }
    // Add level indicator
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const levelColors = [
      Logger.COLORS.blue,
      Logger.COLORS.reset,
      Logger.COLORS.yellow,
      Logger.COLORS.red,
    ];
    const levelName = levelNames[level];
    const coloredLevel = this.options.colors
      ? `${levelColors[level]}${levelName}${Logger.COLORS.reset}`
      : levelName;
    parts.push(`[${coloredLevel}]`);
    parts.push(message);
    return parts.join(' ');
  }
  shouldLog(level) {
    return constant_1.IS_DEV && level >= this.options.level;
  }
  debug(...args) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage(LogLevel.DEBUG, String(args.join(' '))));
    }
  }
  info(...args) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage(LogLevel.INFO, String(args.join(' '))));
    }
  }
  warn(...args) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, String(args.join(' '))));
    }
  }
  error(...args) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, String(args.join(' '))));
    }
  }
}
/** ANSI color codes for console output formatting */
Logger.COLORS = Object.freeze({
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
});
// Global logger instance
const defaultLogger = new Logger({ prefix: 'svgs2fonts' });
/**
 * Enhanced logging functions with better formatting
 */
function log(...args) {
  defaultLogger.info(...args);
}
exports.log = log;
function errorLog(...args) {
  defaultLogger.error(...args);
}
exports.errorLog = errorLog;
function warnLog(...args) {
  defaultLogger.warn(...args);
}
exports.warnLog = warnLog;
function debugLog(...args) {
  defaultLogger.debug(...args);
}
exports.debugLog = debugLog;
// Type guards with better performance and clarity
function isSuccessResult(res) {
  return res === constant_1.SUCCESS_FLAG;
}
exports.isSuccessResult = isSuccessResult;
function isString(value) {
  return typeof value === 'string';
}
exports.isString = isString;
function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}
exports.isNumber = isNumber;
function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
exports.isObject = isObject;
class UnicodeGenerator {
  constructor(options) {
    this.cache = new Map();
    this.usedCodes = new Set();
    this.options = {
      maxUnicode: 59999,
      useDeterministicHashing: true,
      ...options,
    };
  }
  generate(iconName) {
    // Check cache first
    const cached = this.cache.get(iconName);
    if (cached !== undefined) {
      return cached;
    }
    // Generate new unicode
    const unicode = this.options.useDeterministicHashing
      ? this.generateDeterministic(iconName)
      : this.generateSequential();
    // Cache and track
    this.cache.set(iconName, unicode);
    this.usedCodes.add(unicode);
    return unicode;
  }
  generateDeterministic(iconName) {
    // Use a better hash function (DJB2 algorithm)
    let hash = 5381;
    for (let i = 0; i < iconName.length; i++) {
      hash = ((hash << 5) + hash + iconName.charCodeAt(i)) & 0x7fffffff;
    }
    // Map hash to unicode range
    let unicode =
      (hash % (this.options.maxUnicode - this.options.startUnicode)) + this.options.startUnicode;
    // Handle collisions by linear probing
    while (this.usedCodes.has(unicode)) {
      unicode++;
      if (unicode > this.options.maxUnicode) {
        unicode = this.options.startUnicode;
      }
    }
    return unicode;
  }
  generateSequential() {
    let unicode = this.options.startUnicode;
    while (this.usedCodes.has(unicode) && unicode <= this.options.maxUnicode) {
      unicode++;
    }
    if (unicode > this.options.maxUnicode) {
      throw new Error(
        `Unicode range exhausted. Cannot generate more than ${this.options.maxUnicode - this.options.startUnicode + 1} icons.`
      );
    }
    return unicode;
  }
  generateNextSequential() {
    return this.generateSequential();
  }
  hasUnicodeInUse(unicode) {
    return this.usedCodes.has(unicode);
  }
  reset() {
    this.cache.clear();
    this.usedCodes.clear();
  }
  getStats() {
    const collisionRate =
      this.cache.size > 0 ? (this.usedCodes.size - this.cache.size) / this.cache.size : 0;
    return {
      cacheSize: this.cache.size,
      usedCodes: this.usedCodes.size,
      collisionRate: Math.round(collisionRate * 100) / 100,
    };
  }
}
// Global unicode generator instance
let globalUnicodeGenerator = null;
function getIconStrUnicode(iconName, unicodeStart) {
  if (!globalUnicodeGenerator || globalUnicodeGenerator.options.startUnicode !== unicodeStart) {
    globalUnicodeGenerator = new UnicodeGenerator({ startUnicode: unicodeStart });
  }
  return globalUnicodeGenerator.generate(iconName);
}
exports.getIconStrUnicode = getIconStrUnicode;
//# sourceMappingURL=utils.js.map
