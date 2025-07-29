/**
 * @module DemoBuilder
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2022.03.20
 * @lastModified 2025-01-22
 * @description Advanced demo generation with template engine and builder pattern
 * @summary Creates HTML and CSS demo files to showcase the generated icon fonts
 * @since 2.0.0
 */
import { SVGBuilder } from './SVGBuilder';
/**
 * Advanced demo builder using modern patterns and template engine
 * Generates HTML and CSS files to showcase the icon font
 * @class DemoBuilder
 */
export default class DemoBuilder {
  /** SVG builder instance providing icon data */
  private readonly svgBuilder;
  /** Template renderer for generating HTML/CSS content */
  private readonly templateRenderer;
  /** Content builder for demo HTML/CSS generation */
  private readonly contentBuilder;
  /** File manager for batch file operations */
  private readonly fileManager;
  /**
   * Creates a new DemoBuilder instance
   * @param {SVGBuilder} svgBuilder - SVG builder with icon data
   * @param {string} [rendererName='simple'] - Name of template renderer to use
   */
  constructor(svgBuilder: SVGBuilder, rendererName?: string);
  /**
   * Generate demo files with enhanced error handling and reporting
   * @returns {Promise<boolean>} True if generation was successful, false otherwise
   */
  html(): Promise<boolean>;
  /**
   * Generates demo content from SVG builder data
   * @private
   * @param {number} startTime - Generation start timestamp
   * @returns {Promise<DemoContent>} Generated demo content
   */
  private generateDemoContent;
  /**
   * Prepares file outputs for both unicode and font-class demos
   * @private
   * @param {DemoContent} demoContent - Generated demo content
   */
  private prepareFileOutputs;
  /**
   * Renders a template with variables
   * @private
   * @param {string} template - Template string
   * @param {ReadonlyMap<string, string>} variables - Template variables
   * @returns {string} Rendered template
   */
  private renderTemplate;
  /**
   * Renders base CSS for demo files
   * @private
   * @param {string} fontName - Font name to use in CSS
   * @returns {string} Rendered CSS
   */
  private renderBaseCSS;
  /**
   * Handles results of file write operations
   * @private
   * @param {{ successful: string[]; failed: Array<{ path: string; error: Error }> }} writeResult - Write operation results
   * @param {TemplateMetadata} metadata - Demo generation metadata
   * @returns {boolean} Success flag
   */
  private handleResults;
  /**
   * Cleans up resources after generation
   * @private
   */
  private cleanup;
  /**
   * Get generation statistics
   * @returns {{ templateRenderer: string; pendingTasks: number }} Statistics object
   */
  getStats(): {
    templateRenderer: string;
    pendingTasks: number;
  };
  /**
   * Create a demo builder with custom renderer
   * @static
   * @param {SVGBuilder} svgBuilder - SVG builder with icon data
   * @param {string} rendererName - Name of template renderer to use
   * @returns {DemoBuilder} New demo builder instance
   */
  static withRenderer(svgBuilder: SVGBuilder, rendererName: string): DemoBuilder;
}
//# sourceMappingURL=DemoBuilder.d.ts.map
