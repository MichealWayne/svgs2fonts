import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { generate, check, init } from '../src';
import { OutputTransaction } from '../src/core/OutputTransaction';
import { createUnicodeGenerator } from '../src/utils/utils';

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0 L24 0 L24 24 Z"/></svg>';
let root: string;
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-report-'));
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));
function input(name = 'icons', icon = 'home') {
  const src = path.join(root, name);
  fs.mkdirSync(src, { recursive: true });
  fs.writeFileSync(path.join(src, `${icon}.svg`), svg);
  return src;
}
function options(src: string) {
  return { src, dist: path.join(root, 'out'), fontFormats: ['woff2' as const], noDemo: true };
}

test('output directory aliases share a build lock', () => {
  const out = path.join(root, 'out');
  fs.mkdirSync(out);
  const alias = path.join(root, 'alias');
  fs.symlinkSync(out, alias, 'dir');
  const transaction = new OutputTransaction(out, 'icons');
  try {
    expect(() => new OutputTransaction(alias, 'icons')).toThrow('locked');
  } finally {
    transaction.cleanup();
  }
});

test('checks reject output symlinks without touching their targets', async () => {
  const opts = options(input());
  fs.mkdirSync(opts.dist);
  const target = path.join(root, 'existing.woff2');
  fs.writeFileSync(target, 'preserved');
  fs.symlinkSync(target, path.join(opts.dist, 'iconfont.woff2'));
  const result = await check(opts);
  expect(result.errors[0].code).toBe('OUTPUT_COLLISION');
  expect(fs.readFileSync(target, 'utf8')).toBe('preserved');
});

test('SVG-named source may be used when the build does not emit SVG', async () => {
  const src = input('icons', 'iconfont');
  const result = await generate({ ...options(src), dist: src });
  expect(result.success).toBe(true);
  expect(fs.readFileSync(path.join(src, 'iconfont.svg'), 'utf8')).toBe(svg);
});

test('unicode exhaustion returns an error rather than repeating codes', () => {
  const allocate = createUnicodeGenerator(59998);
  expect(new Set([allocate('a'), allocate('b')]).size).toBe(2);
  expect(() => allocate('c')).toThrow('exhausted');
});

test('null and array inputs return serializable configuration failures', async () => {
  for (const value of [null, undefined, []]) {
    const report = await generate(value as any);
    expect(report.success).toBe(false);
    expect(report.errors[0].code).toBe('INVALID_CONFIG');
    expect(JSON.parse(JSON.stringify(report)).errors[0].message).toContain('object');
  }
});

test('batch reports partial failures and legacy init preserves partial success', async () => {
  const good = input('good');
  const missing = path.join(root, 'missing');
  const opts = {
    batchMode: true,
    inputDirectories: [good, missing],
    dist: path.join(root, 'out'),
    batchSize: 1,
    noDemo: true,
    fontFormats: ['woff2' as const],
  };
  const report = await generate(opts);
  expect(report.status).toBe('partial');
  expect(report.success).toBe(false);
  expect(report.outputs).toHaveLength(1);
  expect(report.directories.map(d => d.status)).toEqual(['success', 'failed']);
  expect(report.errors[0].directory).toBe(missing);
  expect(await init(opts)).toBe(true);
});

test('all failed batches return failed reports and legacy errors', async () => {
  const opts = {
    batchMode: true,
    inputDirectories: [path.join(root, 'missing')],
    dist: path.join(root, 'out'),
  };
  expect((await generate(opts)).status).toBe('failed');
  expect(await init(opts)).toBeInstanceOf(Error);
  expect(fs.existsSync(opts.dist)).toBe(false);
});

test('stop-on-error skips subsequent batches without output writes', async () => {
  const good = input('good');
  const report = await generate({
    batchMode: true,
    inputDirectories: [path.join(root, 'missing'), good],
    dist: path.join(root, 'out'),
    continueOnError: false,
    batchSize: 1,
  });
  expect(report.directories.map(d => d.status)).toEqual(['failed', 'skipped']);
  expect(fs.existsSync(path.join(root, 'out'))).toBe(false);
});

