#!/usr/bin/env node

'use strict';
const argv = require('minimist')(process.argv.slice(2));
const { join } = require('path');
const svgs2fonts = require('../dist/index');
const dirname = process.cwd();
const fs = require('fs');

const Config = {
  version: require('../package.json').version,
  time: '2018.07.30',
  updateTime: '2025.07.18',
};

// Helper function to format progress bar
function formatProgressBar(progress, total, width = 30) {
  const percentage = Math.round((progress / total) * 100);
  const filledWidth = Math.round((width * progress) / total);
  const emptyWidth = width - filledWidth;

  const filledBar = '█'.repeat(filledWidth);
  const emptyBar = '░'.repeat(emptyWidth);

  return `[${filledBar}${emptyBar}] ${progress}/${total} (${percentage}%)`;
}

// Helper function to format time
function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// version
if (argv.v || argv.version) {
  console.log(`v${Config.version}`);
} else if (argv._ && argv._.length) {
  // typical init
  const initOpts = {
    src: join(dirname, argv._[0]),
    dist: join(dirname, argv._[1] || argv._[0]),

    // Basic options
    fontName: argv.n || argv.name,
    unicodeStart: argv.number,
    noDemo: argv.nodemo,

    // Performance options
    maxConcurrency: argv.concurrency || argv.c,
    enableCache: argv.cache !== false,
    cacheDir: argv['cache-dir'],
    streamProcessing: argv.stream,

    // Batch processing options
    batchMode: argv.batch || argv.b,
    batchSize: argv['batch-size'],
    continueOnError: argv['continue-on-error'],
    preserveDirectoryStructure: argv['preserve-structure'],

    // Font options
    fontFormats: argv.formats ? argv.formats.split(',') : undefined,

    // Monitoring options
    verbose: argv.verbose || argv.V,
    performanceAnalysis: argv.performance || argv.p,
  };

  // Handle input directories for batch mode
  if (initOpts.batchMode && argv.input) {
    initOpts.inputDirectories = Array.isArray(argv.input)
      ? argv.input.map(dir => join(dirname, dir))
      : [join(dirname, argv.input)];
  }

  // Handle output pattern for batch mode
  if (initOpts.batchMode && argv['output-pattern']) {
    initOpts.outputPattern = argv['output-pattern'];
  }

  // Handle optimization options
  if (argv.optimize || argv.o) {
    initOpts.optimization = {
      compressWoff2: true,
      optimizeForWeb: true,
      woff2CompressionLevel: argv['compression-level'] || 11,
      reportCompressionStats: argv['report-compression'] || false,
    };
  }

  // Handle subsetting options
  if (argv.subset) {
    initOpts.subsetting = {
      includeGlyphs: argv['include-glyphs'] ? argv['include-glyphs'].split(',') : undefined,
      excludeGlyphs: argv['exclude-glyphs'] ? argv['exclude-glyphs'].split(',') : undefined,
    };
  }

  // Clean up undefined values
  Object.keys(initOpts).forEach(key => {
    if (initOpts[key] === undefined) {
      delete initOpts[key];
    }
  });

  // Setup progress display for CLI
  if (!argv.no_progress) {
    let lastUpdate = 0;
    const updateInterval = 100; // Update progress bar at most every 100ms

    initOpts.progressCallback = progress => {
      const now = Date.now();
      if (now - lastUpdate < updateInterval && progress.completed < progress.total) {
        return; // Throttle updates
      }
      lastUpdate = now;

      // Clear the current line
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);

      // Format and display progress
      const progressBar = formatProgressBar(progress.completed, progress.total);
      const message = progress.current ? ` ${progress.current}` : '';
      process.stdout.write(`${progress.phase}: ${progressBar}${message}`);

      // Add a new line when complete
      if (progress.completed >= progress.total) {
        process.stdout.write('\n');
      }
    };
  }

  // Execute with enhanced options
  svgs2fonts
    .init(initOpts)
    .then(result => {
      if (result === true) {
        console.log('✓ Font generation completed successfully!');
      } else {
        console.error('✗ Font generation failed:', result.message);
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('✗ Font generation failed:', err.message);
      process.exit(1);
    });
} else {
  // help
  console.log(
    [
      'usage: svgs2fonts [src] [dist] [options]',
      '',
      'Basic options:',
      '  -n, --name            Font name (default: "iconfont")',
      '      --number          Unicode start code number',
      '      --nodemo          No demo files',
      '',
      'Performance options:',
      '  -c, --concurrency     Maximum concurrency for parallel processing',
      '      --cache           Enable caching (default: true)',
      '      --cache-dir       Custom cache directory',
      '      --stream          Enable streaming processing for large datasets',
      '',
      'Batch processing options:',
      '  -b, --batch           Enable batch mode for processing multiple directories',
      '      --input           Input directories for batch mode (comma-separated)',
      '      --batch-size      Number of directories to process in parallel',
      '      --output-pattern  Output pattern for batch mode (e.g. "[name]/[fontname]")',
      '      --continue-on-error Continue batch processing when errors occur',
      '      --preserve-structure Preserve directory structure in output',
      '',
      'Font options:',
      '      --formats         Font formats to generate (comma-separated: svg,ttf,eot,woff,woff2,variable)',
      '  -o, --optimize        Enable font optimization',
      '      --compression-level WOFF2 compression level (1-11)',
      '      --subset          Enable font subsetting',
      '      --include-glyphs  Glyphs to include (comma-separated)',
      '      --exclude-glyphs  Glyphs to exclude (comma-separated)',
      '',
      'Monitoring options:',
      '  -V, --verbose         Enable verbose output',
      '  -p, --performance     Enable performance analysis',
      '      --no-progress     Disable progress display',
      '      --report-compression Report compression statistics',
      '',
      'Other options:',
      '  -v, --version         Output version',
      '',
      'Examples:',
      '  svgs2fonts ./icons ./dist --name="myicons" --formats=ttf,woff,woff2',
      '  svgs2fonts ./icons ./dist --concurrency=4 --cache --verbose',
      '  svgs2fonts ./icons ./dist --optimize --compression-level=9',
      '  svgs2fonts ./icons --batch --input=./icons1,./icons2 --output-pattern="[name]/fonts"',
    ].join('\n')
  );
  process.exit();
}
