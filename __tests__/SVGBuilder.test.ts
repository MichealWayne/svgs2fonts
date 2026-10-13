import fs from 'fs';
import os from 'os';
import path from 'path';
import SVGBuilder from '../src/builders/SVGBuilder';

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0 L24 0 L24 24 Z"/></svg>';
const roots: string[] = [];
function setup(names = ['home']) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-svg-test-'));
  roots.push(root);
  const src = path.join(root, 'src');
  fs.mkdirSync(src);
  names.forEach(name => fs.writeFileSync(path.join(src, `${name}.svg`), svg));
  return { src, dist: path.join(root, 'out'), fontName: 'icons', unicodeStart: 10000 };
}
afterAll(() => roots.forEach(root => fs.rmSync(root, { recursive: true, force: true })));

test('creates an SVG font and actual glyph mappings', async () => {
  const options = setup(['home', 'user']);
  const builder = new SVGBuilder(options);
  expect(await builder.createSvgsFont()).toBe(true);
  expect(Object.keys(builder.unicodeMapping)).toEqual(['home', 'user']);
  expect(fs.readFileSync(path.join(options.dist, 'icons.svg'), 'utf8')).toContain('<glyph');
});

test('fails on an empty directory with a specific error', async () => {
  const builder = new SVGBuilder(setup([]));
  expect(await builder.createSvgsFont()).toBe(false);
  expect(builder.error?.message).toContain('No SVG');
});

test('isolates codepoint allocation across different builds', async () => {
  const first = new SVGBuilder(setup(['icon-1760']));
  const second = new SVGBuilder(setup(['icon-4008']));
  const repeated = new SVGBuilder(setup(['icon-4008']));
  expect(await first.createSvgsFont()).toBe(true);
  expect(await second.createSvgsFont()).toBe(true);
  expect(await repeated.createSvgsFont()).toBe(true);
  expect(second.unicodeMapping).toEqual(repeated.unicodeMapping);
  expect(second.unicodeMapping['icon-4008']).toBe('&#26543;');
});

test('honors explicit mappings and font metrics', async () => {
  const options = { ...setup(), fontHeight: 2048, normalize: false, codepoints: { home: 57344 } };
  const builder = new SVGBuilder(options);
  expect(await builder.createSvgsFont()).toBe(true);
  const font = fs.readFileSync(path.join(options.dist, 'icons.svg'), 'utf8');
  expect(font).toContain('units-per-em="2048"');
  expect(builder.unicodeMapping.home).toBe('&#57344;');
});

test('reports malformed SVG instead of claiming completion', async () => {
  const options = setup();
  fs.writeFileSync(path.join(options.src, 'home.svg'), '<svg><path d="broken"/></svg>');
  const builder = new SVGBuilder(options);
  expect(await builder.createSvgsFont()).toBe(false);
  expect(builder.error).toBeInstanceOf(Error);
});
