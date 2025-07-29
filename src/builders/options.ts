/**
 * @module configFile
 * @author Micheal Wayne<michealwayne@163.com>
 * @Date 2022-03-22 14:53:16
 * @LastEditTime 2025-07-27 13:26:53
 */

import { InitOptionsParams } from '../types/OptionType';

/**
 * Default configuration options for SVG to font conversion
 * @constant {InitOptionsParams} DEFAULT_OPTIONS
 * @description Provides sensible default values for all required initialization parameters.
 * These defaults ensure the tool can run with minimal configuration while following
 * web font best practices and common naming conventions.
 * @since 1.0.0
 */
const DEFAULT_OPTIONS: InitOptionsParams = {
  /**
   * Enable debug mode for detailed logging
   * @type {boolean}
   * @description When false, only essential messages are logged. Set to true to enable
   * comprehensive debug logging including file processing details, timing information,
   * and internal operation status for troubleshooting and development.
   * @default false
   * @since 1.0.0
   */
  debug: false,

  /**
   * Skip generation of demo HTML files
   * @type {boolean}
   * @description When false, generates HTML demo files showcasing the font icons.
   * Set to true to skip demo file creation for production builds where demos
   * are not needed, reducing build time and output file count.
   * @default false
   * @since 1.0.0
   */
  noDemo: false,

  /**
   * Font family name for the generated font
   * @type {string}
   * @description The name used as font-family in CSS and embedded in font files.
   * Should contain only alphanumeric characters, hyphens, and underscores for
   * maximum compatibility across browsers and systems.
   * @default 'iconfont'
   * @example 'my-icons', 'project-icons', 'ui-symbols'
   * @since 1.0.0
   */
  fontName: 'iconfont',

  /**
   * Starting Unicode code point for automatic icon mapping
   * @type {number}
   * @description Starting Unicode value for sequential icon assignment. Uses decimal
   * notation (10000 = 0x2710). Recommended to use Private Use Area (57344-63743)
   * to avoid conflicts with standard Unicode characters.
   * @default 10000
   * @minimum 0
   * @maximum 1114111
   * @example 57344 // 0xE000 - Private Use Area start
   * @since 1.0.0
   */
  unicodeStart: 10000,

  /**
   * Source directory containing SVG files
   * @type {string}
   * @description Path to directory containing SVG icon files to be converted.
   * Can be absolute or relative to the current working directory. All .svg files
   * in this directory will be processed and converted to font glyphs.
   * @default ''
   * @example './icons', 'src/assets/icons', '/absolute/path/to/icons'
   * @since 1.0.0
   */
  src: '',

  /**
   * Output directory for generated font files
   * @type {string}
   * @description Path where generated font files and demo files will be written.
   * Can be absolute or relative to the current working directory. Directory
   * will be created automatically if it doesn't exist.
   * @default 'dist'
   * @example './fonts', 'build/assets/fonts', 'public/fonts'
   * @since 1.0.0
   */
  dist: 'dist',

  /**
   * Filename for Unicode-based demo HTML file
   * @type {string}
   * @description Name of the HTML file demonstrating icons using Unicode character
   * codes (&#10001; format). Generated in the output directory along with
   * corresponding CSS file for styling.
   * @default 'demo_unicode.html'
   * @example 'unicode-demo.html', 'icons-unicode.html'
   * @since 1.0.0
   */
  demoUnicodeHTML: 'demo_unicode.html',

  /**
   * Filename for CSS class-based demo HTML file
   * @type {string}
   * @description Name of the HTML file demonstrating icons using CSS class names
   * (.icon-name format). Generated in the output directory along with
   * corresponding CSS file containing class definitions.
   * @default 'demo_fontclass.html'
   * @example 'class-demo.html', 'icons-classes.html'
   * @since 1.0.0
   */
  demoFontClassHTML: 'demo_fontclass.html',
};

export default DEFAULT_OPTIONS;
