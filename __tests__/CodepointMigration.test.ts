import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { generate, migrateCodepoints } from '../src';
import { OutputTransaction } from '../src/core/OutputTransaction';

let root: string;
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-migration-'));
});
afterEach(() => {
  jest.restoreAllMocks();
  fs.rmSync(root, { recursive: true, force: true });
});
function source(content: string, extension = 'json') {
  const file = path.join(root, `deployed.${extension}`);
  fs.writeFileSync(file, content);
  return file;
}
function font(glyphs: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg"><defs><font id="old">${glyphs}</font></defs></svg>`;
}
function cli(args: string[]) {
  return spawnSync(process.execPath, [path.resolve(__dirname, '../bin/index.js'), ...args], {
    encoding: 'utf8',
  });
}

test.each([
  ['bare numeric map', { home: 57344 }],
  ['schema-1 manifest', { schemaVersion: 1, fontName: 'old', codepoints: { home: 57344 } }],
  ['legacy unicodeMapping', { unicodeMapping: { home: '&#xE000;' } }],
  ['decimal entities', { codepoints: { home: '&#57344;' } }],
])('imports %s without writes', async (_, data) => {
  const from = source(JSON.stringify(data));
  const report = await migrateCodepoints({ from });
  expect(report.success).toBe(true);
  expect(report.codepoints).toEqual({ home: 57344 });
  expect(report.outputs).toEqual([]);
  expect(fs.readdirSync(root)).toEqual(['deployed.json']);
});

test('decodes SVG font entities and names without inferring encodings', async () => {
  const from = source(
    font(
      '<glyph glyph-name="home&amp;dark" unicode="&#xE000;"/><glyph glyph-name="bell" unicode="&#57345;"/>'
    ),
    'svg'
  );
  const report = await migrateCodepoints({ from });
  expect(report.codepoints).toEqual({ bell: 57345, 'home&dark': 57344 });
  expect(report.success).toBe(true);
});

test('accepts standard SVG PUBLIC doctype without fetching it', async () => {
  const from = source(
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "https://invalid.example.test/svg.dtd">' +
      font('<glyph glyph-name="home" unicode="&#57344;"/>'),
    'svg'
  );
  expect((await migrateCodepoints({ from })).success).toBe(true);
});

test('warns about unencoded glyphs and excludes them from the map', async () => {
  const report = await migrateCodepoints({
    from: source(
      font('<glyph glyph-name="unused"/><glyph glyph-name="home" unicode="&#57344;"/>'),
      'svg'
    ),
  });
  expect(report.success).toBe(true);
  expect(report.iconCount).toBe(1);
  expect(report.warnings[0].code).toBe('MIGRATION_UNENCODED_GLYPH');
});

test.each([
  [
    'duplicate codes',
    font('<glyph glyph-name="a" unicode="A"/><glyph glyph-name="b" unicode="A"/>'),
    'MIGRATION_CONFLICT',
  ],
  [
    'duplicate names',
    font('<glyph glyph-name="a" unicode="A"/><glyph glyph-name="a" unicode="B"/>'),
    'MIGRATION_CONFLICT',
  ],
  ['missing name', font('<glyph unicode="A"/>'), 'MIGRATION_NAME_MISSING'],
  ['ligature', font('<glyph glyph-name="a" unicode="AB"/>'), 'MIGRATION_INVALID_CODEPOINT'],
  [
    'astral code',
    font('<glyph glyph-name="a" unicode="&#x1F600;"/>'),
    'MIGRATION_INVALID_CODEPOINT',
  ],
  ['ordinary icon', '<svg><path d="M0 0"/></svg>', 'MIGRATION_INVALID_SVG'],
  [
    'malformed XML',
    '<svg><font><glyph glyph-name="a" unicode="A"></font></svg>',
    'MIGRATION_INVALID_SVG',
  ],
  [
    'entity declaration',
    '<!DOCTYPE svg [<!ENTITY x "A">]>' + font('<glyph glyph-name="a" unicode="&x;"/>'),
    'MIGRATION_INVALID_SVG',
  ],
  ['multiple fonts', '<svg><font/><font/></svg>', 'MIGRATION_CONFLICT'],
  [
    'multiple roots',
    font('<glyph glyph-name="a" unicode="A"/>') + '<svg/>',
    'MIGRATION_INVALID_SVG',
  ],
  ['empty font', font(''), 'MIGRATION_EMPTY'],
])('rejects %s before creating output', async (_, content, code) => {
  const report = await migrateCodepoints({
    from: source(content, 'svg'),
    output: path.join(root, 'new.json'),
  });
  expect(report.success).toBe(false);
  expect(report.errors[0].code).toBe(code);
  expect(fs.readdirSync(root)).toEqual(['deployed.svg']);
});