test('same-name batch outputs fail before any conversion', async () => {
  const a = input('a/icons'),
    b = input('b/icons');
  const report = await generate({
    batchMode: true,
    inputDirectories: [a, b],
    dist: path.join(root, 'out'),
  });
  expect(report.errors[0].code).toBe('OUTPUT_COLLISION');
  expect(fs.existsSync(path.join(root, 'out'))).toBe(false);
});

test('read-only checks validate malformed documents and return warnings', async () => {
  const src = input();
  fs.writeFileSync(path.join(src, 'stroke.svg'), svg.replace('<path', '<path stroke="black"'));
  const opts = { ...options(src), codepointMap: 'codepoints.json', maxConcurrency: 3 };
  const report = await check(opts);
  expect(report.status).toBe('success');
  expect(report.warnings.map(w => w.code)).toContain('SVG_REVIEW_REQUIRED');
  expect(report.warnings.map(w => w.code)).toContain('EXPERIMENTAL_OPTION_IGNORED');
  expect(fs.readdirSync(root)).toEqual(['icons']);
  fs.writeFileSync(path.join(src, 'bad.svg'), '<not-svg/>');
  const bad = await check(opts);
  expect(bad.errors[0].code).toBe('INVALID_SVG');
  expect(bad.errors[0].file).toBe(path.join(src, 'bad.svg'));
});

test('stable maps retain old codes and reserve removed glyphs', async () => {
  const src = input('icons', 'z');
  const opts = {
    ...options(src),
    codepointMap: 'codepoints.json',
    unicodeStart: 57344,
    outputManifest: true,
  };
  const first = await generate(opts);
  expect(first.status).toBe('success');
  fs.writeFileSync(path.join(src, 'a.svg'), svg);
  const second = await generate(opts);
  expect(second.directories[0].codepoints.z).toBe(first.directories[0].codepoints.z);
  expect(second.directories[0].changes?.added).toEqual(['a']);
  fs.unlinkSync(path.join(src, 'z.svg'));
  const third = await generate(opts);
  expect(third.directories[0].changes?.removed).toEqual(['z']);
  const map = JSON.parse(fs.readFileSync(path.join(opts.dist, 'codepoints.json'), 'utf8'));
  expect(map.codepoints.z).toBe(57344);
  expect(map.codepoints.a).toBe(57345);
  const manifest = JSON.parse(fs.readFileSync(path.join(opts.dist, 'iconfont.json'), 'utf8'));
  expect(manifest.outputs.sort()).toEqual(third.outputs.map(file => path.basename(file)).sort());
});

test('same-name SVG edits are detected without changing their deployed codes', async () => {
  const src = input();
  const opts = { ...options(src), codepointMap: 'codepoints.json', outputManifest: true };
  const first = await generate(opts);
  expect(first.directories[0].changes?.contentCompared).toBe(false);
  const unchanged = await generate(opts);
  expect(unchanged.directories[0].changes).toMatchObject({ changed: [], contentCompared: true });
  fs.writeFileSync(path.join(src, 'home.svg'), svg.replace('L24 24', 'L12 24'));
  const checked = await check(opts);
  expect(checked.directories[0].changes?.changed).toEqual(['home']);
  const result = await generate(opts);
  expect(result.directories[0].changes?.changed).toEqual(['home']);
  expect(result.directories[0].codepoints).toEqual(first.directories[0].codepoints);
  const manifest = JSON.parse(fs.readFileSync(path.join(opts.dist, 'iconfont.json'), 'utf8'));
  expect(manifest.sourceHashes.home).toBe(result.directories[0].sourceHashes?.home);
  expect((await check(opts)).directories[0].changes?.changed).toEqual([]);
});

test('legacy maps establish a content baseline only on a successful generation', async () => {
  const src = input();
  const opts = { ...options(src), codepointMap: 'codepoints.json' };
  fs.mkdirSync(opts.dist);
  const mapPath = path.join(opts.dist, 'codepoints.json');
  const legacy = JSON.stringify({ schemaVersion: 1, codepoints: { home: 57344 } });
  fs.writeFileSync(mapPath, legacy);
  const checked = await check(opts);
  expect(checked.directories[0].changes).toMatchObject({
    added: [],
    changed: [],
    contentCompared: false,
  });
  expect(fs.readFileSync(mapPath, 'utf8')).toBe(legacy);
  expect((await generate(opts)).success).toBe(true);
  expect((await check(opts)).directories[0].changes?.contentCompared).toBe(true);
});

