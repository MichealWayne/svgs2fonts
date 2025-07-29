'use strict';
/**
 * @module DemoBuilder
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2022.03.20
 * @lastModified 2025-01-22
 * @description Advanced demo generation with template engine and builder pattern
 * @summary Creates HTML and CSS demo files to showcase the generated icon fonts
 * @since 2.0.0
 */
Object.defineProperty(exports, '__esModule', { value: true });
const path_1 = require('path');
const constant_1 = require('../constant');
const fsUtils_1 = require('../utils/fsUtils');
const utils_1 = require('../utils/utils');
/**
 * Abstract template engine using strategy pattern
 * @abstract
 * @class TemplateRenderer
 */
class TemplateRenderer {}
/**
 * Basic template renderer that replaces {{variable}} placeholders
 * @class SimpleTemplateRenderer
 * @extends {TemplateRenderer}
 */
class SimpleTemplateRenderer extends TemplateRenderer {
  constructor() {
    super(...arguments);
    /** @inheritdoc */
    this.name = 'simple';
  }
  /**
   * @inheritdoc
   */
  render(template, variables) {
    let result = template;
    variables.forEach((value, key) => {
      const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(pattern, value);
    });
    return result;
  }
}
/**
 * Registry for template rendering strategies
 * @class TemplateRegistry
 */
class TemplateRegistry {
  /**
   * Gets a renderer by name
   * @param {string} name - Name of the renderer
   * @returns {TemplateRenderer | undefined} The requested renderer or undefined if not found
   */
  static getRenderer(name) {
    return this.renderers.get(name);
  }
  /**
   * Gets the default renderer
   * @returns {TemplateRenderer} The default renderer
   */
  static getDefaultRenderer() {
    return this.renderers.get('simple');
  }
}
/**
 * Available template renderers
 * @private
 * @static
 * @readonly
 */
TemplateRegistry.renderers = new Map([['simple', new SimpleTemplateRenderer()]]);
/**
 * Builder pattern implementation for demo content generation
 * @class DemoContentBuilder
 */
