/**
 * @fileoverview Batch Mode Font Generation Processor
 * @description Processor for handling font generation from multiple directories in batch mode
 *
 * @module processors/BatchModeProcessor
 * @author Wayne <michealwayne@163.com>
 * @since 2.0.0
 * @version 2.1.1
 */

import { ConfigurationManager, createConfiguration } from '../config';
import { DirectoryReport } from '../types/BuildReport';
import { BuildError, canonicalPath, emptyDirectory, issue, progress } from '../core/buildSupport';
import { PerformanceTracker } from '../core';
import * as path from 'path';
import { SingleDirectoryProcessor } from './SingleDirectoryProcessor';

/**
 * Batch mode font generation processor
 *
 * @class BatchModeProcessor
 * @description Processor that handles font generation for multiple directories
 *
 * @since 2.0.0
 */
export class BatchModeProcessor {
  private readonly pathSeparatorPattern = new RegExp(`[\\\\${path.posix.sep}]`, 'g');

  /**
   * Create a new batch mode processor instance
   *
   * @constructor
   * @param {ConfigurationManager} configManager - Validated configuration manager instance
   * @param {PerformanceTracker} [performanceTracker] - Optional performance tracking instance
   *
   * @since 2.0.0
   */
  constructor(
    private configManager: ConfigurationManager,
    private performanceTracker?: PerformanceTracker
  ) {}

  /**
   * Execute batch font generation process
   *
   * @async
   * @method process
   * @description Processes multiple directories of SVG files in batch mode
   *
   * @returns {Promise<true | Error>} Promise resolving to true on success, Error on failure
   *
   * @since 2.0.0
   */
  async process(): Promise<true | Error> {
    try {
      const results = await this.processDetailed();
      const successful = results.filter(result => result.status === 'success');
      const failed = results.filter(result => result.status === 'failed');
      if (
        failed.length &&
        (!this.configManager.getOptions().continueOnError || !successful.length)
      ) {
        return new Error(
          failed.flatMap(result => result.errors.map(error => error.message)).join('; ')
        );
      }
      if (failed.length)
        console.warn(
          `[svgs2fonts] Partial build: ${successful.length} succeeded, ${failed.length} failed`
        );
      return true;
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    }
  }

  async processDetailed(checkOnly = false): Promise<DirectoryReport[]> {
    const options = this.configManager.getOptions();
    const inputs = options.inputDirectories!;
    const commonRoot = this.getCommonInputRoot(inputs);
    const targets = inputs.map(directory =>
      this.resolveOutputDirectory(directory, options.dist, commonRoot, options)
    );
    const canonicalTargets = targets.map(canonicalPath);
    for (let i = 0; i < targets.length; i++) {
      for (let j = 0; j < i; j++) {
        const a = canonicalTargets[i],
          b = canonicalTargets[j];
        if (a === b || a.startsWith(b + path.sep) || b.startsWith(a + path.sep)) {
          throw new BuildError(
            'OUTPUT_COLLISION',
            `Batch outputs overlap: ${a} and ${b}`,
            a,
            'check'
          );
        }
      }
    }
    const results: DirectoryReport[] = [];
    const batchSize = options.batchSize!;
    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = inputs.slice(i, i + batchSize);
      const completed = await Promise.all(
        batch.map(async (directory, offset) => {
          const dirOptions = {
            ...options,
            src: directory,
            dist: targets[i + offset],
            batchMode: false,
            inputDirectories: undefined,
            progressCallback: undefined,
          };
          try {
            const config = createConfiguration(dirOptions);
            // Each child tracks phases independently; concurrent phase names must not overwrite one another.
            return await new SingleDirectoryProcessor(config).processDetailed(checkOnly);
          } catch (error) {
            const result = emptyDirectory(dirOptions);
            result.errors.push(issue(error, directory));
            return result;
          }
        })
      );
      results.push(...completed);
      progress(options, 'Batch Processing', results.length, inputs.length);
      if (!options.continueOnError && completed.some(result => result.status === 'failed')) {
        for (let index = results.length; index < inputs.length; index++) {
          results.push({
            ...emptyDirectory({ ...options, src: inputs[index], dist: targets[index] }),
            status: 'skipped',
            warnings: [
              {
                code: 'BATCH_SKIPPED',
                message: 'Skipped after an earlier batch failed',
                directory: inputs[index],
              },
            ],
          });
        }
        break;
      }
    }
    return results;
  }

  private resolveOutputDirectory(
    inputDirectory: string,
    baseOutputDirectory: string,
    commonRoot: string,
    options: {
      outputPattern?: string;
      preserveDirectoryStructure?: boolean;
      fontName?: string;
    }
  ): string {
    const directoryName = path.basename(inputDirectory);
    const preservedPath = options.preserveDirectoryStructure
      ? this.getPreservedDirectoryPath(inputDirectory, commonRoot)
      : '';

    if (options.outputPattern) {
      const renderedPattern = options.outputPattern
        .replace(/\[name\]/g, directoryName)
        .replace(/\[fontname\]/g, options.fontName || 'iconfont');

      const normalizedPattern = renderedPattern.split(this.pathSeparatorPattern).filter(Boolean);

      return path.join(baseOutputDirectory, preservedPath, ...normalizedPattern);
    }

    return path.join(baseOutputDirectory, preservedPath, directoryName);
  }

  private getCommonInputRoot(inputDirectories: string[]): string {
    if (inputDirectories.length === 1) {
      return path.dirname(inputDirectories[0]);
    }

    const normalizedParts = inputDirectories.map(directory =>
      path.resolve(directory).split(path.sep)
    );
    const sharedParts: string[] = [];
    const shortestLength = Math.min(...normalizedParts.map(parts => parts.length));

    for (let index = 0; index < shortestLength; index++) {
      const candidate = normalizedParts[0][index];
      if (normalizedParts.every(parts => parts[index] === candidate)) {
        sharedParts.push(candidate);
      } else {
        break;
      }
    }

    return sharedParts.length > 0
      ? sharedParts.join(path.sep) || path.sep
      : path.parse(inputDirectories[0]).root;
  }

  private getPreservedDirectoryPath(inputDirectory: string, commonRoot: string): string {
    const relativePath = path.relative(commonRoot, inputDirectory);
    return relativePath === '' ? path.basename(inputDirectory) : relativePath;
  }
}
