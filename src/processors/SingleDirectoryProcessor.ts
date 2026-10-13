import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import DemoBuilder from '../builders/DemoBuilder';
import FontsBuilder from '../builders/FontsBuilder';
import SVGBuilder from '../builders/SVGBuilder';
import { iconCss } from '../builders/presentation';
import { ConfigurationManager } from '../config';
import { createPerformanceTracker, PerformanceTracker } from '../core';
import { DirectoryReport } from '../types/BuildReport';
import { BuildError, emptyDirectory, inspectInput, issue, progress } from '../core/buildSupport';
import { prepareCodepoints } from '../core/CodepointMap';
import { OutputTransaction } from '../core/OutputTransaction';

export class SingleDirectoryProcessor {
  constructor(
    private configManager: ConfigurationManager,
    private performanceTracker?: PerformanceTracker
  ) {}

  async process(): Promise<true | Error> {
    const report = await this.processDetailed();
    return report.status === 'success'
      ? true
      : new BuildError(
          report.errors[0]?.code || 'BUILD_FAILED',
          report.errors.map(e => e.message).join('; ')
        );
  }

  async processDetailed(checkOnly = false): Promise<DirectoryReport> {
    const started = Date.now();
    const options = this.configManager.getOptions();
    const report = emptyDirectory(options);
    const tracker =
      this.performanceTracker ||
      (options.performanceAnalysis ? createPerformanceTracker() : undefined);
    let transaction: OutputTransaction | undefined;
    let svgBuilder: SVGBuilder | undefined;
    let fontBuilder: FontsBuilder | undefined;
    try {
      const inspected = inspectInput(options);
      report.warnings.push(...inspected.warnings);
      report.iconCount = inspected.files.length;
      report.sourceHashes = inspected.sourceHashes;
      const names = inspected.files.map(file => path.basename(file).replace(/\.svg$/i, ''));
      if (new Set(names).size !== names.length)
        throw new BuildError('ICON_NAME_CONFLICT', 'Input contains duplicate icon names');
      if (!checkOnly) transaction = new OutputTransaction(options.dist, options.fontName);
      const stable = prepareCodepoints(options, names, inspected.sourceHashes);
      if (stable) {
        report.codepoints = Object.fromEntries(names.map(name => [name, stable.codepoints[name]]));
        report.changes = stable.changes;
      }
      if (checkOnly) {
        report.status = 'success';
        return report;
      }
      const stagedOptions = {
        ...options,
        dist: transaction!.stage,
        codepoints: stable?.codepoints,
      };
      svgBuilder = new SVGBuilder(stagedOptions, inspected.files);
      fontBuilder = new FontsBuilder(svgBuilder);
      tracker?.startPhase('SVG Processing');
      progress(options, 'SVG Processing', 0, report.iconCount);
      if (!(await svgBuilder.createSvgsFont()))
        throw (
          svgBuilder.error ||
          new BuildError('SVG_FAILED', 'SVG processing failed', options.src, 'svg')
        );
      progress(options, 'SVG Processing', report.iconCount, report.iconCount);
      tracker?.endPhase('SVG Processing');
      report.codepoints = Object.fromEntries(
        Object.entries(svgBuilder.unicodeMapping).map(([name, entity]) => [
          name,
          Number(entity.replace(/&#|;/g, '')),
        ])
      );
      tracker?.startPhase('Font Generation');
      const formats = options.fontFormats!;
      const nonSvg = formats.filter(format => format !== 'svg');
      progress(options, 'Font Generation', 0, nonSvg.length);
      if (nonSvg.length) {
        const result = await fontBuilder.generateBatch(nonSvg);
        if (result.failed.length) {
          for (const failure of result.failed)
            report.errors.push({
              code: 'FONT_CONVERSION_FAILED',
              message: failure.error?.message || 'Font generation failed',
              format: failure.format,
              directory: options.src,
              phase: 'font',
            });
          throw new BuildError('FONT_CONVERSION_FAILED', 'Font generation failed');
        }
      }
      progress(options, 'Font Generation', nonSvg.length, nonSvg.length);
      tracker?.endPhase('Font Generation');
      const outputs = formats.map(format => `${options.fontName}.${format}`);
      if (!formats.includes('svg'))
        fs.unlinkSync(path.join(transaction!.stage, `${options.fontName}.svg`));
      if (!options.noDemo) {
        tracker?.startPhase('Demo Generation');
        progress(options, 'Demo Generation', 0, 4);
        const demoBuilder = new DemoBuilder(svgBuilder);
        if (!(await demoBuilder.html()))
          throw new BuildError(
            'DEMO_FAILED',
            demoBuilder.error?.message || 'Demo generation failed',
            options.dist,
            'demo'
          );
        outputs.push(
          options.demoUnicodeHTML,
          options.demoFontClassHTML,
          options.demoUnicodeHTML.replace(/\.html$/i, '.css'),
          options.demoFontClassHTML.replace(/\.html$/i, '.css')
        );
        progress(options, 'Demo Generation', 4, 4);
        tracker?.endPhase('Demo Generation');
      }
      if (options.outputCss) {
        const filename = `${options.fontName}.css`;
        fs.writeFileSync(
          path.join(transaction!.stage, filename),
          iconCss(options.fontName, formats, svgBuilder.unicodeMapping)
        );
        outputs.push(filename);
      }
      if (options.outputManifest) outputs.push(`${options.fontName}.json`);
      if (stable?.path) outputs.push(path.basename(stable.path));
      if (options.outputManifest) {
        const filename = `${options.fontName}.json`;
        fs.writeFileSync(
          path.join(transaction!.stage, filename),
          JSON.stringify(
            {
              schemaVersion: 1,
              fontName: options.fontName,
              fontFormats: formats,
              codepoints: report.codepoints,
              sourceHashes: report.sourceHashes,
              outputs,
              changes: report.changes,
            },
            null,
            2
          ) + '\n'
        );
      }
      if (stable?.path) {
        const filename = path.basename(stable.path);
        fs.writeFileSync(
          path.join(transaction!.stage, filename),
          JSON.stringify(
            { schemaVersion: 1, codepoints: stable.codepoints, sourceHashes: stable.sourceHashes },
            null,
            2
          ) + '\n'
        );
      }
      for (const file of inspected.files) {
        const name = path.basename(file).replace(/\.svg$/i, '');
        const currentHash = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
        if (currentHash !== inspected.sourceHashes[name])
          throw new BuildError(
            'INPUT_CHANGED',
            `Input changed during conversion; rerun the build: ${file}`,
            file,
            'commit'
          );
      }
      report.outputs = transaction!.commit(outputs);
      report.status = 'success';
    } catch (error) {
      if (!report.errors.length) report.errors.push(issue(error, options.src));
    } finally {
      fontBuilder?.cleanup();
      svgBuilder?.clearCache();
      try {
        transaction?.cleanup();
      } catch (e) {
        report.warnings.push({
          code: 'TEMP_CLEANUP_FAILED',
          message: `Temporary files retained at ${transaction?.stage}: ${(e as Error).message}`,
        });
      }
      report.durationMs = Date.now() - started;
      if (tracker)
        report.timings = Object.fromEntries(
          Object.entries(tracker.phases).map(([name, phase]) => [
            name,
            phase.duration ?? Date.now() - phase.start,
          ])
        );
    }
    return report;
  }
}
