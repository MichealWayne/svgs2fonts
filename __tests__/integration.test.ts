import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { init } from '../src/index';
import { EnhancedOptions } from '../src/types/EnhancedOptions';

const fixtureSvg = path.resolve(__dirname, '../examples/svg/24.svg');

function createTempSvgDir(prefix: string): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  fs.copyFileSync(fixtureSvg, path.join(directory, 'sample.svg'));
  return directory;
}

describe('Integration tests', () => {
  test('generates requested formats in single-directory mode', async () => {
    const srcDir = createTempSvgDir('svgs2fonts-integration-single-src-');
    const distDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-integration-single-dist-'));
    const options: EnhancedOptions = {
      src: srcDir,
      dist: distDir,
      fontName: 'integration-font',
      fontFormats: ['woff2', 'woff'],
      noDemo: true,
    };

    const result = await init(options);

    expect(result).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'integration-font.woff2'))).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'integration-font.woff'))).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'integration-font.svg'))).toBe(false);
  });

  test('supports batch mode with inputDirectories as the primary input', async () => {
    const inputA = createTempSvgDir('svgs2fonts-integration-batch-a-');
    const inputB = createTempSvgDir('svgs2fonts-integration-batch-b-');
    const distDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-integration-batch-dist-'));
    const options: EnhancedOptions = {
      batchMode: true,
      inputDirectories: [inputA, inputB],
      dist: distDir,
      fontName: 'integration-batch-font',
      noDemo: true,
    };

    const result = await init(options);

    expect(result).toBe(true);
    expect(fs.existsSync(path.join(distDir, path.basename(inputA), 'integration-batch-font.svg'))).toBe(
      true
    );
    expect(fs.existsSync(path.join(distDir, path.basename(inputB), 'integration-batch-font.svg'))).toBe(
      true
    );
  });

  test('returns an Error for missing source directories', async () => {
    const distDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-integration-error-dist-'));

    const result = await init({
      src: path.join(distDir, 'missing-src'),
      dist: distDir,
      fontName: 'missing-font',
    });

    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toContain('Source directory does not exist');
  });
});
