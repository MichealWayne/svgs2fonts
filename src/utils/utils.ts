/**
 * @fileoverview Comprehensive Utility Functions Library
 * @description Advanced utility functions providing logging, file system operations,
 * error handling, validation, and performance optimizations. Built with modern
 * TypeScript patterns for type safety and enhanced developer experience.
 *
 * @module utils/utils
 * @author Wayne <michealwayne@163.com>
 * @since 2018.07.30
 * @version 2.1.1
 * @lastModified 2025-07-27 17:45:00
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

import { IS_DEV, SUCCESS_FLAG } from '../constant';

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
enum LogLevel {
  /** Detailed debugging information for development */
  DEBUG = 0,
  /** General informational messages */
  INFO = 1,
  /** Warning messages for potential issues */
  WARN = 2,
  /** Error messages for failures and exceptions */
  ERROR = 3,
}

/**
 * Logger configuration options interface
 *
 * @interface LoggerOptions
 * @description Configuration options for customizing logger behavior including
 * output level, formatting, colors, and message prefixes.
 *
 * @since 2.0.0
 */
interface LoggerOptions {
  /**
   * Minimum log level to output
   *
   * @type {LogLevel} level
   * @description Messages below this level will be filtered out.
   * Higher values show fewer messages.
   *
   * @default LogLevel.INFO
   * @since 2.0.0
   */
  readonly level: LogLevel;

  /**
   * Whether to include timestamps in log messages
   *
   * @type {boolean} timestamp
   * @description When true, prepends ISO timestamp to each message.
   *
   * @default true
   * @since 2.0.0
   */
  readonly timestamp: boolean;

  /**
   * Whether to use ANSI colors in console output
   *
   * @type {boolean} colors
   * @description When true, applies color coding based on log level.
   * Automatically disabled in non-TTY environments.
   *
   * @default true
   * @since 2.0.0
   */
  readonly colors: boolean;

  /**
   * Optional prefix for all log messages
   *
   * @type {string} [prefix]
   * @description Custom prefix added to the beginning of each message.
   *
   * @example
   * prefix: '[MyApp]'
   *
   * @since 2.0.0
   */
  readonly prefix?: string;
}

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
  /** Immutable logger configuration */
  private readonly options: LoggerOptions;

  /** ANSI color codes for console output formatting */
  private static readonly COLORS = Object.freeze({
    reset: '\x1b[0m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    gray: '\x1b[90m',
  });

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
  constructor(options: Partial<LoggerOptions> = {}) {
    this.options = Object.freeze({
      level: LogLevel.INFO,
      timestamp: true,
      colors: true,
      ...options,
    });
  }

  private formatMessage(level: LogLevel, message: string): string {
    const parts: string[] = [];

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

  private shouldLog(level: LogLevel): boolean {
    return IS_DEV && level >= this.options.level;
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage(LogLevel.DEBUG, String(args.join(' '))));
    }
  }

  info(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage(LogLevel.INFO, String(args.join(' '))));
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, String(args.join(' '))));
    }
  }

  error(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, String(args.join(' '))));
    }
  }
}

// Global logger instance
const defaultLogger = new Logger({ prefix: 'svgs2fonts' });

/**
 * Enhanced logging functions with better formatting
 */
export function log(...args: unknown[]): void {
  defaultLogger.info(...args);
}

export function errorLog(...args: unknown[]): void {
  defaultLogger.error(...args);
}

export function warnLog(...args: unknown[]): void {
  defaultLogger.warn(...args);
}

export function debugLog(...args: unknown[]): void {
  defaultLogger.debug(...args);
}

// Type guards with better performance and clarity
export function isSuccessResult(res?: unknown): res is true {
  return res === SUCCESS_FLAG;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Enhanced Unicode generation with improved algorithm and caching
interface UnicodeGenerationOptions {
  readonly startUnicode: number;
  readonly maxUnicode?: number;
  readonly useDeterministicHashing?: boolean;
}

class UnicodeGenerator {
  private readonly cache = new Map<string, number>();
  private readonly usedCodes = new Set<number>();
  public readonly options: Required<UnicodeGenerationOptions>;

  constructor(options: UnicodeGenerationOptions) {
    this.options = {
      maxUnicode: 59999,
      useDeterministicHashing: true,
      ...options,
    };
  }

  generate(iconName: string): number {
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

  private generateDeterministic(iconName: string): number {
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

  private generateSequential(): number {
    let unicode = this.options.startUnicode;
    while (this.usedCodes.has(unicode) && unicode <= this.options.maxUnicode) {
      unicode++;
    }

    if (unicode > this.options.maxUnicode) {
      throw new Error(
        `Unicode range exhausted. Cannot generate more than ${
          this.options.maxUnicode - this.options.startUnicode + 1
        } icons.`
      );
    }

    return unicode;
  }

  public generateNextSequential(): number {
    return this.generateSequential();
  }

  public hasUnicodeInUse(unicode: number): boolean {
    return this.usedCodes.has(unicode);
  }

  reset(): void {
    this.cache.clear();
    this.usedCodes.clear();
  }

  getStats(): { cacheSize: number; usedCodes: number; collisionRate: number } {
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
let globalUnicodeGenerator: UnicodeGenerator | null = null;

export function getIconStrUnicode(iconName: string, unicodeStart: number): number {
  if (!globalUnicodeGenerator || globalUnicodeGenerator.options.startUnicode !== unicodeStart) {
    globalUnicodeGenerator = new UnicodeGenerator({ startUnicode: unicodeStart });
  }

  return globalUnicodeGenerator.generate(iconName);
}

export { LogLevel };
export type { LoggerOptions };
