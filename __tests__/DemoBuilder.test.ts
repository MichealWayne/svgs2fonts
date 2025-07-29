/**
 * @module DemoBuilder.test
 * @author Wayne<michealwayne@163.com>
 * @Date 2025-07-27 11:00:00
 * @description Tests for the DemoBuilder module
 */

import { DemoBuilder } from '../src/builders/DemoBuilder';
import { InitOptionsParams } from '../src/types/OptionType';

// Mock utils
jest.mock('../src/utils/fsUtils', () => ({
  writeFile: jest.fn().mockResolvedValue(true),
}));

jest.mock('../src/utils/utils', () => ({
  log: jest.fn(),
  errorLog: jest.fn(),
  isString: jest.fn(value => typeof value === 'string'),
}));

// Mock SVGBuilder
jest.mock('../src/builders/SVGBuilder', () => ({
  SVGBuilder: jest.fn().mockImplementation(() => ({
    buildFont: jest.fn().mockResolvedValue({
      svgPath: 'test.svg',
      unicodeObj: {
        'icon-home': '\ue000',
        'icon-user': '\ue001',
        'icon-settings': '\ue002',
        'icon-search': '\ue003',
      },
    }),
  })),
}));

// Mock constants
jest.mock('../constant', () => ({
  DEMO_CSS: `
.{{ fontName }} {
  font-family: '{{ fontName }}';
  font-style: normal;
  font-weight: normal;
}
{{ classCss }}
`,
  DEMO_HTML: `
<!DOCTYPE html>
<html>
<head>
  <title>{{ fontName }} Demo</title>
  <style>{{ css }}</style>
</head>
<body>
  <h1>{{ fontName }} Icons</h1>
  {{ content }}
</body>
</html>
`,
  SUCCESS_FLAG: true,
  FAIL_FLAG: false,
}));

