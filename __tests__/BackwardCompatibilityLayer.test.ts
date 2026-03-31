import {
  BackwardCompatibilityLayer,
  createBackwardCompatibilityLayer,
} from '../src/config/BackwardCompatibilityLayer';

describe('BackwardCompatibilityLayer', () => {
  test('converts legacy debug to verbose', () => {
    const layer = new BackwardCompatibilityLayer();

    const result = layer.convertLegacyOptions({
      src: './icons',
      fontName: 'test-font',
      debug: true,
    });

    expect(result.verbose).toBe(true);
    expect(result).not.toHaveProperty('debug');
  });

  test('passes modern options through unchanged', () => {
    const layer = new BackwardCompatibilityLayer();
    const options = {
      src: './icons',
      fontName: 'test-font',
      batchMode: true,
      inputDirectories: ['./a', './b'],
    };

    expect(layer.convertLegacyOptions(options)).toEqual(options);
  });

  test('logs deprecation warnings only in verbose mode', () => {
    const layer = new BackwardCompatibilityLayer();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    layer.convertLegacyOptions({ debug: true });
    layer.logDeprecationWarnings(false);
    expect(warnSpy).not.toHaveBeenCalled();

    layer.logDeprecationWarnings(true);
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  test('factory creates independent instances', () => {
    const first = createBackwardCompatibilityLayer();
    const second = createBackwardCompatibilityLayer();

    expect(first).toBeInstanceOf(BackwardCompatibilityLayer);
    expect(second).toBeInstanceOf(BackwardCompatibilityLayer);
    expect(first).not.toBe(second);
  });
});
