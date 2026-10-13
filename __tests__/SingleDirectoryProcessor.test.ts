import fs from 'fs';
import os from 'os';
import path from 'path';
import { SingleDirectoryProcessor } from '../src/processors/SingleDirectoryProcessor';
import { createConfiguration } from '../src/config';

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0 L24 0 L24 24 Z"/></svg>';
let root: string;
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-single-test-'));
  fs.mkdirSync(path.join(root, 'src'));
  fs.writeFileSync(path.join(root, 'src/home.svg'), svg);
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));
function config(extra = {}) {
  return createConfiguration({
    src: path.join(root, 'src'),
    dist: path.join(root, 'out'),
    fontFormats: ['woff2'],
    ...extra,
  });
}

test('generates only requested formats and emits single-directory progress', async () => {
  const callback = jest.fn();
  const processor = new SingleDirectoryProcessor(
    config({ noDemo: true, progressCallback: callback })
  );
  const result = await processor.processDetailed();
  expect(result.status).toBe('success');
  expect(fs.readdirSync(path.join(root, 'out'))).toEqual(['iconfont.woff2']);
  expect(callback.mock.calls.map(([info]) => info.phase)).toContain('SVG Processing');
  expect(callback.mock.calls.map(([info]) => info.phase)).toContain('Font Generation');
});

test('produces independent CSS and manifest without demo HTML', async () => {
  const report = await new SingleDirectoryProcessor(
    config({ noDemo: true, outputCss: true, outputManifest: true })
  ).processDetailed();
  expect(report.status).toBe('success');
  const css = fs.readFileSync(path.join(root, 'out/iconfont.css'), 'utf8');
  expect(css).toContain('iconfont.woff2');
  expect(css).not.toContain('iconfont.ttf');
  expect(css).toContain('.icon-home');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'out/iconfont.json'), 'utf8'));
  expect(manifest.codepoints).toEqual(report.codepoints);
  expect(fs.existsSync(path.join(root, 'out/demo_unicode.html'))).toBe(false);
});

test('conversion failure preserves old artifacts and returns the real reason', async () => {
  const processor = new SingleDirectoryProcessor(config({ noDemo: true }));
  expect(await processor.process()).toBe(true);
  const previous = fs.readFileSync(path.join(root, 'out/iconfont.woff2'));
  fs.writeFileSync(path.join(root, 'src/home.svg'), '<svg><path d="broken"/></svg>');
  const report = await processor.processDetailed();
  expect(report.status).toBe('failed');
  expect(report.errors[0].message).toMatch(/glyph|path|command|SVG/i);
  expect(fs.readFileSync(path.join(root, 'out/iconfont.woff2'))).toEqual(previous);
  expect(fs.readdirSync(root).filter(name => name.startsWith('.svgs2fonts'))).toEqual([]);
});

test('check mode writes nothing and does not run converters', async () => {
  const report = await new SingleDirectoryProcessor(config()).processDetailed(true);
  expect(report.status).toBe('success');
  expect(report.outputs).toEqual([]);
  expect(fs.existsSync(path.join(root, 'out'))).toBe(false);
});
