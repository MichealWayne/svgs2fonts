const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const project = path.resolve(__dirname, '..');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-consumer-'));
// Running through npm's JS entry also works on Windows, where npm is a .cmd shim.
function npm(args, options = {}) {
  if (process.env.npm_execpath)
    return execFileSync(process.execPath, [process.env.npm_execpath, ...args], options);
  return execFileSync('npm', args, options);
}
const cache =
  process.env.SVGS2FONTS_TEST_CACHE || npm(['config', 'get', 'cache'], { encoding: 'utf8' }).trim();

try {
  const packed = JSON.parse(
    npm(['pack', '--json', '--pack-destination', root, '--cache', cache], {
      cwd: project,
      encoding: 'utf8',
    })
  )[0];
  const files = packed.files.map(file => file.path);
  for (const file of [
    'dist/index.js',
    'dist/index.d.ts',
    'dist/types/OptionType.d.ts',
    'bin/index.js',
    'docs/automation.md',
  ])
    assert(files.includes(file), `Missing ${file}`);
  assert(
    !files.some(
      file =>
        file.startsWith('__tests__/') ||
        file.startsWith('browser-tests/') ||
        file === 'jest.setup.js'
    )
  );
  const archive = path.join(root, packed.filename);
  const dependency = `file:${archive}`;
  const consumer = {
    name: 'svgs2fonts-consumer-test',
    version: '1.0.0',
    private: true,
    dependencies: { svgs2fonts: dependency },
  };
  const lock = JSON.parse(fs.readFileSync(path.join(project, 'package-lock.json'), 'utf8'));
  const published = require('../package.json');
  lock.name = consumer.name;
  lock.version = consumer.version;
  lock.packages[''] = {
    name: consumer.name,
    version: consumer.version,
    dependencies: consumer.dependencies,
  };
  lock.packages['node_modules/svgs2fonts'] = {
    version: published.version,
    resolved: dependency,
    integrity: packed.integrity,
    dependencies: published.dependencies,
    bin: published.bin,
    engines: published.engines,
  };
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(consumer));
  fs.writeFileSync(path.join(root, 'package-lock.json'), JSON.stringify(lock));
  // Reuse the exact dependency resolutions, not source files or workspace node_modules.
  npm(
    [
      'ci',
      '--offline',
      '--ignore-scripts',
      '--omit=dev',
      '--no-audit',
      '--no-fund',
      '--cache',
      cache,
    ],
    { cwd: root, stdio: 'pipe' }
  );
  const entry = path.join(root, 'node_modules/svgs2fonts');
  assert.strictEqual(require(path.join(entry, 'package.json')).license, 'MIT');
  assert(fs.readFileSync(path.join(entry, 'LICENSE'), 'utf8').startsWith('The MIT License'));
  execFileSync(process.execPath, [path.join(project, 'scripts/runtime-smoke.js'), entry], {
    cwd: root,
    stdio: 'inherit',
  });
  const cli = path.join(root, 'node_modules/.bin/svgs2fonts');
  assert(
    fs.existsSync(process.platform === 'win32' ? `${cli}.cmd` : cli),
    'Missing installed CLI shim'
  );
  assert.strictEqual(
    execFileSync(process.execPath, [path.join(entry, 'bin/index.js'), '--version'], {
      encoding: 'utf8',
    }).trim(),
    `v${require('../package.json').version}`
  );
  const fixture = path.join(root, 'consumer.ts');
  fs.writeFileSync(
    fixture,
    `import fonts, { generate, check, init, migrateCodepoints, EnhancedOptions, BuildReport, MigrationOptions, MigrationReport } from 'svgs2fonts';\nconst options: EnhancedOptions = { src: './icons', fontFormats: ['woff2'], outputCss: true, codepointMap: 'codepoints.json' };\nconst result: Promise<BuildReport> = generate(options);\nconst migration: MigrationOptions = { from: './deployed.svg', output: './codepoints.json' };\nconst imported: Promise<MigrationReport> = migrateCodepoints(migration);\nvoid check(options); void init(options); void fonts.generate(options); void fonts.migrateCodepoints(migration); void result; void imported;\n`
  );
  execFileSync(
    process.execPath,
    [
      path.join(project, 'node_modules/typescript/bin/tsc'),
      '--noEmit',
      '--strict',
      '--skipLibCheck',
      'false',
      '--target',
      'es2020',
      '--module',
      'commonjs',
      '--esModuleInterop',
      fixture,
    ],
    { cwd: root, stdio: 'pipe' }
  );
  console.log(
    `Installed package verification passed: ${packed.entryCount} files, CommonJS, CLI and strict TypeScript consumer.`
  );
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
