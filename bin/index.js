#!/usr/bin/env node

'use strict';

const minimist = require('minimist');
const { join, resolve, isAbsolute } = require('path');
const svgs2fonts = require('../dist/index');
const rawArgs = process.argv.slice(2);

const dirname = process.cwd();
const DEFAULT_FORMATS = ['svg', 'ttf', 'eot', 'woff', 'woff2'];
const SUPPORTED_FLAGS = new Set([
  'h',
  'help',
  'v',
  'version',
  'n',
  'name',
  'number',
  'nodemo',
  'c',
  'concurrency',
  'cache',
  'cache-dir',
  'stream',
  'b',
  'batch',
  'input',
  'batch-size',
  'output-pattern',
  'continue-on-error',
  'preserve-structure',
  'formats',
  'o',
  'optimize',
  'compression-level',
  'subset',
  'include-glyphs',
  'exclude-glyphs',
  'V',
  'verbose',
  'p',
  'performance',
  'no-progress',
  'report-compression',
]);

const Config = {
  version: require('../package.json').version,
};

function parseArgv() {
  const unknownFlags = [];
  const argv = minimist(process.argv.slice(2), {
    boolean: [
      'help',
      'h',
      'version',
      'v',
      'nodemo',
      'cache',
      'stream',
      'batch',
      'b',
      'continue-on-error',
      'preserve-structure',
      'optimize',
      'o',
      'subset',
      'verbose',
      'V',
      'performance',
      'p',
      'no-progress',
      'report-compression',
    ],
    string: [
      'name',
      'n',
      'number',
      'concurrency',
      'c',
      'cache-dir',
      'input',
      'batch-size',
      'output-pattern',
      'formats',
      'compression-level',
      'include-glyphs',
      'exclude-glyphs',
    ],
    alias: {
      h: 'help',
      v: 'version',
      n: 'name',
      c: 'concurrency',
      b: 'batch',
      o: 'optimize',
      V: 'verbose',
      p: 'performance',
    },
    unknown: arg => {
      if (arg.startsWith('-')) {
        const normalized = arg.replace(/^-+/, '').split('=')[0];
        if (!SUPPORTED_FLAGS.has(normalized)) {
          unknownFlags.push(arg);
          return false;
        }
      }
      return true;
    },
  });

  return { argv, unknownFlags };
}

function formatProgressBar(progress, total, width = 30) {
  if (total <= 0) {
    return '[░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0/0 (0%)';
  }

  const percentage = Math.round((progress / total) * 100);
  const filledWidth = Math.round((width * progress) / total);
  const emptyWidth = width - filledWidth;

  return `[${'█'.repeat(filledWidth)}${'░'.repeat(emptyWidth)}] ${progress}/${total} (${percentage}%)`;
}

function getHelpText() {
  return [
    'usage: svgs2fonts [src] [dist] [options]',
    '       svgs2fonts --batch --input=dirA,dirB [dist] [options]',
    '',
    'Supported options:',
    '  -h, --help            Show this help message',
    '  -v, --version         Output version',
    '  -n, --name            Font name (default: "iconfont")',
    '      --number          Unicode start code number (default: 10000)',
    '      --nodemo          Skip demo file generation',
    '      --formats         Output formats: svg,ttf,eot,woff,woff2',
    '  -b, --batch           Process multiple directories from --input',
    '      --input           Batch input directories, comma-separated',
    '      --batch-size      Number of directories processed per batch',
    '      --continue-on-error Continue after a batch item fails',
    '      --output-pattern  Batch output template, supports [name] and [fontname]',
    '      --preserve-structure Preserve relative input directory structure',
    '  -V, --verbose         Enable verbose logging',
    '  -p, --performance     Print performance analysis after completion',
    '      --no-progress     Disable progress rendering',
    '',
    'Experimental options:',
    '  -c, --concurrency     Accepted, but does not yet guarantee scheduling changes',
    '      --cache           Accepted, but cache pipeline is not implemented end-to-end',
    '      --cache-dir       Accepted with --cache, but cache storage is experimental',
    '      --stream          Accepted, but stream processing is not implemented end-to-end',
    '  -o, --optimize        Accepted, but optimization pipeline is not implemented end-to-end',
    '      --compression-level Parsed with --optimize, but compression tuning is experimental',
    '      --report-compression Parsed with --optimize, but compression reporting is experimental',
    '      --subset          Accepted, but glyph subsetting is not implemented end-to-end',
    '      --include-glyphs  Parsed with --subset, but glyph filtering is experimental',
    '      --exclude-glyphs  Parsed with --subset, but glyph filtering is experimental',
    '',
    'Examples:',
    '  svgs2fonts ./icons ./dist --name=myicons --formats=woff2,woff',
    '  svgs2fonts --batch --input=./icons1,./icons2 ./dist --continue-on-error',
    '  svgs2fonts ./icons ./dist --verbose --no-progress',
  ].join('\n');
}

function printHelp() {
  console.log(getHelpText());
}

function printCliError(message, example) {
  console.error(`Error: ${message}`);
  if (example) {
    console.error(`Example: ${example}`);
  }
  console.error('Run `svgs2fonts --help` for full usage.');
}

function parseInputDirectories(input) {
  const rawValues = Array.isArray(input) ? input : [input];
  return rawValues
    .flatMap(value => String(value).split(','))
    .map(value => value.trim())
    .filter(Boolean)
    .map(value => resolvePath(value));
}

function resolvePath(value) {
  return isAbsolute(value) ? value : resolve(dirname, value);
}

