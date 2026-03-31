import { SingleDirectoryProcessor } from '../src/processors/SingleDirectoryProcessor';
import { ConfigurationManager } from '../src/config/ConfigurationManager';

jest.mock('../src/builders/SVGBuilder');
jest.mock('../src/builders/FontsBuilder');
jest.mock('../src/builders/DemoBuilder');
jest.mock('../src/utils', () => ({
  log: jest.fn(),
}));

describe('SingleDirectoryProcessor', () => {
  let configManager: jest.Mocked<ConfigurationManager>;
  let performanceTracker: { startPhase: jest.Mock; endPhase: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();

    configManager = {
      getOptions: jest.fn().mockReturnValue({
        src: './icons',
        dist: './dist',
        fontName: 'processor-font',
        unicodeStart: 0xe000,
        debug: false,
        noDemo: false,
        demoUnicodeHTML: 'demo_unicode.html',
        demoFontClassHTML: 'demo_fontclass.html',
        fontFormats: ['svg', 'woff2', 'woff'],
        verbose: false,
      }),
    } as any;

    performanceTracker = {
      startPhase: jest.fn(),
      endPhase: jest.fn(),
    };

    const SVGBuilder = require('../src/builders/SVGBuilder').default;
    const FontsBuilder = require('../src/builders/FontsBuilder').default;
    const DemoBuilder = require('../src/builders/DemoBuilder').default;

    SVGBuilder.mockImplementation(() => ({
      buildOptions: {
        dist: './dist',
        fontName: 'processor-font',
      },
      createSvgsFont: jest.fn().mockResolvedValue(true),
      clearCache: jest.fn(),
    }));

    FontsBuilder.mockImplementation(() => ({
      generateBatch: jest.fn().mockResolvedValue({
        successful: [{ format: 'woff2' }, { format: 'woff' }],
        failed: [],
      }),
    }));

    DemoBuilder.mockImplementation(() => ({
      html: jest.fn().mockResolvedValue(true),
    }));
  });

  test('processes requested formats and demo generation successfully', async () => {
    const processor = new SingleDirectoryProcessor(configManager, performanceTracker as any);
    const result = await processor.process();

    expect(result).toBe(true);
    expect(performanceTracker.startPhase).toHaveBeenCalledWith('SVG Processing');
    expect(performanceTracker.startPhase).toHaveBeenCalledWith('Font Generation');
    expect(performanceTracker.startPhase).toHaveBeenCalledWith('Demo Generation');
  });

  test('skips demo generation when noDemo is enabled', async () => {
    configManager.getOptions.mockReturnValue({
      ...configManager.getOptions(),
      noDemo: true,
    });

    const DemoBuilder = require('../src/builders/DemoBuilder').default;
    const processor = new SingleDirectoryProcessor(configManager, performanceTracker as any);
    const result = await processor.process();

    expect(result).toBe(true);
    expect(DemoBuilder).not.toHaveBeenCalled();
  });

  test('returns an Error when font generation fails', async () => {
    const FontsBuilder = require('../src/builders/FontsBuilder').default;
    FontsBuilder.mockImplementation(() => ({
      generateBatch: jest.fn().mockResolvedValue({
        successful: [],
        failed: [{ format: 'woff2', error: new Error('failed') }],
      }),
    }));

    const processor = new SingleDirectoryProcessor(configManager, performanceTracker as any);
    const result = await processor.process();

    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toBe('Font generation failed');
  });
});
