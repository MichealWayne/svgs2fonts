/**
 * @module DemoBuilder
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2022.03.20
 * @lastModified 2025-01-22
 * @description Advanced demo generation with template engine and builder pattern
 * @summary Creates HTML and CSS demo files to showcase the generated icon fonts
 * @since 2.0.0
 */

import { extname, join } from 'path';
import { DEMO_CSS, DEMO_HTML, FAIL_FLAG, SUCCESS_FLAG } from '../constant';
import { writeFile } from '../utils/fsUtils';
import { errorLog, isString, log } from '../utils/utils';
import { SVGBuilder } from './SVGBuilder';

/**
 * Content structure for demo files generation
 * @interface DemoContent
 */
interface DemoContent {
  /** HTML content for unicode-based demo */
  readonly codeHtml: string;
  /** HTML content for class-based demo */
  readonly classHtml: string;
  /** CSS content for class-based demo */
  readonly classCss: string;
  /** Metadata about the generated content */
  readonly metadata: TemplateMetadata;
}

/**
 * Metadata for template rendering
 * @interface TemplateMetadata
 */
interface TemplateMetadata {
  /** Number of icons processed */
  readonly iconCount: number;
  /** Time taken to generate content in milliseconds */
  readonly generationTime: number;
  /** Name of the font being demonstrated */
  readonly fontName: string;
}

/**
 * Abstract template engine using strategy pattern
 * @abstract
 * @class TemplateRenderer
 */
abstract class TemplateRenderer {
  /**
   * Renders a template with provided variables
   * @param {string} template - Template string with placeholders
   * @param {ReadonlyMap<string, string>} variables - Map of variable names to values
   * @returns {string} Rendered template with variables replaced
   */
  abstract render(template: string, variables: ReadonlyMap<string, string>): string;

  /**
   * Unique identifier for the renderer
   * @type {string}
   */
  abstract readonly name: string;
}

/**
 * Basic template renderer that replaces {{variable}} placeholders
 * @class SimpleTemplateRenderer
 * @extends {TemplateRenderer}
 */
class SimpleTemplateRenderer extends TemplateRenderer {
  /** @inheritdoc */
  readonly name = 'simple';

  /**
   * @inheritdoc
   */
  render(template: string, variables: ReadonlyMap<string, string>): string {
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
   * Available template renderers
   * @private
   * @static
   * @readonly
   */
  private static readonly renderers = new Map<string, TemplateRenderer>([
    ['simple', new SimpleTemplateRenderer()],
  ]);

  /**
   * Gets a renderer by name
   * @param {string} name - Name of the renderer
   * @returns {TemplateRenderer | undefined} The requested renderer or undefined if not found
   */
  static getRenderer(name: string): TemplateRenderer | undefined {
    return this.renderers.get(name);
  }

  /**
   * Gets the default renderer
   * @returns {TemplateRenderer} The default renderer
   */
  static getDefaultRenderer(): TemplateRenderer {
    return this.renderers.get('simple')!;
  }
}

/**
 * Builder pattern implementation for demo content generation
 * @class DemoContentBuilder
 */
class DemoContentBuilder {
  /** HTML content for unicode-based demo */
  private codeHtml = '';
  /** HTML content for class-based demo */
  private classHtml = '';
  /** CSS content for class-based demo */
  private classCss = '';
  /** Number of icons processed */
  private iconCount = 0;