function buildInitOptions(argv) {
  const batchMode = Boolean(argv.batch || argv.b);
  const positionals = argv._ || [];

  if (!batchMode && positionals.length === 0) {
    return { error: 'Single-directory mode requires [src].', example: 'svgs2fonts ./icons ./dist' };
  }

  if (batchMode && !argv.input) {
    return {
      error: 'Batch mode requires --input=dirA,dirB.',
      example: 'svgs2fonts --batch --input=./icons1,./icons2 ./dist',
    };
  }

  const inputDirectories = batchMode ? parseInputDirectories(argv.input) : undefined;
  if (batchMode && inputDirectories.length === 0) {
    return {
      error: 'Batch mode requires at least one valid input directory in --input.',
      example: 'svgs2fonts --batch --input=./icons1,./icons2 ./dist',
    };
  }

  const src = batchMode ? undefined : resolvePath(positionals[0]);
  const dist = batchMode
    ? resolvePath(positionals[0] || 'dist')
    : resolvePath(positionals[1] || positionals[0]);

  const initOpts = {
    src,
    dist,
    fontName: argv.n || argv.name,
    unicodeStart: argv.number ? Number(argv.number) : undefined,
    noDemo: argv.nodemo,
    maxConcurrency: argv.concurrency || argv.c ? Number(argv.concurrency || argv.c) : undefined,
    enableCache: argv.cache !== undefined ? argv.cache : undefined,
    cacheDir: argv['cache-dir'],
    streamProcessing: argv.stream,
    batchMode,
    inputDirectories,
    batchSize: argv['batch-size'] ? Number(argv['batch-size']) : undefined,
    continueOnError: argv['continue-on-error'],
    preserveDirectoryStructure: argv['preserve-structure'],
    fontFormats: argv.formats
      ? argv.formats
          .split(',')
          .map(format => format.trim())
          .filter(Boolean)
      : undefined,
    verbose: argv.verbose || argv.V,
    performanceAnalysis: argv.performance || argv.p,
    outputPattern: batchMode && argv['output-pattern'] ? argv['output-pattern'] : undefined,
  };

  if (argv.optimize || argv.o) {
    initOpts.optimization = {
      compressWoff2: true,
      optimizeForWeb: true,
      woff2CompressionLevel: argv['compression-level']
        ? Number(argv['compression-level'])
        : 11,
      reportCompressionStats: Boolean(argv['report-compression']),
    };
  }

  if (argv.subset) {
    initOpts.subsetting = {
      includeGlyphs: argv['include-glyphs']
        ? argv['include-glyphs'].split(',').map(glyph => glyph.trim()).filter(Boolean)
        : undefined,
      excludeGlyphs: argv['exclude-glyphs']
        ? argv['exclude-glyphs'].split(',').map(glyph => glyph.trim()).filter(Boolean)
        : undefined,
    };
  }

  Object.keys(initOpts).forEach(key => {
    if (initOpts[key] === undefined) {
      delete initOpts[key];
    }
  });

  return { initOpts };
}

function attachProgressCallback(argv, initOpts) {
  if (argv['no-progress'] === true || argv.progress === false) {
    return;
  }

  let lastUpdate = 0;
  const updateInterval = 100;
  const interactive = Boolean(process.stdout.isTTY);

  initOpts.progressCallback = progress => {
    const now = Date.now();
    if (now - lastUpdate < updateInterval && progress.completed < progress.total) {
      return;
    }
    lastUpdate = now;

    const progressBar = formatProgressBar(progress.completed, progress.total);
    const message = progress.current ? ` ${progress.current}` : '';
    const line = `${progress.phase}: ${progressBar}${message}`;

    if (interactive && typeof process.stdout.clearLine === 'function') {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(line);
      if (progress.completed >= progress.total) {
        process.stdout.write('\n');
      }
      return;
    }

    process.stdout.write(`${line}\n`);
  };
}

function formatSuccessSummary(initOpts) {
  const formats = initOpts.fontFormats || DEFAULT_FORMATS;
  const demoStatus = initOpts.noDemo ? 'disabled' : 'enabled';

  return [
    '✓ Font generation completed successfully',
    `  Font: ${initOpts.fontName || 'iconfont'}`,
    `  Output: ${initOpts.dist}`,
    `  Formats: ${formats.join(', ')}`,
    `  Demo: ${demoStatus}`,
  ].join('\n');
}

const { argv, unknownFlags } = parseArgv();

if (unknownFlags.length > 0) {
  printCliError(`Unknown option(s): ${unknownFlags.join(', ')}`, 'svgs2fonts --help');
  process.exit(1);
}

if (argv.h || argv.help) {
  printHelp();
  process.exit(0);
}

if (argv.v || argv.version) {
  console.log(`v${Config.version}`);
  process.exit(0);
}

if (rawArgs.length === 0) {
  printHelp();
  process.exit(0);
}

const { initOpts, error, example } = buildInitOptions(argv);
if (error) {
  printCliError(error, example);
  process.exit(1);
}

attachProgressCallback(argv, initOpts);

svgs2fonts
  .init(initOpts)
  .then(result => {
    if (result === true) {
      console.log(formatSuccessSummary(initOpts));
      return;
    }

    printCliError(result.message, initOpts.batchMode
      ? 'svgs2fonts --batch --input=./icons1,./icons2 ./dist'
      : 'svgs2fonts ./icons ./dist');
    process.exit(1);
  })
  .catch(err => {
    printCliError(
      err.message,
      initOpts.batchMode
        ? 'svgs2fonts --batch --input=./icons1,./icons2 ./dist'
        : 'svgs2fonts ./icons ./dist'
    );
    process.exit(1);
  });