test.each([
  ['duplicate JSON names', '{"home":1,"home":2}', 'MIGRATION_CONFLICT'],
  ['escaped duplicate names', '{"codepoints":{"home":1,"h\\u006fme":2}}', 'MIGRATION_CONFLICT'],
  ['duplicate codepoints', '{"a":1,"b":1}', 'MIGRATION_CONFLICT'],
  ['surrogates', '{"a":55296}', 'MIGRATION_INVALID_CODEPOINT'],
  ['fractions', '{"a":1.5}', 'MIGRATION_INVALID_CODEPOINT'],
  ['numeric strings', '{"a":"57344"}', 'MIGRATION_INVALID_CODEPOINT'],
  ['whitespace names', '{"home dark":1}', 'MIGRATION_INVALID_NAME'],
  [
    'ambiguous wrappers',
    '{"codepoints":{"a":1},"unicodeMapping":{"a":"&#1;"}}',
    'MIGRATION_CONFLICT',
  ],
  ['unsupported schema', '{"schemaVersion":2,"codepoints":{"a":1}}', 'MIGRATION_INVALID_JSON'],
  ['empty map', '{}', 'MIGRATION_EMPTY'],
  ['invalid JSON', '{', 'MIGRATION_INVALID_JSON'],
])('rejects %s without changing inputs', async (_, content, code) => {
  const from = source(content);
  const report = await migrateCodepoints({ from, output: path.join(root, 'new.json') });
  expect(report.errors[0].code).toBe(code);
  expect(fs.readFileSync(from, 'utf8')).toBe(content);
  expect(fs.readdirSync(root)).toEqual(['deployed.json']);
});

test('reports filename differences while retaining all deployed reservations', async () => {
  const src = path.join(root, 'icons');
  fs.mkdirSync(src);
  fs.writeFileSync(path.join(src, 'home.svg'), '<svg/>');
  fs.writeFileSync(path.join(src, 'new.SVG'), '<svg/>');
  const report = await migrateCodepoints({ from: source('{"home":57344,"retired":57345}'), src });
  expect(report.comparison).toEqual({
    source: src,
    matched: ['home'],
    missing: ['retired'],
    unmapped: ['new'],
  });
  expect(report.warnings[0].code).toBe('MIGRATION_SOURCE_MISMATCH');
  expect(report.codepoints.retired).toBe(57345);
});

test('writes an explicit new map and never overwrites it or the input', async () => {
  const from = source('{"home":57344}');
  const output = path.join(root, 'new.json');
  const report = await migrateCodepoints({ from, output });
  expect(report.success).toBe(true);
  expect(report.outputs).toEqual([output]);
  const map = fs.readFileSync(output, 'utf8');
  expect(JSON.parse(map)).toEqual({ schemaVersion: 1, codepoints: { home: 57344 } });
  expect((await migrateCodepoints({ from, output })).errors[0].code).toBe(
    'MIGRATION_OUTPUT_EXISTS'
  );
  expect(fs.readFileSync(output, 'utf8')).toBe(map);
  expect((await migrateCodepoints({ from, output: from })).errors[0].code).toBe(
    'MIGRATION_OUTPUT_EXISTS'
  );
  expect(fs.readFileSync(from, 'utf8')).toBe('{"home":57344}');
  expect(fs.readdirSync(root).sort()).toEqual(['deployed.json', 'new.json']);
});

