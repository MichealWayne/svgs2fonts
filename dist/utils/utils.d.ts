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
declare enum LogLevel {
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
 * Enhanced logging functions with better formatting
 */
export declare function log(...args: unknown[]): void;
export declare function errorLog(...args: unknown[]): void;
export declare function warnLog(...args: unknown[]): void;
export declare function debugLog(...args: unknown[]): void;
export declare function isSuccessResult(res?: unknown): res is true;
export declare function isString(value: unknown): value is string;
export declare function isNumber(value: unknown): value is number;
export declare function isObject(value: unknown): value is Record<string, unknown>;
export declare function getIconStrUnicode(iconName: string, unicodeStart: number): number;
export { LogLevel };
export type { LoggerOptions };
//# sourceMappingURL=utils.d.ts.map
