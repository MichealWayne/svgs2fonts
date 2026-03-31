import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import DemoBuilder from '../src/builders/DemoBuilder';

function createSvgBuilderStub(prefix: string) {
  const distDir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));

  return {
    buildOptions: {
      dist: distDir,
      fontName: 'demo-font',
      demoUnicodeHTML: 'demo_unicode.html',
      demoFontClassHTML: 'demo_fontclass.html',
      debug: false,
    },
    unicodeMapping: {
      home: '&#57344;',
      user: '&#57345;',
    },
  } as any;
}

describe('DemoBuilder', () => {
  test('generates demo html and css files', async () => {
    const svgBuilder = createSvgBuilderStub('svgs2fonts-demo-builder-');
    const builder = new DemoBuilder(svgBuilder);

    const result = await builder.html();

    expect(result).toBe(true);
    expect(fs.existsSync(path.join(svgBuilder.buildOptions.dist, 'demo_unicode.html'))).toBe(true);
    expect(fs.existsSync(path.join(svgBuilder.buildOptions.dist, 'demo_unicode.css'))).toBe(true);
    expect(fs.existsSync(path.join(svgBuilder.buildOptions.dist, 'demo_fontclass.html'))).toBe(
      true
    );
    expect(fs.existsSync(path.join(svgBuilder.buildOptions.dist, 'demo_fontclass.css'))).toBe(
      true
    );
  });

  test('exposes renderer stats', () => {
    const builder = new DemoBuilder(createSvgBuilderStub('svgs2fonts-demo-builder-stats-'));

    expect(builder.getStats()).toEqual({
      templateRenderer: 'simple',
      pendingTasks: 0,
    });
  });
});