test('removed icons are reported once and re-added icons recover their reserved codes', async () => {
  const src = input();
  fs.writeFileSync(path.join(src, 'keep.svg'), svg);
  const opts = { ...options(src), codepointMap: 'codepoints.json' };
  const first = await generate(opts);
  fs.unlinkSync(path.join(src, 'home.svg'));
  expect((await generate(opts)).directories[0].changes?.removed).toEqual(['home']);
  expect((await check(opts)).directories[0].changes?.removed).toEqual([]);
  fs.writeFileSync(path.join(src, 'home.svg'), svg);
  const result = await generate(opts);
  expect(result.directories[0].changes?.added).toEqual(['home']);
  expect(result.directories[0].codepoints.home).toBe(first.directories[0].codepoints.home);
});

test('invalid stored content hashes fail without replacing the mapping', async () => {
  const opts = { ...options(input()), codepointMap: 'codepoints.json' };
  fs.mkdirSync(opts.dist);
  const mapPath = path.join(opts.dist, 'codepoints.json');
  const bad = JSON.stringify({
    schemaVersion: 1,
    codepoints: { home: 57344 },
    sourceHashes: { home: 'invalid' },
  });
  fs.writeFileSync(mapPath, bad);
  expect((await generate(opts)).errors[0].code).toBe('INVALID_CODEPOINT_MAP');
  expect(fs.readFileSync(mapPath, 'utf8')).toBe(bad);
});

test('failed conversion does not advance the content baseline', async () => {
  const src = input();
  const opts = { ...options(src), codepointMap: 'codepoints.json' };
  await generate(opts);
  const oldMap = fs.readFileSync(path.join(opts.dist, 'codepoints.json'), 'utf8');
  fs.writeFileSync(path.join(src, 'home.svg'), '<svg><path d="INVALID"/></svg>');
  const report = await generate(opts);
  expect(report.success).toBe(false);
  expect(fs.readFileSync(path.join(opts.dist, 'codepoints.json'), 'utf8')).toBe(oldMap);
});

test('input edits during generation preserve outputs and the old baseline', async () => {
  const src = input();
  const opts = { ...options(src), codepointMap: 'codepoints.json' };
  await generate(opts);
  const before = fs.readFileSync(path.join(opts.dist, 'iconfont.woff2'));
  const oldMap = fs.readFileSync(path.join(opts.dist, 'codepoints.json'), 'utf8');
  const result = await generate({
    ...opts,
    progressCallback: info => {
      if (info.phase === 'Font Generation')
        fs.writeFileSync(path.join(src, 'home.svg'), svg + '\n');
    },
  });
  expect(result.errors[0].code).toBe('INPUT_CHANGED');
  expect(fs.readFileSync(path.join(opts.dist, 'iconfont.woff2'))).toEqual(before);
  expect(fs.readFileSync(path.join(opts.dist, 'codepoints.json'), 'utf8')).toBe(oldMap);
});

test('explicit seed preserves existing legacy codes when migrating', async () => {
  const src = input();
  const legacy = await generate(options(src));
  const migrated = await generate({
    ...options(src),
    codepointMap: 'codepoints.json',
    codepoints: legacy.directories[0].codepoints,
  });
  expect(migrated.directories[0].codepoints).toEqual(legacy.directories[0].codepoints);
});

test('duplicate or corrupt maps fail without replacing old files', async () => {
  const src = input();
  const opts = { ...options(src), codepointMap: 'codepoints.json' };
  expect((await generate(opts)).success).toBe(true);
  const previous = fs.readFileSync(path.join(opts.dist, 'iconfont.woff2'));
  fs.writeFileSync(
    path.join(opts.dist, 'codepoints.json'),
    JSON.stringify({ schemaVersion: 1, codepoints: { home: 57344, another: 57344 } })
  );
  const failed = await generate(opts);
  expect(failed.errors[0].code).toBe('CODEPOINT_CONFLICT');
  expect(fs.readFileSync(path.join(opts.dist, 'iconfont.woff2'))).toEqual(previous);
  expect(fs.readdirSync(root).filter(name => name.startsWith('.svgs2fonts'))).toEqual([]);
});