  /**
   * Resets the builder to initial state
   * @returns {this} Builder instance for chaining
   */
  reset(): this {
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
  addIcon(iconName: string, unicodeStr: string): this {
    if (!isString(unicodeStr)) return this;

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
  build(metadata: Omit<TemplateMetadata, 'iconCount'>): DemoContent {
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
  private createCodeFragment(iconName: string, unicodeStr: string, escapedUnicode: string): string {
    return `<li><p class="m-icon_ctn" title="${iconName}"><em class="u-iconfont">${unicodeStr}</em></p><p>${iconName}： ${escapedUnicode}</p></li>`;
  }

  /**
   * Creates HTML fragment for class-based demo
   * @private
   * @param {string} iconName - Name of the icon
   * @returns {string} HTML fragment
   */
  private createClassFragment(iconName: string): string {
    return `<li><p class="m-icon_ctn" title="${iconName}"><em class="u-iconfont icon-${iconName}"></em></p><p>${iconName}： .icon-${iconName}</p></li>`;
  }

  /**
   * Creates CSS rule for an icon
   * @private
   * @param {string} iconName - Name of the icon
   * @param {string} hexNum - Hexadecimal unicode value
   * @returns {string} CSS rule
   */
  private createCssFragment(iconName: string, hexNum: string): string {
    return `.icon-${iconName}:before { content: "\\${hexNum}"; }`;
  }

  /**
   * Formats CSS output for better readability
   * @private
   * @returns {string} Formatted CSS content
   */
  private formatCssOutput(): string {
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
  /**
   * Collection of pending file output tasks
   * @private
   * @readonly
   */
  private readonly outputTasks: Array<{
    path: string;
    content: string;
    description: string;
  }> = [];

  /**
   * Adds a file to the output queue
   * @param {string} path - File path
   * @param {string} content - File content
   * @param {string} description - Description for logging
   * @returns {this} Manager instance for chaining
   */
  addFile(path: string, content: string, description: string): this {
    this.outputTasks.push({ path, content, description });
    return this;
  }

  /**
   * Writes all queued files in parallel
   * @returns {Promise<{successful: string[], failed: Array<{path: string, error: Error}>}>} Results of write operations
   */
  async writeAll(): Promise<{
    successful: string[];
    failed: Array<{ path: string; error: Error }>;
  }> {
    const results = await Promise.all(
      this.outputTasks.map(async task => {
        try {
          const success = await writeFile(task.path, task.content, true);
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

    const successful: string[] = [];
    const failed: Array<{ path: string; error: Error }> = [];

    results.forEach(result => {
      if (result.success) {
        successful.push(result.path);
      } else {
        failed.push({
          path: result.path,
          error: result.error!,
        });
      }
    });

    return { successful, failed };
  }

  /**
   * Clears all pending tasks
   */
  clear(): void {
    this.outputTasks.length = 0;
  }

  /**
   * Gets the number of pending tasks
   * @returns {number} Task count
   */
  get taskCount(): number {
    return this.outputTasks.length;
  }
}

/**
 * Advanced demo builder using modern patterns and template engine
 * Generates HTML and CSS files to showcase the icon font
 * @class DemoBuilder
 */
export default class DemoBuilder {
  /** SVG builder instance providing icon data */
  private readonly svgBuilder: SVGBuilder;
  /** Template renderer for generating HTML/CSS content */
  private readonly templateRenderer: TemplateRenderer;
  /** Content builder for demo HTML/CSS generation */
  private readonly contentBuilder: DemoContentBuilder;
  /** File manager for batch file operations */
  private readonly fileManager: DemoFileManager;

  /**
   * Creates a new DemoBuilder instance
   * @param {SVGBuilder} svgBuilder - SVG builder with icon data
   * @param {string} [rendererName='simple'] - Name of template renderer to use
   */
  constructor(svgBuilder: SVGBuilder, rendererName = 'simple') {
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
  async html(): Promise<boolean> {
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
      errorLog(`[DemoBuilder] Demo generation failed: ${demoError.message}`);
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
  private async generateDemoContent(startTime: number): Promise<DemoContent> {
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
  private prepareFileOutputs(demoContent: DemoContent): void {
    const { dist, demoUnicodeHTML, demoFontClassHTML, fontName } = this.svgBuilder.buildOptions;

    // Prepare template variables
    const templateVars = new Map<string, string>([
      ['fontName', fontName],
      ['demoCss', this.renderBaseCSS(fontName)],
      ['demoHtml', ''], // Will be replaced per template
      ['demoCssFile', ''], // Will be replaced per template
    ]);

    // Generate Unicode demo files
    const unicodeCssFile = demoUnicodeHTML.replace(extname(demoUnicodeHTML), '.css');
    const unicodeHtml = this.renderTemplate(
      DEMO_HTML,
      new Map([
        ...templateVars,
        ['demoHtml', demoContent.codeHtml],
        ['demoCssFile', unicodeCssFile],
      ])
    );

    this.fileManager
      .addFile(join(dist, demoUnicodeHTML), unicodeHtml, 'Unicode demo HTML')
      .addFile(join(dist, unicodeCssFile), this.renderBaseCSS(fontName), 'Unicode demo CSS');

    // Generate Font class demo files
    const fontClassCssFile = demoFontClassHTML.replace(extname(demoFontClassHTML), '.css');
    const fontClassCss = this.renderBaseCSS(fontName) + demoContent.classCss;
    const fontClassHtml = this.renderTemplate(
      DEMO_HTML,
      new Map([
        ...templateVars,
        ['demoHtml', demoContent.classHtml],
        ['demoCssFile', fontClassCssFile],
      ])
    );

    this.fileManager
      .addFile(join(dist, demoFontClassHTML), fontClassHtml, 'Font class demo HTML')
      .addFile(join(dist, fontClassCssFile), fontClassCss, 'Font class demo CSS');
  }

  /**
   * Renders a template with variables
   * @private
   * @param {string} template - Template string
   * @param {ReadonlyMap<string, string>} variables - Template variables
   * @returns {string} Rendered template
   */
  private renderTemplate(template: string, variables: ReadonlyMap<string, string>): string {
    return this.templateRenderer.render(template, variables);
  }

  /**
   * Renders base CSS for demo files
   * @private
   * @param {string} fontName - Font name to use in CSS
   * @returns {string} Rendered CSS
   */
  private renderBaseCSS(fontName: string): string {
    return this.renderTemplate(DEMO_CSS, new Map([['fontName', fontName]]));
  }

  /**
   * Handles results of file write operations
   * @private
   * @param {{ successful: string[]; failed: Array<{ path: string; error: Error }> }} writeResult - Write operation results
   * @param {TemplateMetadata} metadata - Demo generation metadata
   * @returns {boolean} Success flag
   */
  private handleResults(
    writeResult: { successful: string[]; failed: Array<{ path: string; error: Error }> },
    metadata: TemplateMetadata
  ): boolean {
    const { successful, failed } = writeResult;

    if (failed.length === 0) {
      // All files written successfully
      log(
        `[success][DemoBuilder] All demo files created successfully! Generated ${
          metadata.iconCount
        } icons in ${metadata.generationTime.toFixed(2)}ms`
      );

      if (this.svgBuilder.buildOptions.debug) {
        log(
          `[DemoBuilder] Generated files: ${successful
            .map(path => path.split('/').pop())
            .join(', ')}`
        );
      }

      return SUCCESS_FLAG;
    } else {
      // Some files failed
      const successfulCount = successful.length;
      const failedCount = failed.length;

      errorLog(
        `[DemoBuilder] Demo generation completed with errors: ${successfulCount} successful, ${failedCount} failed`
      );

      // Log specific failures
      failed.forEach(({ path, error }) => {
        errorLog(`[DemoBuilder] Failed to write ${path}: ${error.message}`);
      });

      // Return success only if at least half the files were written
      return successfulCount > failedCount ? SUCCESS_FLAG : FAIL_FLAG;
    }
  }

  /**
   * Cleans up resources after generation
   * @private
   */
  private cleanup(): void {
    this.fileManager.clear();
    this.contentBuilder.reset();
  }

  /**
   * Get generation statistics
   * @returns {{ templateRenderer: string; pendingTasks: number }} Statistics object
   */
  getStats(): { templateRenderer: string; pendingTasks: number } {
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
  static withRenderer(svgBuilder: SVGBuilder, rendererName: string): DemoBuilder {
    return new DemoBuilder(svgBuilder, rendererName);
  }
}
