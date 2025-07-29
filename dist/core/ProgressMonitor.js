'use strict';
/**
 * @module ProgressMonitor
 * @author Wayne<michealwayne@163.com>
 * @Date 2025-07-17 17:30:00
 * @LastEditTime 2025-07-29 13:29:11
 */
Object.defineProperty(exports, '__esModule', { value: true });
exports.createProgressMonitor = exports.DefaultProgressMonitor = void 0;
const utils_1 = require('../utils/utils');
/**
 * Default progress monitor implementation
 */
class DefaultProgressMonitor {
  /**
   * Create a new progress monitor
   */
  constructor() {
    this.phaseTimings = {};
    this.progressCallbacks = [];
    this.phaseStartTimes = new Map();
    this.lastLogTime = 0;
    this.logInterval = 1000; // Log progress every 1 second in verbose mode
    this.taskBreakdown = {
      svgProcessing: 0,
      fontGeneration: 0,
      demoGeneration: 0,
    };
    this.reset();
  }
  /**
   * Reset progress monitor state
   */
  reset() {
    this.progressState = {
      completed: 0,
      total: 0,
      phase: 'initializing',
      startTime: Date.now(),
      lastUpdateTime: Date.now(),
      percentComplete: 0,
    };
    this.phaseTimings = {};
    this.fileStats = {
      totalFiles: 0,
      processedFiles: 0,
      failedFiles: 0,
      skippedFiles: 0,
      totalInputSize: 0,
      totalOutputSize: 0,
    };
    this.memoryStats = {
      peakMemoryUsage: 0,
      currentMemoryUsage: 0,
      memoryEfficiency: 0,
    };
    this.cacheStats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      savedTime: 0,
    };
    this.taskBreakdown = {
      svgProcessing: 0,
      fontGeneration: 0,
      demoGeneration: 0,
    };
    this.phaseStartTimes.clear();
    this.lastLogTime = 0;
  }
  /**
   * Start tracking progress
   * @param options Progress tracking options or total number of tasks
   */
  startTracking(options) {
    const totalTasks = typeof options === 'number' ? options : options.total;
    const phase = typeof options === 'number' ? 'processing' : options.phase || 'processing';
    this.progressState.total = totalTasks;
    this.progressState.completed = 0;
    this.progressState.phase = phase;
    this.progressState.startTime = Date.now();
    this.progressState.lastUpdateTime = Date.now();
    this.progressState.percentComplete = 0;
    if (typeof options !== 'number' && options.description) {
      this.progressState.current = options.description;
    }
    this.fileStats.totalFiles = totalTasks;
    this.phaseStartTimes.set(phase, Date.now());
    this.recordMemoryUsage();
    this.notifyCallbacks();
    // Log initial progress
    this.logProgress(true);
  }
  /**
   * Update progress state
   * @param options Progress update options or number of completed tasks
   */
  updateProgress(options) {
    const completed = typeof options === 'number' ? options : options.completed;
    const current = typeof options === 'number' ? undefined : options.current;
    if (typeof options !== 'number' && options.total) {
      this.progressState.total = options.total;
    }
    this.progressState.completed = Math.max(0, Math.min(completed, this.progressState.total));
    this.progressState.current = current;
    this.progressState.lastUpdateTime = Date.now();
    // Calculate percent complete
    if (this.progressState.total > 0) {
      this.progressState.percentComplete =
        (this.progressState.completed / this.progressState.total) * 100;
    }
    // Calculate estimated time remaining
    if (this.progressState.completed > 0 && this.progressState.total > 0) {
      const elapsedTime = Date.now() - this.progressState.startTime;
      const timePerTask = elapsedTime / this.progressState.completed;
      const tasksRemaining = this.progressState.total - this.progressState.completed;
      this.progressState.estimatedTimeRemaining = timePerTask * tasksRemaining;
    }
    this.recordMemoryUsage();
    this.notifyCallbacks();
    // Log progress periodically
    this.logProgress();
  }
  /**
   * Set current processing phase
   * @param phase Phase name
   */
  setPhase(phase) {
    // End timing for previous phase
    if (this.progressState.phase && this.phaseStartTimes.has(this.progressState.phase)) {
      const startTime = this.phaseStartTimes.get(this.progressState.phase);
      if (startTime !== undefined) {
        const duration = Date.now() - startTime;
        this.recordTiming(this.progressState.phase, duration);
      }
    }
    // Start timing for new phase
    this.progressState.phase = phase;
    this.phaseStartTimes.set(phase, Date.now());
    this.progressState.lastUpdateTime = Date.now();
    // Log phase change
    (0, utils_1.log)(`[ProgressMonitor] Phase changed to: ${phase}`);
    this.notifyCallbacks();
  }
  /**
   * Record timing for a specific phase
   * @param phase Phase name
   * @param duration Duration in milliseconds
   */
  recordTiming(phase, duration) {
    const endTime = Date.now();
    const startTime = endTime - duration;
    this.phaseTimings[phase] = {
      duration,
      startTime,
      endTime,
    };
    // Update task breakdown based on phase
    if (phase.includes('svg')) {
      this.taskBreakdown.svgProcessing += duration;
    } else if (phase.includes('font')) {
      this.taskBreakdown.fontGeneration += duration;
    } else if (phase.includes('demo')) {
      this.taskBreakdown.demoGeneration += duration;
    }
  }
  /**
   * Record file statistics
   * @param stats File statistics to record
   */
  recordFileStats(stats) {
    Object.assign(this.fileStats, stats);
  }
  /**
   * Record current memory usage
   */
  recordMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      this.memoryStats.currentMemoryUsage = memUsage.heapUsed;
      this.memoryStats.peakMemoryUsage = Math.max(
        this.memoryStats.peakMemoryUsage,
        memUsage.heapUsed
      );
      // Calculate memory efficiency (processed files per MB)
      if (this.memoryStats.currentMemoryUsage > 0) {
        this.memoryStats.memoryEfficiency =
          this.fileStats.processedFiles / (this.memoryStats.currentMemoryUsage / 1024 / 1024);
      }
    }
  }
  /**
   * Record cache statistics
   * @param stats Cache statistics to record
   */
  recordCacheStats(stats) {
    Object.assign(this.cacheStats, stats);
    // Calculate hit rate
    const total = this.cacheStats.hits + this.cacheStats.misses;
    if (total > 0) {
      this.cacheStats.hitRate = (this.cacheStats.hits / total) * 100;
    }
  }
  /**
   * Generate comprehensive performance report
   * @returns Performance report
   */
  generateReport() {
    const totalTime = Date.now() - this.progressState.startTime;
    const totalTimeSeconds = totalTime / 1000;
    // Calculate throughput
    const filesPerSecond =
      totalTimeSeconds > 0 ? this.fileStats.processedFiles / totalTimeSeconds : 0;
    const bytesPerSecond =
      totalTimeSeconds > 0 ? this.fileStats.totalOutputSize / totalTimeSeconds : 0;
    // End any ongoing phase timings
    if (this.progressState.phase && this.phaseStartTimes.has(this.progressState.phase)) {
      const startTime = this.phaseStartTimes.get(this.progressState.phase);
      if (startTime !== undefined) {
        const duration = Date.now() - startTime;
        this.recordTiming(this.progressState.phase, duration);
      }
    }
    return {
      totalTime,
      phaseBreakdown: { ...this.phaseTimings },
      fileStats: { ...this.fileStats },
      memoryUsage: { ...this.memoryStats },
      throughput: {
        filesPerSecond,
        bytesPerSecond,
      },
      cacheStats: { ...this.cacheStats },
      taskBreakdown: { ...this.taskBreakdown },
    };
  }
  /**
   * Get current progress state
   * @returns Progress state
   */
  getProgress() {
    return { ...this.progressState };
  }
  /**
   * Register progress callback
   * @param callback Progress callback function
   */
  onProgress(callback) {
    this.progressCallbacks.push(callback);
  }
  /**
   * Log progress to console if verbose mode is enabled
   * @param verbose Whether verbose mode is enabled
   */
  logProgress(forceLog = false) {
    const now = Date.now();
    // Only log if forced or if enough time has passed since last log
    if (forceLog || now - this.lastLogTime > this.logInterval) {
      this.lastLogTime = now;
      const progress = this.getProgress();
      const percent = progress.percentComplete.toFixed(1);
      const elapsed = ((now - progress.startTime) / 1000).toFixed(1);
      let message = `[ProgressMonitor] ${progress.phase}: ${progress.completed}/${progress.total} (${percent}%) - ${elapsed}s elapsed`;
      if (progress.estimatedTimeRemaining !== undefined) {
        const remaining = (progress.estimatedTimeRemaining / 1000).toFixed(1);
        message += `, ~${remaining}s remaining`;
      }
      if (progress.current) {
        message += ` - Current: ${progress.current}`;
      }
      (0, utils_1.log)(message);
    }
  }
  /**
   * Notify all registered callbacks with current progress
   */
  notifyCallbacks() {
    const progress = {
      completed: this.progressState.completed,
      total: this.progressState.total,
      current: this.progressState.current,
      phase: this.progressState.phase,
    };
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        // Silently ignore callback errors to prevent disrupting the main process
        (0, utils_1.warnLog)(`[ProgressMonitor] Progress callback error: ${error}`);
      }
    });
  }
}
exports.DefaultProgressMonitor = DefaultProgressMonitor;
/**
 * Create a progress monitor instance
 * @returns Progress monitor instance
 */
function createProgressMonitor() {
  return new DefaultProgressMonitor();
}
exports.createProgressMonitor = createProgressMonitor;
//# sourceMappingURL=ProgressMonitor.js.map
