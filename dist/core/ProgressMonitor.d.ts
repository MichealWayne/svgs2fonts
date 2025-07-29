/**
 * @module ProgressMonitor
 * @author Wayne<michealwayne@163.com>
 * @Date 2025-07-17 17:30:00
 * @LastEditTime 2025-07-29 13:29:11
 */
import { ProgressCallback } from '../types/OptionType';
/**
 * Phase timing information
 */
export interface PhaseTimings {
  [phase: string]: {
    duration: number;
    startTime: number;
    endTime: number;
  };
}
/**
 * File processing statistics
 */
export interface FileStatistics {
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  skippedFiles: number;
  totalInputSize: number;
  totalOutputSize: number;
}
/**
 * Memory usage statistics
 */
export interface MemoryStats {
  peakMemoryUsage: number;
  currentMemoryUsage: number;
  memoryEfficiency: number;
}
/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  savedTime: number;
}
/**
 * Comprehensive performance report
 */
export interface PerformanceReport {
  totalTime: number;
  phaseBreakdown: PhaseTimings;
  fileStats: FileStatistics;
  memoryUsage: MemoryStats;
  throughput: {
    filesPerSecond: number;
    bytesPerSecond: number;
  };
  cacheStats?: CacheStats;
  taskBreakdown?: {
    svgProcessing: number;
    fontGeneration: number;
    demoGeneration: number;
  };
}
/**
 * Current progress state
 */
export interface ProgressState {
  completed: number;
  total: number;
  current?: string;
  phase: string;
  startTime: number;
  lastUpdateTime: number;
  estimatedTimeRemaining?: number;
  percentComplete: number;
}
/**
 * Progress monitor interface
 */
export interface ProgressMonitor {
  /**
   * Start tracking progress
   * @param options Progress tracking options or total number of tasks
   */
  startTracking(
    options:
      | {
          total: number;
          phase?: string;
          description?: string;
        }
      | number
  ): void;
  /**
   * Update progress state
   * @param options Progress update options or number of completed tasks
   */
  updateProgress(
    options:
      | {
          completed: number;
          total?: number;
          current?: string;
        }
      | number
  ): void;
  /**
   * Set current processing phase
   * @param phase Phase name
   */
  setPhase(phase: string): void;
  /**
   * Record timing for a specific phase
   * @param phase Phase name
   * @param duration Duration in milliseconds
   */
  recordTiming(phase: string, duration: number): void;
  /**
   * Record file statistics
   * @param stats File statistics to record
   */
  recordFileStats(stats: Partial<FileStatistics>): void;
  /**
   * Record current memory usage
   */
  recordMemoryUsage(): void;
  /**
   * Record cache statistics
   * @param stats Cache statistics to record
   */
  recordCacheStats(stats: Partial<CacheStats>): void;
  /**
   * Generate comprehensive performance report
   * @returns Performance report
   */
  generateReport(): PerformanceReport;
  /**
   * Get current progress state
   * @returns Progress state
   */
  getProgress(): ProgressState;
  /**
   * Register progress callback
   * @param callback Progress callback function
   */
  onProgress(callback: ProgressCallback): void;
  /**
   * Reset progress monitor state
   */
  reset(): void;
  /**
   * Log progress to console if verbose mode is enabled
   * @param verbose Whether verbose mode is enabled
   */
  logProgress(verbose?: boolean): void;
}
/**
 * Default progress monitor implementation
 */
export declare class DefaultProgressMonitor implements ProgressMonitor {
  private progressState;
  private phaseTimings;
  private fileStats;
  private memoryStats;
  private cacheStats;
  private progressCallbacks;
  private phaseStartTimes;
  private lastLogTime;
  private logInterval;
  private taskBreakdown;
  /**
   * Create a new progress monitor
   */
  constructor();
  /**
   * Reset progress monitor state
   */
  reset(): void;
  /**
   * Start tracking progress
   * @param options Progress tracking options or total number of tasks
   */
  startTracking(
    options:
      | {
          total: number;
          phase?: string;
          description?: string;
        }
      | number
  ): void;
  /**
   * Update progress state
   * @param options Progress update options or number of completed tasks
   */
  updateProgress(
    options:
      | {
          completed: number;
          total?: number;
          current?: string;
        }
      | number
  ): void;
  /**
   * Set current processing phase
   * @param phase Phase name
   */
  setPhase(phase: string): void;
  /**
   * Record timing for a specific phase
   * @param phase Phase name
   * @param duration Duration in milliseconds
   */
  recordTiming(phase: string, duration: number): void;
  /**
   * Record file statistics
   * @param stats File statistics to record
   */
  recordFileStats(stats: Partial<FileStatistics>): void;
  /**
   * Record current memory usage
   */
  recordMemoryUsage(): void;
  /**
   * Record cache statistics
   * @param stats Cache statistics to record
   */
  recordCacheStats(stats: Partial<CacheStats>): void;
  /**
   * Generate comprehensive performance report
   * @returns Performance report
   */
  generateReport(): PerformanceReport;
  /**
   * Get current progress state
   * @returns Progress state
   */
  getProgress(): ProgressState;
  /**
   * Register progress callback
   * @param callback Progress callback function
   */
  onProgress(callback: ProgressCallback): void;
  /**
   * Log progress to console if verbose mode is enabled
   * @param verbose Whether verbose mode is enabled
   */
  logProgress(forceLog?: boolean): void;
  /**
   * Notify all registered callbacks with current progress
   */
  private notifyCallbacks;
}
/**
 * Create a progress monitor instance
 * @returns Progress monitor instance
 */
export declare function createProgressMonitor(): ProgressMonitor;
//# sourceMappingURL=ProgressMonitor.d.ts.map