class DemoContentBuilder {
  constructor() {
    /** HTML content for unicode-based demo */
    this.codeHtml = '';
    /** HTML content for class-based demo */
    this.classHtml = '';
    /** CSS content for class-based demo */
    this.classCss = '';
    /** Number of icons processed */
    this.iconCount = 0;
  }
  /**
   * Resets the builder to initial state
   * @returns {this} Builder instance for chaining
   */
  reset() {
    this.codeHtml = '';
    this.classHtml = '';
    this.classCss = '';
    this.iconCount = 0;
    return this;
  }
  /**
   * Adds an icon to the demo content
   * @param {string} iconName - Name of the icon
   * @param {string} unicodeStr - Unicode string for the icon
   * @returns {this} Builder instance for chaining
   */
  addIcon(iconName, unicodeStr) {
    if (!(0, utils_1.isString)(unicodeStr)) return this;
    const hexNum = Number(unicodeStr.replace(/&#|;/g, '')).toString(16);
    const escapedUnicode = unicodeStr.replace('&', '&amp;');
    // Build code HTML fragment
    this.codeHtml += this.createCodeFragment(iconName, unicodeStr, escapedUnicode);
    // Build class HTML fragment
    this.classHtml += this.createClassFragment(iconName);
    // Build CSS fragment
    this.classCss += this.createCssFragment(iconName, hexNum);
    this.iconCount++;
    return this;
  }
  /**
   * Builds the final demo content
   * @param {Omit<TemplateMetadata, 'iconCount'>} metadata - Metadata without icon count
   * @returns {DemoContent} Complete demo content
   */
  build(metadata) {
    return {
      codeHtml: this.codeHtml,
      classHtml: this.classHtml,
      classCss: this.formatCssOutput(),
      metadata: {
        ...metadata,
        iconCount: this.iconCount,
      },
    };
  }
  /**
   * Creates HTML fragment for unicode-based demo
   * @private
   * @param {string} iconName - Name of the icon
   * @param {string} unicodeStr - Unicode string for the icon
   * @param {string} escapedUnicode - Escaped unicode for display
   * @returns {string} HTML fragment
   */
  createCodeFragment(iconName, unicodeStr, escapedUnicode) {
    return `<li><p class="m-icon_ctn" title="${iconName}"><em class="u-iconfont">${unicodeStr}</em></p><p>${iconName}： ${escapedUnicode}</p></li>`;
  }
  /**
   * Creates HTML fragment for class-based demo
   * @private
   * @param {string} iconName - Name of the icon
   * @returns {string} HTML fragment
   */
  createClassFragment(iconName) {
    return `<li><p class="m-icon_ctn" title="${iconName}"><em class="u-iconfont icon-${iconName}"></em></p><p>${iconName}： .icon-${iconName}</p></li>`;
  }
  /**
   * Creates CSS rule for an icon
   * @private
   * @param {string} iconName - Name of the icon
   * @param {string} hexNum - Hexadecimal unicode value
   * @returns {string} CSS rule
   */
  createCssFragment(iconName, hexNum) {
    return `.icon-${iconName}:before { content: "\\${hexNum}"; }`;
  }
  /**
   * Formats CSS output for better readability
   * @private
   * @returns {string} Formatted CSS content
   */
  formatCssOutput() {
    return this.classCss
      ? '\r\n' +
          this.classCss
            .split('.')
            .filter(Boolean)
            .map(rule => `.${rule}`)
            .join('\r\n')
      : '';
  }
}
/**
 * File output manager with batch operations support
 * @class DemoFileManager
 */
class DemoFileManager {
  constructor() {
    /**
     * Collection of pending file output tasks
     * @private
     * @readonly
     */
    this.outputTasks = [];
  }
  /**
   * Adds a file to the output queue
   * @param {string} path - File path
   * @param {string} content - File content
   * @param {string} description - Description for logging
   * @returns {this} Manager instance for chaining
   */
  addFile(path, content, description) {
    this.outputTasks.push({ path, content, description });
    return this;
  }
  /**
   * Writes all queued files in parallel
   * @returns {Promise<{successful: string[], failed: Array<{path: string, error: Error}>}>} Results of write operations
   */
  async writeAll() {
    const results = await Promise.all(
      this.outputTasks.map(async task => {
        try {
          const success = await (0, fsUtils_1.writeFile)(task.path, task.content, true);
          if (!success) {
            throw new Error(`Failed to write ${task.description}`);
          }
          return { success: true, path: task.path };
        } catch (error) {
          return {
            success: false,
            path: task.path,
            error: error instanceof Error ? error : new Error(String(error)),
          };
        }
      })
    );
    const successful = [];
    const failed = [];
    results.forEach(result => {
      if (result.success) {
        successful.push(result.path);
      } else {
        failed.push({
          path: result.path,
          error: result.error,
        });
      }
    });
    return { successful, failed };
  }
  /**
   * Clears all pending tasks
   */
  clear() {
    this.outputTasks.length = 0;
  }
  /**
   * Gets the number of pending tasks
   * @returns {number} Task count
   */
  get taskCount() {
    return this.outputTasks.length;
  }
}
/**
 * Advanced demo builder using modern patterns and template engine
 * Generates HTML and CSS files to showcase the icon font
 * @class DemoBuilder
 */
class DemoBuilder {
  /**
   * Creates a new DemoBuilder instance
   * @param {SVGBuilder} svgBuilder - SVG builder with icon data
   * @param {string} [rendererName='simple'] - Name of template renderer to use
   */
  constructor(svgBuilder, rendererName = 'simple') {
    this.svgBuilder = svgBuilder;
    this.templateRenderer =
      TemplateRegistry.getRenderer(rendererName) ?? TemplateRegistry.getDefaultRenderer();
    this.contentBuilder = new DemoContentBuilder();
    this.fileManager = new DemoFileManager();
  }
  /**
   * Generate demo files with enhanced error handling and reporting
   * @returns {Promise<boolean>} True if generation was successful, false otherwise
   */
  async html() {
    const startTime = performance.now();
    try {
      // Generate demo content
      const demoContent = await this.generateDemoContent(startTime);
      // Prepare file outputs
      this.prepareFileOutputs(demoContent);
      // Write all files
      const writeResult = await this.fileManager.writeAll();
      // Handle results
      return this.handleResults(writeResult, demoContent.metadata);
    } catch (error) {
      const demoError = error instanceof Error ? error : new Error(String(error));
      (0, utils_1.errorLog)(`[DemoBuilder] Demo generation failed: ${demoError.message}`);
      return false;
    } finally {
      this.cleanup();
    }
  }
  /**
   * Generates demo content from SVG builder data
   * @private
   * @param {number} startTime - Generation start timestamp
   * @returns {Promise<DemoContent>} Generated demo content
   */
  async generateDemoContent(startTime) {
    const unicodeMap = this.svgBuilder.unicodeMapping;
    const { fontName } = this.svgBuilder.buildOptions;
    // Reset builder for fresh generation
    this.contentBuilder.reset();
    // Process each icon
    Object.entries(unicodeMap).forEach(([iconName, unicodeStr]) => {
      this.contentBuilder.addIcon(iconName, unicodeStr);
    });
    // Build final content
    return this.contentBuilder.build({
      fontName,
      generationTime: performance.now() - startTime,
    });
  }
  /**
   * Prepares file outputs for both unicode and font-class demos
   * @private
   * @param {DemoContent} demoContent - Generated demo content
   */
  prepareFileOutputs(demoContent) {
    const { dist, demoUnicodeHTML, demoFontClassHTML, fontName } = this.svgBuilder.buildOptions;
    // Prepare template variables
    const templateVars = new Map([
      ['fontName', fontName],
      ['demoCss', this.renderBaseCSS(fontName)],
      ['demoHtml', ''],
      ['demoCssFile', ''], // Will be replaced per template
    ]);
    // Generate Unicode demo files
    const unicodeCssFile = demoUnicodeHTML.replace((0, path_1.extname)(demoUnicodeHTML), '.css');
    const unicodeHtml = this.renderTemplate(
      constant_1.DEMO_HTML,
      new Map([
        ...templateVars,
        ['demoHtml', demoContent.codeHtml],
        ['demoCssFile', unicodeCssFile],
      ])
    );
    this.fileManager
      .addFile((0, path_1.join)(dist, demoUnicodeHTML), unicodeHtml, 'Unicode demo HTML')
      .addFile(
        (0, path_1.join)(dist, unicodeCssFile),
        this.renderBaseCSS(fontName),
        'Unicode demo CSS'
      );
    // Generate Font class demo files
    const fontClassCssFile = demoFontClassHTML.replace(
      (0, path_1.extname)(demoFontClassHTML),
      '.css'
    );
    const fontClassCss = this.renderBaseCSS(fontName) + demoContent.classCss;
    const fontClassHtml = this.renderTemplate(
      constant_1.DEMO_HTML,
      new Map([
        ...templateVars,
        ['demoHtml', demoContent.classHtml],
        ['demoCssFile', fontClassCssFile],
      ])
    );
    this.fileManager
      .addFile((0, path_1.join)(dist, demoFontClassHTML), fontClassHtml, 'Font class demo HTML')
      .addFile((0, path_1.join)(dist, fontClassCssFile), fontClassCss, 'Font class demo CSS');
  }
  /**
   * Renders a template with variables
   * @private
   * @param {string} template - Template string
   * @param {ReadonlyMap<string, string>} variables - Template variables
   * @returns {string} Rendered template
   */
  renderTemplate(template, variables) {
    return this.templateRenderer.render(template, variables);
  }
  /**
   * Renders base CSS for demo files
   * @private
   * @param {string} fontName - Font name to use in CSS
   * @returns {string} Rendered CSS
   */
  renderBaseCSS(fontName) {
    return this.renderTemplate(constant_1.DEMO_CSS, new Map([['fontName', fontName]]));
  }
  /**
   * Handles results of file write operations
   * @private
   * @param {{ successful: string[]; failed: Array<{ path: string; error: Error }> }} writeResult - Write operation results
   * @param {TemplateMetadata} metadata - Demo generation metadata
   * @returns {boolean} Success flag
   */
  handleResults(writeResult, metadata) {
    const { successful, failed } = writeResult;
    if (failed.length === 0) {
      // All files written successfully
      (0, utils_1.log)(
        `[success][DemoBuilder] All demo files created successfully! Generated ${metadata.iconCount} icons in ${metadata.generationTime.toFixed(2)}ms`
      );
      if (this.svgBuilder.buildOptions.debug) {
        (0, utils_1.log)(
          `[DemoBuilder] Generated files: ${successful
            .map(path => path.split('/').pop())
            .join(', ')}`
        );
      }
      return constant_1.SUCCESS_FLAG;
    } else {
      // Some files failed
      const successfulCount = successful.length;
      const failedCount = failed.length;
      (0, utils_1.errorLog)(
        `[DemoBuilder] Demo generation completed with errors: ${successfulCount} successful, ${failedCount} failed`
      );
      // Log specific failures
      failed.forEach(({ path, error }) => {
        (0, utils_1.errorLog)(`[DemoBuilder] Failed to write ${path}: ${error.message}`);
      });
      // Return success only if at least half the files were written
      return successfulCount > failedCount ? constant_1.SUCCESS_FLAG : constant_1.FAIL_FLAG;
    }
  }
  /**
   * Cleans up resources after generation
   * @private
   */
  cleanup() {
    this.fileManager.clear();
    this.contentBuilder.reset();
  }
  /**
   * Get generation statistics
   * @returns {{ templateRenderer: string; pendingTasks: number }} Statistics object
   */
  getStats() {
    return {
      templateRenderer: this.templateRenderer.name,
      pendingTasks: this.fileManager.taskCount,
    };
  }
  /**
   * Create a demo builder with custom renderer
   * @static
   * @param {SVGBuilder} svgBuilder - SVG builder with icon data
   * @param {string} rendererName - Name of template renderer to use
   * @returns {DemoBuilder} New demo builder instance
   */
  static withRenderer(svgBuilder, rendererName) {
    return new DemoBuilder(svgBuilder, rendererName);
  }
}
exports.default = DemoBuilder;
//# sourceMappingURL=DemoBuilder.js.map
