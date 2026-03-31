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

describe('Performance smoke tests', () => {
  test('performanceAnalysis mode completes successfully', async () => {
    const srcDir = createTempSvgDir('svgs2fonts-performance-src-');
    const distDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-performance-dist-'));
    const options: EnhancedOptions = {
      src: srcDir,
      dist: distDir,
      fontName: 'performance-font',
      fontFormats: ['woff2'],
      noDemo: true,
      performanceAnalysis: true,
    };

    const result = await init(options);

    expect(result).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'performance-font.woff2'))).toBe(true);
  });

  test('experimental performance flags remain accepted as smoke coverage', async () => {
    const srcDir = createTempSvgDir('svgs2fonts-performance-exp-src-');
    const distDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-performance-exp-dist-'));
    const options: EnhancedOptions = {
      src: srcDir,
      dist: distDir,
      fontName: 'performance-exp-font',
      fontFormats: ['woff'],
      noDemo: true,
      maxConcurrency: 4,
      enableCache: true,
      cacheDir: path.join(distDir, '.cache'),
      streamProcessing: true,
    };

    const result = await init(options);

    expect(result).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'performance-exp-font.woff'))).toBe(true);
  });
});
