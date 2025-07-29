/**
 * @module FontsBuilder.test
 * @author Wayne<michealwayne@163.com>
 * @Date 2025-07-27 10:45:00
 * @description Tests for the FontsBuilder module
 */

import fs from 'fs';
import { FontsBuilder } from '../src/builders/FontsBuilder';
import { InitOptionsParams } from '../src/types/OptionType';

// Mock font conversion libraries
jest.mock('svg2ttf', () => jest.fn(() => ({ buffer: Buffer.from('ttf-data') })));
jest.mock('ttf2eot', () => jest.fn(() => Buffer.from('eot-data')));
jest.mock('ttf2woff', () => jest.fn(() => ({ buffer: Buffer.from('woff-data') })));
jest.mock('ttf2woff2', () => jest.fn(() => Buffer.from('woff2-data')));

// Mock fs
jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs');
  return {
    ...originalFs,
    readFileSync: jest.fn(() => '<svg>mock svg content</svg>'),
    writeFileSync: jest.fn(),
    existsSync: jest.fn(() => true),
  };
});

// Mock utils
jest.mock('../src/utils/fsUtils', () => ({
  createIconFile: jest.fn().mockResolvedValue(true),
}));

jest.mock('../src/utils/utils', () => ({
  log: jest.fn(),
  errorLog: jest.fn(),
}));

// Mock SVGBuilder
jest.mock('../src/builders/SVGBuilder', () => ({
  SVGBuilder: jest.fn().mockImplementation(() => ({
    buildFont: jest.fn().mockResolvedValue({
      svgPath: 'test.svg',
      unicodeObj: { icon1: '\ue000', icon2: '\ue001' },
    }),
  })),
}));