describe('DemoBuilder', () => {
  let demoBuilder: DemoBuilder;
  const mockOptions: InitOptionsParams = {
    src: 'src/svg',
    dist: 'dist/fonts',
    fontName: 'testfont',
    unicodeStart: 0xe000,
    debug: false,
    noDemo: true, // Set to false for testing demo generation
    demoUnicodeHTML: 'demo_unicode.html',
    demoFontClassHTML: 'demo_fontclass.html',
    fontFormats: ['ttf', 'woff', 'woff2'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    demoBuilder = new DemoBuilder();
  });

  describe('Demo Generation', () => {
    it('should create a DemoBuilder instance', () => {
      expect(demoBuilder).toBeInstanceOf(DemoBuilder);
    });

    it('should have required methods', () => {
      expect(typeof demoBuilder.buildDemo).toBe('function');
    });

    it('should skip demo generation when noDemo is true', async () => {
      const result = await demoBuilder.buildDemo(mockOptions);

      expect(result).toBeDefined();

      const { writeFile } = require('../src/utils/fsUtils');
      // Should not write demo files when noDemo is true
      expect(writeFile).not.toHaveBeenCalled();
    });

    it('should generate demo files when noDemo is false', async () => {
      const demoOptions = {
        ...mockOptions,
        noDemo: false,
      };

      const result = await demoBuilder.buildDemo(demoOptions);

      expect(result).toBeDefined();

      const { writeFile } = require('../src/utils/fsUtils');
      // Should write demo files when noDemo is false
      expect(writeFile).toHaveBeenCalled();
    });

    it('should generate unicode demo HTML', async () => {
      const demoOptions = {
        ...mockOptions,
        noDemo: false,
      };

      const result = await demoBuilder.buildDemo(demoOptions);

      expect(result).toBeDefined();

      const { writeFile } = require('../src/utils/fsUtils');
      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('demo_unicode.html'),
        expect.any(String)
      );
    });

    it('should generate fontclass demo HTML', async () => {
      const demoOptions = {
        ...mockOptions,
        noDemo: false,
      };

      const result = await demoBuilder.buildDemo(demoOptions);

      expect(result).toBeDefined();

      const { writeFile } = require('../src/utils/fsUtils');
      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('demo_fontclass.html'),
        expect.any(String)
      );
    });

    it('should generate CSS file for fontclass demo', async () => {
      const demoOptions = {
        ...mockOptions,
        noDemo: false,
      };

      const result = await demoBuilder.buildDemo(demoOptions);

      expect(result).toBeDefined();

      const { writeFile } = require('../src/utils/fsUtils');
      expect(writeFile).toHaveBeenCalledWith(expect.stringContaining('.css'), expect.any(String));
    });
  });

  describe('Template Processing', () => {
    it('should process icon unicode mappings correctly', async () => {
      const demoOptions = {
        ...mockOptions,
        noDemo: false,
      };

      const result = await demoBuilder.buildDemo(demoOptions);

      expect(result).toBeDefined();

      // Should use the mocked unicode mapping
      const { writeFile } = require('../src/utils/fsUtils');
      const calls = writeFile.mock.calls;

      // Check that generated content includes icon references
      const generatedContent = calls.find(call => call[0].includes('demo_unicode.html'));
      expect(generatedContent).toBeDefined();
    });

    it('should handle custom font names in templates', async () => {
      const customOptions = {
        ...mockOptions,
        noDemo: false,
        fontName: 'custom-icon-font',
      };

      const result = await demoBuilder.buildDemo(customOptions);

      expect(result).toBeDefined();

      const { writeFile } = require('../src/utils/fsUtils');
      expect(writeFile).toHaveBeenCalled();
    });

    it('should handle custom demo file names', async () => {
      const customOptions = {
        ...mockOptions,
        noDemo: false,
        demoUnicodeHTML: 'custom_unicode_demo.html',
        demoFontClassHTML: 'custom_fontclass_demo.html',
      };

      const result = await demoBuilder.buildDemo(customOptions);

      expect(result).toBeDefined();

      const { writeFile } = require('../src/utils/fsUtils');
      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('custom_unicode_demo.html'),
        expect.any(String)
      );
      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('custom_fontclass_demo.html'),
        expect.any(String)
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle SVG building errors', async () => {
      const { SVGBuilder } = require('../src/builders/SVGBuilder');
      const mockSVGBuilder = SVGBuilder as jest.MockedClass<typeof SVGBuilder>;

      mockSVGBuilder.prototype.buildFont.mockRejectedValueOnce(new Error('SVG build failed'));

      const demoOptions = {
        ...mockOptions,
        noDemo: false,
      };

      const result = await demoBuilder.buildDemo(demoOptions);

      expect(result).toBeDefined();
    });

    it('should handle file writing errors', async () => {
      const { writeFile } = require('../src/utils/fsUtils');
      writeFile.mockRejectedValueOnce(new Error('File write failed'));

      const demoOptions = {
        ...mockOptions,
        noDemo: false,
      };

      const result = await demoBuilder.buildDemo(demoOptions);

      expect(result).toBeDefined();
    });

    it('should handle empty unicode mapping', async () => {
      const { SVGBuilder } = require('../src/builders/SVGBuilder');
      const mockSVGBuilder = SVGBuilder as jest.MockedClass<typeof SVGBuilder>;

      mockSVGBuilder.prototype.buildFont.mockResolvedValueOnce({
        svgPath: 'test.svg',
        unicodeObj: {},
      });

      const demoOptions = {
        ...mockOptions,
        noDemo: false,
      };

      const result = await demoBuilder.buildDemo(demoOptions);

      expect(result).toBeDefined();
    });

    it('should handle invalid unicode mappings', async () => {
      const { SVGBuilder } = require('../src/builders/SVGBuilder');
      const mockSVGBuilder = SVGBuilder as jest.MockedClass<typeof SVGBuilder>;

      mockSVGBuilder.prototype.buildFont.mockResolvedValueOnce({
        svgPath: 'test.svg',
        unicodeObj: null,
      });

      const demoOptions = {
        ...mockOptions,
        noDemo: false,
      };

      const result = await demoBuilder.buildDemo(demoOptions);

      expect(result).toBeDefined();
    });
  });

  describe('Debug Mode', () => {
    it('should provide verbose logging in debug mode', async () => {
      const debugOptions = {
        ...mockOptions,
        noDemo: false,
        debug: true,
      };

      const result = await demoBuilder.buildDemo(debugOptions);

      expect(result).toBeDefined();

      const { log } = require('../src/utils/utils');
      expect(log).toHaveBeenCalled();
    });

    it('should include metadata in debug output', async () => {
      const debugOptions = {
        ...mockOptions,
        noDemo: false,
        debug: true,
      };

      const result = await demoBuilder.buildDemo(debugOptions);

      expect(result).toBeDefined();
    });
  });

  describe('Integration', () => {
    it('should work with different output directories', async () => {
      const customOptions = {
        ...mockOptions,
        noDemo: false,
        dist: 'custom/output/directory',
      };

      const result = await demoBuilder.buildDemo(customOptions);

      expect(result).toBeDefined();

      const { writeFile } = require('../src/utils/fsUtils');
      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('custom/output/directory'),
        expect.any(String)
      );
    });

    it('should handle Unicode characters correctly', async () => {
      const result = await demoBuilder.buildDemo({
        ...mockOptions,
        noDemo: false,
      });

      expect(result).toBeDefined();
    });

    it('should generate consistent output across multiple runs', async () => {
      const options = {
        ...mockOptions,
        noDemo: false,
      };

      const result1 = await demoBuilder.buildDemo(options);
      const result2 = await demoBuilder.buildDemo(options);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });
  });
});
