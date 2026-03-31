import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import {
  ConfigurationError,
  ConfigurationManager,
  DEFAULT_FONT_FORMATS,
  createConfiguration,
} from '../src/config/ConfigurationManager';

const fixtureSvg = path.resolve(__dirname, '../examples/svg/24.svg');

function createTempSvgDir(prefix: string): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  fs.copyFileSync(fixtureSvg, path.join(directory, 'sample.svg'));
  return directory;
}

describe('ConfigurationManager', () => {
  test('applies defaults and normalizes single-directory paths', () => {
    const srcDir = createTempSvgDir('svgs2fonts-config-single-');
    const distDir = path.join(srcDir, 'dist');

    const config = new ConfigurationManager({
      src: srcDir,
      dist: distDir,
      fontName: 'test-font',
    });

    const options = config.getOptions();
    expect(options.src).toBe(path.resolve(srcDir));
    expect(options.dist).toBe(path.resolve(distDir));
    expect(options.fontName).toBe('test-font');
    expect(options.fontFormats).toEqual(DEFAULT_FONT_FORMATS);
    expect(options.batchMode).toBe(false);
    expect(options.continueOnError).toBe(true);
  });

  test('allows batch mode without placeholder src', () => {
    const inputA = createTempSvgDir('svgs2fonts-config-batch-a-');
    const inputB = createTempSvgDir('svgs2fonts-config-batch-b-');
    const distDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-config-batch-out-'));

    const config = new ConfigurationManager({
      batchMode: true,
      inputDirectories: [inputA, inputB],
      dist: distDir,
      fontName: 'batch-font',
    });

    const options = config.getOptions();
    expect(options.batchMode).toBe(true);
    expect(options.src).toBe('');
    expect(options.inputDirectories).toEqual([path.resolve(inputA), path.resolve(inputB)]);
  });

  test('rejects invalid font formats', () => {
    const srcDir = createTempSvgDir('svgs2fonts-config-invalid-format-');

    expect(() => {
      new ConfigurationManager({
        src: srcDir,
        dist: path.join(srcDir, 'dist'),
        fontName: 'bad-format',
        fontFormats: ['variable' as any],
      });
    }).toThrow(ConfigurationError);
  });

  test('rejects batch mode without input directories', () => {
    const distDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-config-missing-input-'));

    expect(() => {
      new ConfigurationManager({
        batchMode: true,
        dist: distDir,
        fontName: 'missing-input',
      });
    }).toThrow('inputDirectories');
  });

  test('rejects missing batch input directories that do not exist', () => {
    const distDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-config-missing-dir-'));
    const missingDir = path.join(distDir, 'does-not-exist');

    expect(() => {
      new ConfigurationManager({
        batchMode: true,
        inputDirectories: [missingDir],
        dist: distDir,
        fontName: 'missing-dir',
      });
    }).toThrow('Input directories do not exist');
  });

  test('factory helper returns a validated configuration manager', () => {
    const srcDir = createTempSvgDir('svgs2fonts-config-factory-');
    const distDir = path.join(srcDir, 'dist');

    const config = createConfiguration({
      src: srcDir,
      dist: distDir,
      fontName: 'factory-font',
      fontFormats: ['woff2', 'woff'],
    });

    expect(config).toBeInstanceOf(ConfigurationManager);
    expect(config.getOptions().fontFormats).toEqual(['woff2', 'woff']);
  });
});