describe('FontsBuilder', () => {
  let fontsBuilder: FontsBuilder;
  const mockOptions: InitOptionsParams = {
    src: 'src/svg',
    dist: 'dist/fonts',
    fontName: 'testfont',
    unicodeStart: 0xe000,
    debug: false,
    noDemo: false,
    demoUnicodeHTML: 'demo_unicode.html',
    demoFontClassHTML: 'demo_fontclass.html',
    fontFormats: ['ttf', 'woff', 'woff2', 'eot'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fontsBuilder = new FontsBuilder();
  });

  describe('Font Generation', () => {
    it('should create a FontsBuilder instance', () => {
      expect(fontsBuilder).toBeInstanceOf(FontsBuilder);
    });

    it('should have required methods', () => {
      expect(typeof fontsBuilder.buildFonts).toBe('function');
    });

    it('should generate multiple font formats', async () => {
      const result = await fontsBuilder.buildFonts(mockOptions);

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
    });

    it('should generate TTF font format', async () => {
      const optionsWithTTF = {
        ...mockOptions,
        fontFormats: ['ttf'],
      };

      const result = await fontsBuilder.buildFonts(optionsWithTTF);

      expect(result).toBeDefined();
      expect(result.results.some(r => r.format === 'ttf')).toBe(true);
    });

    it('should generate WOFF font format', async () => {
      const optionsWithWOFF = {
        ...mockOptions,
        fontFormats: ['woff'],
      };

      const result = await fontsBuilder.buildFonts(optionsWithWOFF);

      expect(result).toBeDefined();
      expect(result.results.some(r => r.format === 'woff')).toBe(true);
    });

    it('should generate WOFF2 font format', async () => {
      const optionsWithWOFF2 = {
        ...mockOptions,
        fontFormats: ['woff2'],
      };

      const result = await fontsBuilder.buildFonts(optionsWithWOFF2);

      expect(result).toBeDefined();
      expect(result.results.some(r => r.format === 'woff2')).toBe(true);
    });

    it('should generate EOT font format', async () => {
      const optionsWithEOT = {
        ...mockOptions,
        fontFormats: ['eot'],
      };

      const result = await fontsBuilder.buildFonts(optionsWithEOT);

      expect(result).toBeDefined();
      expect(result.results.some(r => r.format === 'eot')).toBe(true);
    });

    it('should handle all font formats together', async () => {
      const result = await fontsBuilder.buildFonts(mockOptions);

      expect(result).toBeDefined();
      expect(result.results.length).toBeGreaterThan(0);

      const formats = result.results.map(r => r.format);
      expect(formats).toContain('ttf');
      expect(formats).toContain('woff');
      expect(formats).toContain('woff2');
      expect(formats).toContain('eot');
    });
  });

  describe('Error Handling', () => {
    it('should handle SVG building errors', async () => {
      const { SVGBuilder } = require('../src/builders/SVGBuilder');
      const mockSVGBuilder = SVGBuilder as jest.MockedClass<typeof SVGBuilder>;

      mockSVGBuilder.prototype.buildFont.mockRejectedValueOnce(new Error('SVG build failed'));

      const result = await fontsBuilder.buildFonts(mockOptions);

      expect(result).toBeDefined();
    });

    it('should handle TTF conversion errors', async () => {
      const svg2ttf = require('svg2ttf');
      svg2ttf.mockImplementationOnce(() => {
        throw new Error('TTF conversion failed');
      });

      const result = await fontsBuilder.buildFonts({
        ...mockOptions,
        fontFormats: ['ttf'],
      });

      expect(result).toBeDefined();
    });

    it('should handle file writing errors', async () => {
      (fs.writeFileSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error('File write failed');
      });

      const result = await fontsBuilder.buildFonts(mockOptions);

      expect(result).toBeDefined();
    });

    it('should handle missing SVG source file', async () => {
      (fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error('File not found');
      });

      const result = await fontsBuilder.buildFonts(mockOptions);

      expect(result).toBeDefined();
    });
  });

  describe('Configuration Options', () => {
    it('should handle custom font name', async () => {
      const customOptions = {
        ...mockOptions,
        fontName: 'custom-font-name',
      };

      const result = await fontsBuilder.buildFonts(customOptions);

      expect(result).toBeDefined();
    });

    it('should handle custom output directory', async () => {
      const customOptions = {
        ...mockOptions,
        dist: 'custom/output/dir',
      };

      const result = await fontsBuilder.buildFonts(customOptions);

      expect(result).toBeDefined();
    });

    it('should handle debug mode', async () => {
      const debugOptions = {
        ...mockOptions,
        debug: true,
      };

      const result = await fontsBuilder.buildFonts(debugOptions);

      expect(result).toBeDefined();

      const { log } = require('../src/utils/utils');
      expect(log).toHaveBeenCalled();
    });

    it('should handle empty font formats array', async () => {
      const emptyFormatsOptions = {
        ...mockOptions,
        fontFormats: [],
      };

      const result = await fontsBuilder.buildFonts(emptyFormatsOptions);

      expect(result).toBeDefined();
      expect(result.results).toHaveLength(0);
    });

    it('should handle unsupported font formats gracefully', async () => {
      const unsupportedOptions = {
        ...mockOptions,
        fontFormats: ['ttf', 'unsupported-format'],
      };

      const result = await fontsBuilder.buildFonts(unsupportedOptions);

      expect(result).toBeDefined();
    });
  });

  describe('Performance and Statistics', () => {
    it('should track generation time for each format', async () => {
      const result = await fontsBuilder.buildFonts(mockOptions);

      expect(result).toBeDefined();
      expect(result.totalTime).toBeGreaterThanOrEqual(0);
    });

    it('should provide success/failure statistics', async () => {
      const result = await fontsBuilder.buildFonts(mockOptions);

      expect(result).toBeDefined();
      expect(typeof result.successCount).toBe('number');
      expect(typeof result.failureCount).toBe('number');
    });

    it('should calculate file sizes for generated fonts', async () => {
      const result = await fontsBuilder.buildFonts(mockOptions);

      expect(result).toBeDefined();
      result.results.forEach(fontResult => {
        if (fontResult.success && fontResult.fileSize !== undefined) {
          expect(typeof fontResult.fileSize).toBe('number');
          expect(fontResult.fileSize).toBeGreaterThan(0);
        }
      });
    });
  });
});