test('commit failure restores overwritten files and leaves unrelated data alone', () => {
  const output = path.join(root, 'out');
  fs.mkdirSync(output);
  fs.writeFileSync(path.join(output, 'a.css'), 'old');
  fs.writeFileSync(path.join(output, 'notes.txt'), 'user data');
  fs.mkdirSync(path.join(output, 'blocked.css'));
  const tx = new OutputTransaction(output, 'icons');
  fs.writeFileSync(path.join(tx.stage, 'a.css'), 'new');
  fs.writeFileSync(path.join(tx.stage, 'blocked.css'), 'new');
  expect(() => tx.commit(['a.css', 'blocked.css'])).toThrow('rolled back');
  expect(fs.readFileSync(path.join(output, 'a.css'), 'utf8')).toBe('old');
  expect(fs.readFileSync(path.join(output, 'notes.txt'), 'utf8')).toBe('user data');
  tx.cleanup();
});

test('concurrent output writers are rejected without stealing the lock', () => {
  const tx = new OutputTransaction(path.join(root, 'out'), 'icons');
  expect(() => new OutputTransaction(path.join(root, 'out'), 'other-font')).toThrow('locked');
  tx.cleanup();
  const next = new OutputTransaction(path.join(root, 'out'), 'icons');
  next.cleanup();
});

test('repeated CLI-style in-place builds exclude generated fonts', async () => {
  const src = input();
  const opts = { src, dist: src, fontFormats: ['svg' as const], noDemo: true };
  const first = await generate(opts),
    second = await generate(opts);
  expect(first.success).toBe(true);
  expect(second.success).toBe(true);
  expect(second.directories[0].iconCount).toBe(1);
  expect(second.warnings[0].code).toBe('GENERATED_INPUT_SKIPPED');
  expect(second.directories[0].codepoints).toEqual(first.directories[0].codepoints);
});

test('special names produce escaped HTML and valid CSS without altering IDs', async () => {
  const src = input('icons', 'home.dark"&');
  const report = await generate({ ...options(src), noDemo: false, outputCss: true });
  expect(report.success).toBe(true);
  const html = fs.readFileSync(path.join(root, 'out/demo_fontclass.html'), 'utf8');
  expect(html).toContain('home.dark&quot;&amp;');
  const css = fs.readFileSync(path.join(root, 'out/iconfont.css'), 'utf8');
  expect(css).toContain('home\\2e dark\\22 \\26 ');
});

test('callback errors cannot turn successful committed outputs into failures', async () => {
  const report = await generate({
    ...options(input()),
    progressCallback: () => {
      throw new Error('observer');
    },
  });
  expect(report.success).toBe(true);
});

test('CLI JSON mode provides one parseable report and correct partial exit code', () => {
  const good = input('good');
  const result = spawnSync(
    process.execPath,
    [
      path.resolve(__dirname, '../bin/index.js'),
      '--batch',
      `--input=${good},${path.join(root, 'missing')}`,
      path.join(root, 'out'),
      '--formats=woff2',
      '--nodemo',
      '--json',
      '--verbose',
    ],
    { encoding: 'utf8' }
  );
  expect(result.status).toBe(1);
  expect(JSON.parse(result.stdout).status).toBe('partial');
  expect(result.stderr).toContain('Configuration');
});

test('CLI check and argument failures are machine readable', () => {
  const src = input();
  const args = [
    path.resolve(__dirname, '../bin/index.js'),
    src,
    path.join(root, 'out'),
    '--check',
    '--json',
  ];
  const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
  expect(result.status).toBe(0);
  expect(JSON.parse(result.stdout).mode).toBe('check');
  expect(fs.existsSync(path.join(root, 'out'))).toBe(false);
  const bad = spawnSync(process.execPath, [args[0], '--wat', '--json'], { encoding: 'utf8' });
  expect(bad.status).toBe(1);
  expect(JSON.parse(bad.stdout).errors[0].code).toBe('INVALID_ARGUMENT');
});
