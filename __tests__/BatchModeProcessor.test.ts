import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { createConfiguration } from '../src/config';
import { BatchModeProcessor } from '../src/processors';

const fixtureSvg = path.resolve(__dirname, '../examples/svg/24.svg');

function createTempSvgDir(prefix: string): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  fs.copyFileSync(fixtureSvg, path.join(directory, 'sample.svg'));
  return directory;
}

describe('BatchModeProcessor', () => {
  test('processes multiple directories without placeholder src', async () => {
    const inputA = createTempSvgDir('svgs2fonts-batch-processor-a-');
    const inputB = createTempSvgDir('svgs2fonts-batch-processor-b-');
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-batch-processor-out-'));

    const config = createConfiguration({
      batchMode: true,
      inputDirectories: [inputA, inputB],
      dist: outputDir,
      fontName: 'batch-processor-font',
      noDemo: true,
    });

    const processor = new BatchModeProcessor(config);
    const result = await processor.process();

    expect(result).toBe(true);
    expect(fs.existsSync(path.join(outputDir, path.basename(inputA), 'batch-processor-font.svg'))).toBe(
      true
    );
    expect(fs.existsSync(path.join(outputDir, path.basename(inputB), 'batch-processor-font.svg'))).toBe(
      true
    );
  });

  test('returns an error when batch input directories are missing', async () => {
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-batch-processor-missing-'));

    expect(() =>
      createConfiguration({
        batchMode: true,
        dist: outputDir,
        fontName: 'batch-processor-font',
      })
    ).toThrow('inputDirectories');
  });

  test('supports outputPattern with preserveDirectoryStructure', async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-batch-root-'));
    const nestedGroup = path.join(rootDir, 'group');
    fs.mkdirSync(nestedGroup, { recursive: true });

    const inputA = path.join(rootDir, 'alpha');
    const inputB = path.join(nestedGroup, 'beta');
    fs.mkdirSync(inputA, { recursive: true });
    fs.mkdirSync(inputB, { recursive: true });
    fs.copyFileSync(fixtureSvg, path.join(inputA, 'sample.svg'));
    fs.copyFileSync(fixtureSvg, path.join(inputB, 'sample.svg'));

    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-batch-pattern-out-'));
    const config = createConfiguration({
      batchMode: true,
      inputDirectories: [inputA, inputB],
      dist: outputDir,
      fontName: 'templated-font',
      noDemo: true,
      outputPattern: 'fonts/[name]-[fontname]',
      preserveDirectoryStructure: true,
    });

    const processor = new BatchModeProcessor(config);
    const result = await processor.process();

    expect(result).toBe(true);
    expect(
      fs.existsSync(
        path.join(outputDir, 'alpha', 'fonts', 'alpha-templated-font', 'templated-font.svg')
      )
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(
          outputDir,
          'group',
          'beta',
          'fonts',
          'beta-templated-font',
          'templated-font.svg'
        )
      )
    ).toBe(true);
  });
});
