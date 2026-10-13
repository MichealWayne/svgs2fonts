#!/usr/bin/env node

'use strict';

const minimist = require('minimist');
const { join, resolve, isAbsolute } = require('path');
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
  'debug',
  'json',
  'check',
  'css',
  'manifest',
  'codepoint-map',
  'migrate',
  'migration-src',
  'migration-output',
  'migration-format',
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
      'debug',
      'json',
      'check',
      'css',
      'manifest',
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
      'codepoint-map',
      'migrate',
      'migration-src',
      'migration-output',
      'migration-format',
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
    default: { 'continue-on-error': true },
    unknown: arg => {
      if (arg.startsWith('-')) {
        const normalized = arg.replace(/^-+/, '').split('=')[0];
        const positiveFlag = normalized.startsWith('no-') ? normalized.slice(3) : normalized;
        if (
          !SUPPORTED_FLAGS.has(normalized) &&
          !(
            SUPPORTED_FLAGS.has(positiveFlag) &&
            ['continue-on-error', 'cache', 'verbose', 'preserve-structure'].includes(positiveFlag)
          )
        ) {
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
    '       svgs2fonts --migrate=deployed.svg [--migration-src=icons] [--migration-output=codepoints.json] [--json]',
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
    '      --debug           Deprecated alias for --verbose',
    '      --css             Write production <name>.css, even with --nodemo',
    '      --manifest        Write <name>.json with icon codepoints',
    '      --codepoint-map   Persist codepoints in an output-relative .json filename',
    '      --check           Inspect inputs without writing files',
    '      --json            Print one machine-readable result to stdout',
    '      --no-continue-on-error Stop scheduling batches after a failure',
    '',
    'Encoding migration (read-only unless --migration-output is given):',
    '      --migrate          Read a deployed JSON mapping/manifest or SVG font',
    '      --migration-format auto (extension), json or svg; default auto',
    '      --migration-src   Compare names with a current flat SVG directory',
    '      --migration-output Write a new schema-1 map; never overwrite files',
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
  if (argv.json) {
    console.log(
      JSON.stringify({
        schemaVersion: 1,
        status: 'failed',
        success: false,
        mode: argv.migrate !== undefined ? 'migrate' : argv.check ? 'check' : 'generate',
        directories: [],
        ...(argv.migrate !== undefined ? { codepoints: {}, iconCount: 0 } : {}),
        outputs: [],
        errors: [{ code: 'INVALID_ARGUMENT', message }],
        warnings: [],
        durationMs: 0,
      })
    );
    return;
  }
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
  value = String(value);
  return isAbsolute(value) ? value : resolve(dirname, value);
}

function buildInitOptions(argv) {
  if (
    ['migration-src', 'migration-output', 'migration-format'].some(flag => argv[flag] !== undefined)
  )
    return { error: 'Migration options require --migrate.' };
  const batchMode = Boolean(argv.batch || argv.b);
  const positionals = argv._ || [];
  if (positionals.length > (batchMode ? 1 : 2)) return { error: 'Too many positional arguments.' };

  if (!batchMode && positionals.length === 0) {
    return { error: 'Single-directory mode requires [src].', example: 'svgs2fonts ./icons ./dist' };
  }

  if (batchMode && !argv.input) {
    return {
      error: 'Batch mode requires --input=dirA,dirB.',
      example: 'svgs2fonts --batch --input=./icons1,./icons2 ./dist',
    };
  }

  for (const flag of [
    'name',
    'number',
    'concurrency',
    'batch-size',
    'output-pattern',
    'formats',
    'compression-level',
    'include-glyphs',
    'exclude-glyphs',
    'codepoint-map',
    'cache-dir',
  ]) {
    if (argv[flag] !== undefined && (typeof argv[flag] !== 'string' || !argv[flag].trim())) {
      return { error: `--${flag} requires one non-empty value.` };
    }
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
    verbose: argv.verbose || argv.V || argv.debug,
    debug: argv.debug,
    outputCss: argv.css,
    outputManifest: argv.manifest,
    codepointMap: argv['codepoint-map'],
    performanceAnalysis: argv.performance || argv.p,
    outputPattern: batchMode && argv['output-pattern'] ? argv['output-pattern'] : undefined,
  };

  if (argv.optimize || argv.o) {
    initOpts.optimization = {
      compressWoff2: true,
      optimizeForWeb: true,
      woff2CompressionLevel: argv['compression-level'] ? Number(argv['compression-level']) : 11,
      reportCompressionStats: Boolean(argv['report-compression']),
    };
  }

  if (argv.subset) {
    initOpts.subsetting = {
      includeGlyphs: argv['include-glyphs']
        ? argv['include-glyphs']
            .split(',')
            .map(glyph => glyph.trim())
            .filter(Boolean)
        : undefined,
      excludeGlyphs: argv['exclude-glyphs']
        ? argv['exclude-glyphs']
            .split(',')
            .map(glyph => glyph.trim())
            .filter(Boolean)
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
  if (argv.json || argv.check || argv['no-progress'] === true || argv.progress === false) {
    return;
  }

  let lastUpdate = 0;
  const updateInterval = 100;
  const interactive = Boolean(process.stderr.isTTY);

  initOpts.progressCallback = progress => {
    const now = Date.now();
    if (now - lastUpdate < updateInterval && progress.completed < progress.total) {
      return;
    }
    lastUpdate = now;

    const progressBar = formatProgressBar(progress.completed, progress.total);
    const message = progress.current ? ` ${progress.current}` : '';
    const line = `${progress.phase}: ${progressBar}${message}`;

    if (interactive && typeof process.stderr.clearLine === 'function') {
      process.stderr.clearLine(0);
      process.stderr.cursorTo(0);
      process.stderr.write(line);
      if (progress.completed >= progress.total) {
        process.stderr.write('\n');
      }
      return;
    }

    process.stderr.write(`${line}\n`);
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

async function main() {
  if (argv.migrate !== undefined) {
    const allowed = new Set([
      'migrate',
      'migration-src',
      'migration-output',
      'migration-format',
      'json',
    ]);
    for (const flag of allowed) {
      if (
        flag !== 'json' &&
        argv[flag] !== undefined &&
        (typeof argv[flag] !== 'string' || !argv[flag].trim())
      ) {
        printCliError(`--${flag} requires one non-empty value.`);
        process.exitCode = 1;
        return;
      }
    }
    if (
      argv._.length ||
      rawArgs.some(arg => arg.startsWith('-') && !allowed.has(arg.replace(/^-+/, '').split('=')[0]))
    ) {
      printCliError(
        'Migration accepts only --migrate, --migration-src, --migration-output, --migration-format and --json.'
      );
      process.exitCode = 1;
      return;
    }
    const report = await require('../dist/index').migrateCodepoints({
      from: resolvePath(argv.migrate),
      src: argv['migration-src'] === undefined ? undefined : resolvePath(argv['migration-src']),
      output:
        argv['migration-output'] === undefined ? undefined : resolvePath(argv['migration-output']),
      format: argv['migration-format'],
    });
    if (argv.json) console.log(JSON.stringify(report));
    else {
      report.warnings.forEach(warning =>
        console.warn(`Warning [${warning.code}]: ${warning.message}`)
      );
      if (report.success) {
        console.log(`✓ Imported ${report.iconCount} deployed codepoints from ${report.from}`);
        Object.entries(report.codepoints).forEach(([name, code]) =>
          console.log(`  ${name}: U+${code.toString(16).toUpperCase().padStart(4, '0')}`)
        );
        if (report.comparison)
          console.log(
            `  Matched: ${report.comparison.matched.join(', ') || '(none)'}\n  Missing sources: ${report.comparison.missing.join(', ') || '(none)'}\n  Unmapped sources: ${report.comparison.unmapped.join(', ') || '(none)'}`
          );
        console.log(
          report.outputs.length
            ? `  Map: ${report.outputs[0]}`
            : '  Preview only; no files written.'
        );
      } else
        report.errors.forEach(error => console.error(`Error [${error.code}]: ${error.message}`));
    }
    process.exitCode = report.success ? 0 : 1;
    return;
  }
  const { initOpts, error, example } = buildInitOptions(argv);
  if (error) {
    printCliError(error, example);
    process.exit(1);
  }

  attachProgressCallback(argv, initOpts);

  const svgs2fonts = require('../dist/index');
  svgs2fonts
    .generate(initOpts, { checkOnly: Boolean(argv.check) })
    .then(report => {
      if (argv.json) {
        console.log(JSON.stringify(report));
      } else {
        report.warnings.forEach(warning =>
          console.warn(
            `Warning [${warning.code}]: ${warning.message}${warning.file ? ` (${warning.file})` : ''}`
          )
        );
        if (report.success) {
          console.log(
            argv.check
              ? '✓ Input checks passed (font conversion and visual fidelity are not verified)'
              : formatSuccessSummary(initOpts)
          );
        } else {
          console.error(
            `Build ${report.status}: ${report.directories.filter(item => item.status === 'success').length} directories succeeded`
          );
          report.errors.forEach(error =>
            console.error(
              `Error [${error.code}]: ${error.message}${error.file ? ` (${error.file})` : ''}`
            )
          );
        }
        if (report.outputs.length)
          console.log(`  Files:\n${report.outputs.map(file => `    ${file}`).join('\n')}`);
        if (initOpts.performanceAnalysis) {
          console.error(`Total time: ${report.durationMs}ms`);
          report.directories.forEach(item =>
            Object.entries(item.timings || {}).forEach(([phase, ms]) =>
              console.error(`${item.source} / ${phase}: ${ms}ms`)
            )
          );
        }
      }
      process.exitCode = report.success ? 0 : 1;
    })
    .catch(error => {
      printCliError(error.message);
      process.exitCode = 1;
    });
}

main().catch(error => {
  printCliError(error.message);
  process.exitCode = 1;
});
