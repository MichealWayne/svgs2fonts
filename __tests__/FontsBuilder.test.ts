import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import FontsBuilder from '../src/builders/FontsBuilder';

const fixtureSvgFont = path.resolve(__dirname, '../examples/dest/myfont.svg');

function createFontFixture(prefix: string) {
  const distDir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  const fontName = 'fixture-font';
  fs.copyFileSync(fixtureSvgFont, path.join(distDir, `${fontName}.svg`));

  return {
    buildOptions: {
      dist: distDir,
      fontName,
      debug: false,
    },
  } as any;
}

describe('FontsBuilder', () => {
  test('exports supported formats including svg', () => {
    expect(FontsBuilder.getSupportedFormats()).toEqual(['svg', 'ttf', 'eot', 'woff', 'woff2']);
  });

  test('reports existing svg output as a generated format', async () => {
    const builder = new FontsBuilder(createFontFixture('svgs2fonts-fonts-builder-svg-'));

    const result = await builder.generateFormat('svg');

    expect(result.success).toBe(true);
    expect(result.outputPath).toMatch(/fixture-font\.svg$/);
  });

  test('generates requested binary formats from the svg font', async () => {
    const builder = new FontsBuilder(createFontFixture('svgs2fonts-fonts-builder-binary-'));

    const result = await builder.generateBatch(['woff', 'woff2']);

    expect(result.failed).toHaveLength(0);
    expect(result.successful.map(item => item.format)).toEqual(['woff', 'woff2']);
  });
});
