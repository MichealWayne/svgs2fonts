/**
 * @module performance.test
 * @author Wayne<michealwayne@163.com>
 * @Date 2025-07-18 20:30:00
 * @description Performance tests for svgs2fonts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { init } from '../src/index';
import { EnhancedOptions } from '../src/types/OptionType';
import { createProgressMonitor } from '../src/lib/ProgressMonitor';

// Create a temporary directory for test output
const TEST_OUTPUT_DIR = path.join(os.tmpdir(), 'svgs2fonts-performance-test');
const TEST_SVG_DIR = path.join(__dirname, '../examples/svg');

// Performance test configurations
interface PerformanceTestConfig {
  name: string;
  options: EnhancedOptions;
  expectedImprovement?: number; // Percentage improvement over baseline
  memoryLimit?: number; // Maximum memory usage in bytes
  timeLimit?: number; // Maximum processing time in ms
}

// Skip performance tests in CI environment unless explicitly enabled
const SKIP_PERFORMANCE_TESTS =
  process.env.CI === 'true' && process.env.RUN_PERFORMANCE_TESTS !== 'true';

describe('Performance Tests', () => {
  // Setup and cleanup
  beforeAll(() => {
    // Create test output directory if it doesn't exist
    if (!fs.existsSync(TEST_OUTPUT_DIR)) {
      fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
    }

    // Create a copy of SVG files for large dataset tests
    const largeDatasetDir = path.join(TEST_OUTPUT_DIR, 'large-dataset');
    if (!fs.existsSync(largeDatasetDir)) {
      fs.mkdirSync(largeDatasetDir, { recursive: true });

      // Get all SVG files
      const svgFiles = fs.readdirSync(TEST_SVG_DIR).filter(file => file.endsWith('.svg'));

      // Create multiple copies to simulate a large dataset
      for (let i = 0; i < 10; i++) {
        for (const file of svgFiles) {
          const content = fs.readFileSync(path.join(TEST_SVG_DIR, file));
          fs.writeFileSync(path.join(largeDatasetDir, `copy${i}_${file}`), content);
        }
      }
    }
  });

  afterAll(() => {
    // Clean up test output directory
    if (fs.existsSync(TEST_OUTPUT_DIR)) {
      fs.rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
    }
  });

  // Define performance test configurations
  const performanceTests: PerformanceTestConfig[] = [
    {
      name: 'Baseline (Sequential Processing)',
      options: {
        src: TEST_SVG_DIR,
        dist: path.join(TEST_OUTPUT_DIR, 'baseline'),
        fontName: 'baseline-font',
        maxConcurrency: 1, // Force sequential processing
        enableCache: false,
        fontFormats: ['ttf', 'woff', 'woff2'],
        performanceAnalysis: true,
      },
    },
    {
      name: 'Parallel Processing',
      options: {
        src: TEST_SVG_DIR,
        dist: path.join(TEST_OUTPUT_DIR, 'parallel'),
        fontName: 'parallel-font',
        maxConcurrency: 4, // Use parallel processing
        enableCache: false,
        fontFormats: ['ttf', 'woff', 'woff2'],
        performanceAnalysis: true,
      },
      expectedImprovement: 30, // Expect at least 30% improvement over baseline
    },
    {
      name: 'Caching',
      options: {
        src: TEST_SVG_DIR,
        dist: path.join(TEST_OUTPUT_DIR, 'caching'),
        fontName: 'caching-font',
        maxConcurrency: 4,
        enableCache: true,
        cacheDir: path.join(TEST_OUTPUT_DIR, 'cache'),
        fontFormats: ['ttf', 'woff', 'woff2'],
        performanceAnalysis: true,
      },
      expectedImprovement: 50, // Expect at least 50% improvement on second run
    },
    {
      name: 'Optimized Output',
      options: {
        src: TEST_SVG_DIR,
        dist: path.join(TEST_OUTPUT_DIR, 'optimized'),
        fontName: 'optimized-font',
        maxConcurrency: 4,
        enableCache: false,
        fontFormats: ['ttf', 'woff2'], // Only generate needed formats
        optimization: {
          compressWoff2: true,
          optimizeForWeb: true,
          removeUnusedGlyphs: true,
        },
        performanceAnalysis: true,
      },
    },
    {
      name: 'Large Dataset',
      options: {
        src: path.join(TEST_OUTPUT_DIR, 'large-dataset'),
        dist: path.join(TEST_OUTPUT_DIR, 'large-output'),
        fontName: 'large-font',
        maxConcurrency: 4,
        enableCache: true,
        cacheDir: path.join(TEST_OUTPUT_DIR, 'large-cache'),
        fontFormats: ['ttf', 'woff2'],
        streamProcessing: true, // Enable streaming for large datasets
        performanceAnalysis: true,
      },
      memoryLimit: 512 * 1024 * 1024, // 512MB
      timeLimit: 60000, // 60 seconds
    },
  ];

  // Run performance tests
  for (const testConfig of performanceTests) {
    // Skip large dataset tests in CI unless explicitly enabled
    if (SKIP_PERFORMANCE_TESTS && testConfig.name === 'Large Dataset') {
      test.skip(`Performance: ${testConfig.name}`, () => {});
      continue;
    }

    it(`Performance: ${testConfig.name}`, async () => {
      // Create progress monitor to track performance
      const progressMonitor = createProgressMonitor();

      // Add progress callback to options
      const options: EnhancedOptions = {
        ...testConfig.options,
        progressCallback: progress => {
          // Optional: log progress
          if (progress.phase && progress.completed && progress.total) {
            // console.log(`${progress.phase}: ${progress.completed}/${progress.total}`);
          }
        },
      };

      // Measure start time
      const startTime = Date.now();

      // Run the font generation
      const result = await init(options);

      // Measure end time
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Verify success
      expect(result).toBe(true);

      // Verify output files exist
      expect(fs.existsSync(path.join(options.dist, `${options.fontName}.ttf`))).toBe(true);

      // Check time limit if specified
      if (testConfig.timeLimit) {
        expect(executionTime).toBeLessThanOrEqual(testConfig.timeLimit);
      }

      // For caching test, run a second time to measure cached performance
      if (testConfig.name === 'Caching') {
        const cacheStartTime = Date.now();
        const cacheResult = await init(options);
        const cacheExecutionTime = Date.now() - cacheStartTime;

        expect(cacheResult).toBe(true);

        // Verify cache improved performance
        const improvement = ((executionTime - cacheExecutionTime) / executionTime) * 100;
        expect(improvement).toBeGreaterThanOrEqual(testConfig.expectedImprovement || 0);
      }

      // For parallel processing test, compare with baseline
      if (testConfig.name === 'Parallel Processing' && testConfig.expectedImprovement) {
        // Find baseline test result
        const baselineTest = performanceTests.find(
          test => test.name === 'Baseline (Sequential Processing)'
        );
        if (baselineTest) {
          // Run baseline test if not already run
          const baselineOptions = { ...baselineTest.options };
          const baselineStartTime = Date.now();
          await init(baselineOptions);
          const baselineExecutionTime = Date.now() - baselineStartTime;

          // Calculate improvement
          const improvement =
            ((baselineExecutionTime - executionTime) / baselineExecutionTime) * 100;
          expect(improvement).toBeGreaterThanOrEqual(testConfig.expectedImprovement);
        }
      }
    }, 120000); // Increase timeout for performance tests
  }

  // Stress test with large dataset and memory monitoring
  it('Stress Test: Memory Usage', async () => {
    // Skip in CI unless explicitly enabled
    if (SKIP_PERFORMANCE_TESTS) {
      return;
    }

    // Options for stress test
    const options: EnhancedOptions = {
      src: path.join(TEST_OUTPUT_DIR, 'large-dataset'),
      dist: path.join(TEST_OUTPUT_DIR, 'stress-test'),
      fontName: 'stress-test-font',
      maxConcurrency: 8, // High concurrency to stress the system
      enableCache: false, // Disable cache to maximize memory usage
      fontFormats: ['ttf', 'woff', 'woff2', 'eot', 'svg'], // Generate all formats
      streamProcessing: false, // Disable streaming to test memory limits
      performanceAnalysis: true,
    };

    // Track memory usage
    let maxMemoryUsage = 0;
    const memoryInterval = setInterval(() => {
      const memUsage = process.memoryUsage();
      maxMemoryUsage = Math.max(maxMemoryUsage, memUsage.heapUsed);
    }, 100);

    try {
      // Run the font generation
      const result = await init(options);

      // Verify success
      expect(result).toBe(true);

      // Verify output files exist
      expect(fs.existsSync(path.join(options.dist, `${options.fontName}.ttf`))).toBe(true);

      // Log max memory usage
      console.log(`Max memory usage: ${(maxMemoryUsage / 1024 / 1024).toFixed(2)} MB`);

      // Memory should be below reasonable limit (adjust based on your system)
      const memoryLimit = 1024 * 1024 * 1024; // 1GB
      expect(maxMemoryUsage).toBeLessThan(memoryLimit);
    } finally {
      clearInterval(memoryInterval);
    }
  }, 180000); // 3 minutes timeout for stress test
});
