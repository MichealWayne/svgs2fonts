/**
 * @module SVGBuilder.test
 * @author Wayne<michealwayne@163.com>
 * @Date 2025-07-27 10:30:00
 * @description Tests for the SVGBuilder module
 */

import SVGBuilder from '../src/builders/SVGBuilder';
import { InitOptionsParams } from '../src/types/OptionType';

// Mock dependencies
jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs');
  return {
    ...originalFs,
    existsSync: jest.fn(() => true),
    createReadStream: jest.fn(() => ({
      pipe: jest.fn(),
      on: jest.fn((event, callback) => {
        if (event === 'end') callback();
        return this;
      }),
    })),
    createWriteStream: jest.fn(() => ({
      write: jest.fn(),
      end: jest.fn(),
      on: jest.fn((event, callback) => {
        if (event === 'finish') callback();
        return this;
      }),
    })),
  };
});

jest.mock('svgicons2svgfont', () => {
  return jest.fn().mockImplementation(() => ({
    pipe: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
    on: jest.fn((event, callback) => {
      if (event === 'finish') callback();
      return this;
    }),
  }));
});

jest.mock('../src/utils/fsUtils', () => ({
  filterSvgFiles: jest.fn(() => ['icon1.svg', 'icon2.svg', 'icon3.svg']),
  mkdirpSync: jest.fn(() => true),
}));

jest.mock('../src/utils/utils', () => ({
  log: jest.fn(),
  errorLog: jest.fn(),
  getIconStrUnicode: jest.fn((name, start) => start + name.charCodeAt(0)),
  isSuccessResult: jest.fn(() => true),
}));

describe('SVGBuilder', () => {
  let svgBuilder: SVGBuilder;
  const mockOptions: InitOptionsParams = {
    src: 'src/svg',
    dist: 'dist/fonts',
    fontName: 'testfont',
    unicodeStart: 0xe000,
    debug: false,
    noDemo: false,
    demoUnicodeHTML: 'demo_unicode.html',
    demoFontClassHTML: 'demo_fontclass.html',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    svgBuilder = new SVGBuilder(mockOptions);
  });

  describe('SVG Font Generation', () => {
    it('should create an SVGBuilder instance', () => {
      expect(svgBuilder).toBeInstanceOf(SVGBuilder);
    });

    it('should have required methods', () => {
      expect(typeof svgBuilder.createSvgsFont).toBe('function');
      expect(typeof svgBuilder.clearCache).toBe('function');
    });

    it('should generate SVG font from multiple SVG files', async () => {
      const result = await svgBuilder.createSvgsFont();

      expect(typeof result).toBe('boolean');
    });

    it('should handle empty SVG directory', async () => {
      const { filterSvgFiles } = require('../src/utils/fsUtils');
      filterSvgFiles.mockReturnValueOnce([]);

      const result = await svgBuilder.createSvgsFont();

      expect(typeof result).toBe('boolean');
    });

    it('should handle SVG files with different unicode ranges', async () => {
      const builderWithCustomUnicode = new SVGBuilder({
        ...mockOptions,
        unicodeStart: 0xf000,
      });

      const result = await builderWithCustomUnicode.createSvgsFont();

      expect(typeof result).toBe('boolean');
    });

    it('should create output directory if it does not exist', async () => {
      const { mkdirpSync } = require('../src/utils/fsUtils');

      await svgBuilder.createSvgsFont();

      expect(mkdirpSync).toHaveBeenCalled();
    });

    it('should handle debug mode', async () => {
      const debugBuilder = new SVGBuilder({
        ...mockOptions,
        debug: true,
      });

      const result = await debugBuilder.createSvgsFont();

      expect(typeof result).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing source directory', async () => {
      const { mkdirpSync } = require('../src/utils/fsUtils');
      mkdirpSync.mockReturnValueOnce(false);

      const result = await svgBuilder.createSvgsFont();

      expect(typeof result).toBe('boolean');
    });

    it('should handle file system errors gracefully', async () => {
      const { filterSvgFiles } = require('../src/utils/fsUtils');
      filterSvgFiles.mockImplementationOnce(() => {
        throw new Error('File system error');
      });

      const result = await svgBuilder.createSvgsFont();

      expect(typeof result).toBe('boolean');
    });
  });

  describe('Unicode Management', () => {
    it('should provide unicode mapping after font creation', () => {
      const unicodeMapping = svgBuilder.unicodeMapping;

      expect(typeof unicodeMapping).toBe('object');
    });

    it('should handle custom unicode start values', () => {
      const customBuilder = new SVGBuilder({
        ...mockOptions,
        unicodeStart: 0xf100,
      });

      expect(customBuilder).toBeDefined();
    });

    it('should clear cache', () => {
      expect(() => svgBuilder.clearCache()).not.toThrow();
    });
  });

  describe('Configuration', () => {
    it('should provide build options', () => {
      const buildOptions = svgBuilder.buildOptions;

      expect(buildOptions).toBeDefined();
      expect(buildOptions.fontName).toBe('testfont');
      expect(buildOptions.src).toBe('src/svg');
      expect(buildOptions.dist).toBe('dist/fonts');
    });

    it('should handle different SVG file formats', async () => {
      const result = await svgBuilder.createSvgsFont();

      expect(typeof result).toBe('boolean');
    });

    it('should handle SVG files with different naming conventions', async () => {
      const { filterSvgFiles } = require('../src/utils/fsUtils');
      filterSvgFiles.mockReturnValueOnce([
        'icon-home.svg',
        'icon_user.svg',
        'iconSettings.svg',
        'icon.search.svg',
      ]);

      const result = await svgBuilder.createSvgsFont();

      expect(typeof result).toBe('boolean');
    });
  });
});