test('uses the generation writer lock and preserves existing symlink targets', async () => {
  const from = source('{"home":57344}');
  const output = path.join(root, 'new.json');
  const transaction = new OutputTransaction(root, 'test');
  try {
    expect((await migrateCodepoints({ from, output })).errors[0].code).toBe('OUTPUT_LOCKED');
  } finally {
    transaction.cleanup();
  }
  fs.symlinkSync(from, output);
  expect((await migrateCodepoints({ from, output })).errors[0].code).toBe(
    'MIGRATION_OUTPUT_EXISTS'
  );
  expect(fs.readFileSync(from, 'utf8')).toBe('{"home":57344}');
});

test('write failure leaves no partial output or locks', async () => {
  const from = source('{"home":57344}');
  jest.spyOn(fs, 'linkSync').mockImplementation(() => {
    throw new Error('disk failure');
  });
  const report = await migrateCodepoints({ from, output: path.join(root, 'new.json') });
  expect(report.success).toBe(false);
  expect(report.outputs).toEqual([]);
  expect(fs.readdirSync(root)).toEqual(['deployed.json']);
});

test('round-trips a real generated font and preserves every code in a new build', async () => {
  const src = path.join(root, 'icons');
  fs.mkdirSync(src);
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0 L24 0 L24 24 Z"/></svg>';
  for (const name of ['home', 'home.dark"&']) fs.writeFileSync(path.join(src, `${name}.svg`), svg);
  const original = await generate({
    src,
    dist: path.join(root, 'deployed'),
    fontFormats: ['svg'],
    noDemo: true,
  });
  const out = path.join(root, 'new');
  fs.mkdirSync(out);
  const migration = await migrateCodepoints({
    from: original.outputs[0],
    src,
    output: path.join(out, 'codepoints.json'),
  });
  expect(migration.success).toBe(true);
  expect(migration.codepoints).toEqual(original.directories[0].codepoints);
  const rebuilt = await generate({
    src,
    dist: out,
    fontFormats: ['woff2'],
    noDemo: true,
    codepointMap: 'codepoints.json',
  });
  expect(rebuilt.success).toBe(true);
  expect(rebuilt.directories[0].codepoints).toEqual(original.directories[0].codepoints);
});

test('prototype-like names remain plain mapping data', async () => {
  const report = await migrateCodepoints({ from: source('{"__proto__":1,"constructor":2}') });
  expect(report.success).toBe(true);
  expect(Object.prototype.hasOwnProperty.call(report.codepoints, '__proto__')).toBe(true);
  expect(JSON.parse(JSON.stringify(report)).codepoints.__proto__).toBe(1);
});

test('format override handles other filenames; missing options return structured failures', async () => {
  const from = source('{"home":57344}', 'txt');
  expect((await migrateCodepoints({ from })).errors[0].code).toBe('INVALID_CONFIG');
  expect((await migrateCodepoints({ from, format: 'json' })).success).toBe(true);
  for (const options of [null, [], {}, { from, format: 'ttf' }])
    expect((await migrateCodepoints(options as any)).success).toBe(false);
});

test('CLI preview and write both produce one JSON report with correct exit status', () => {
  const from = source('{"home":57344}');
  const output = path.join(root, 'new.json');
  const preview = cli([`--migrate=${from}`, '--json']);
  expect(preview.status).toBe(0);
  expect(JSON.parse(preview.stdout)).toMatchObject({
    mode: 'migrate',
    success: true,
    codepoints: { home: 57344 },
    outputs: [],
  });
  expect(fs.existsSync(output)).toBe(false);
  const written = cli([`--migrate=${from}`, `--migration-output=${output}`, '--json']);
  expect(written.status).toBe(0);
  expect(JSON.parse(written.stdout).outputs).toEqual([output]);
  const repeated = cli([`--migrate=${from}`, `--migration-output=${output}`, '--json']);
  expect(repeated.status).toBe(1);
  expect(JSON.parse(repeated.stdout).errors[0].code).toBe('MIGRATION_OUTPUT_EXISTS');
  for (const args of [
    ['--migrate', '--json'],
    [`--migrate=${from}`, '--formats=svg', '--json'],
    [`--migrate=${from}`, '--migration-src', '--json'],
  ]) {
    const invalid = cli(args);
    expect(invalid.status).toBe(1);
    expect(JSON.parse(invalid.stdout).mode).toBe('migrate');
  }
});
