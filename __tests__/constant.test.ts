/**
 * @module constant.test
 * @author Wayne<michealwayne@163.com>
 * @Date 2025-07-27
 * @description Tests for constants module
 */

import { DEMO_CSS, DEMO_HTML, FAIL_FLAG, IS_DEV, SUCCESS_FLAG } from '../src/constant';

describe('Constants', () => {
  describe('Environment flags', () => {
    it('should define IS_DEV based on NODE_ENV', () => {
      expect(typeof IS_DEV).toBe('boolean');
    });

    it('should define success and fail flags', () => {
      expect(SUCCESS_FLAG).toBe(true);
      expect(FAIL_FLAG).toBe(false);
    });
  });

  describe('Demo templates', () => {
    it('should define DEMO_CSS template', () => {
      expect(typeof DEMO_CSS).toBe('string');
      expect(DEMO_CSS).toContain('{{fontName}}');
      expect(DEMO_CSS).toContain('@font-face');
      expect(DEMO_CSS).toContain('font-family');
    });

    it('should define DEMO_HTML template', () => {
      expect(typeof DEMO_HTML).toBe('string');
      expect(DEMO_HTML).toContain('<!DOCTYPE html>');
      expect(DEMO_HTML).toContain('{{fontName}}');
      expect(DEMO_HTML).toContain('{{demoCssFile}}');
      expect(DEMO_HTML).toContain('{{demoCss}}');
      expect(DEMO_HTML).toContain('{{demoHtml}}');
    });

    it('should have valid HTML structure in DEMO_HTML', () => {
      expect(DEMO_HTML).toContain('<html>');
      expect(DEMO_HTML).toContain('</html>');
      expect(DEMO_HTML).toContain('<head>');
      expect(DEMO_HTML).toContain('</head>');
      expect(DEMO_HTML).toContain('<body>');
      expect(DEMO_HTML).toContain('</body>');
    });

    it('should include CSS animations in DEMO_HTML', () => {
      expect(DEMO_HTML).toContain('@keyframes colors');
      expect(DEMO_HTML).toContain('@-webkit-keyframes colors');
      expect(DEMO_HTML).toContain('animation: colors');
    });

    it('should include responsive meta tags', () => {
      expect(DEMO_HTML).toContain('viewport');
      expect(DEMO_HTML).toContain('format-detection');
      expect(DEMO_HTML).toContain('apple-touch-fullscreen');
    });
  });

  describe('Template placeholders', () => {
    it('should contain all required placeholders in DEMO_CSS', () => {
      const placeholders = ['{{fontName}}'];
      placeholders.forEach(placeholder => {
        expect(DEMO_CSS).toContain(placeholder);
      });
    });

    it('should contain all required placeholders in DEMO_HTML', () => {
      const placeholders = ['{{demoCssFile}}', '{{fontName}}', '{{demoCss}}', '{{demoHtml}}'];
      placeholders.forEach(placeholder => {
        expect(DEMO_HTML).toContain(placeholder);
      });
    });
  });

  describe('Font format support', () => {
    it('should include all major font formats in DEMO_CSS', () => {
      const formats = ['eot', 'woff2', 'woff', 'ttf', 'svg'];
      formats.forEach(format => {
        expect(DEMO_CSS).toContain(format);
      });
    });

    it('should include format-specific CSS rules', () => {
      expect(DEMO_CSS).toContain("format('woff2')");
      expect(DEMO_CSS).toContain("format('woff')");
      expect(DEMO_CSS).toContain("format('embedded-opentype')");
      expect(DEMO_CSS).toContain("format('truetype')");
      expect(DEMO_CSS).toContain("format('svg')");
    });
  });
});
