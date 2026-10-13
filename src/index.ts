import { createBackwardCompatibilityLayer, createConfiguration } from './config';
import { createPerformanceTracker } from './core';
import { BatchModeProcessor, SingleDirectoryProcessor } from './processors';
import { BuildReport } from './types/BuildReport';
import { EnhancedOptions, InitOptionsParams } from './types/OptionType';
import { BuildError, experimentalWarnings, issue } from './core/buildSupport';
import { migrateCodepoints } from './core/CodepointMigration';

export { migrateCodepoints };
export type { MigrationOptions, MigrationReport } from './types/MigrationReport';

export type {
  BuildReport,
  BuildIssue,
  DirectoryReport,
  CodepointChanges,
} from './types/BuildReport';
export type {
  EnhancedOptions,
  InitOptionsParams,
  FontFormat,
  ProgressInfo,
} from './types/OptionType';
export { createConfiguration, createBackwardCompatibilityLayer } from './config';

/** Detailed, serializable results; expected input/build failures are returned in the report. */
export async function generate(
  options: Partial<EnhancedOptions>,
  execution: { checkOnly?: boolean } = {}
): Promise<BuildReport> {
  const start = Date.now();
  const report: BuildReport = {
    schemaVersion: 1,
    status: 'failed',
    success: false,
    mode: execution.checkOnly ? 'check' : 'generate',
    directories: [],
    outputs: [],
    errors: [],
    warnings: [],
    durationMs: 0,
  };
  try {
    if (!options || typeof options !== 'object' || Array.isArray(options))
      throw new BuildError('INVALID_CONFIG', 'Options must be an object');
    const compat = createBackwardCompatibilityLayer();
    const config = createConfiguration(compat.convertLegacyOptions(options));
    const validated = config.getOptions();
    report.warnings.push(...experimentalWarnings(validated));
    if (options && options.debug)
      report.warnings.push({
        code: 'DEPRECATED_OPTION',
        message: 'debug is deprecated; use verbose.',
      });
    if (validated.verbose) console.error(`[svgs2fonts] Configuration:\n${config.getSummary()}`);
    report.directories = validated.batchMode
      ? await new BatchModeProcessor(config).processDetailed(Boolean(execution.checkOnly))
      : [
          await new SingleDirectoryProcessor(
            config,
            validated.performanceAnalysis ? createPerformanceTracker() : undefined
          ).processDetailed(Boolean(execution.checkOnly)),
        ];
    report.outputs = report.directories.flatMap(result => result.outputs);
    report.errors = report.directories.flatMap(result => result.errors);
    report.warnings.push(...report.directories.flatMap(result => result.warnings));
    const successes = report.directories.filter(result => result.status === 'success').length;
    report.status =
      successes === report.directories.length ? 'success' : successes ? 'partial' : 'failed';
    report.success = report.status === 'success';
  } catch (error) {
    report.errors.push(issue(error));
  }
  report.durationMs = Date.now() - start;
  return report;
}

/** Read-only structural diagnostics. This does not guarantee visual fidelity or successful font conversion. */
export async function check(options: Partial<EnhancedOptions>): Promise<BuildReport> {
  return generate(options, { checkOnly: true });
}

/** Legacy contract: partial batch success can resolve true when continueOnError is enabled. */
export async function init(
  options: Partial<InitOptionsParams> | Partial<EnhancedOptions>
): Promise<true | Error> {
  const report = await generate(options);
  report.warnings.forEach(warning =>
    console.warn(`[svgs2fonts] ${warning.code}: ${warning.message}`)
  );
  if ((options as Partial<EnhancedOptions>)?.performanceAnalysis) {
    console.error(`[svgs2fonts] Total time: ${report.durationMs}ms`);
    report.directories.forEach(result => {
      console.error(`  ${result.source}: ${result.durationMs}ms (${result.status})`);
      Object.entries(result.timings || {}).forEach(([phase, ms]) =>
        console.error(`    ${phase}: ${ms}ms`)
      );
    });
  }
  if (report.success) return true;
  if (
    report.status === 'partial' &&
    (options as Partial<EnhancedOptions>)?.batchMode &&
    (options as Partial<EnhancedOptions>).continueOnError !== false
  ) {
    console.warn(
      '[svgs2fonts] Partial batch success:',
      report.errors.map(e => e.message).join('; ')
    );
    return true;
  }
  const error = new BuildError(
    report.errors[0]?.code || 'BUILD_FAILED',
    report.errors.map(e => e.message).join('; ') || 'Build failed',
    report.errors[0]?.file,
    report.errors[0]?.phase
  );
  console.error('[svgs2fonts]', error.message);
  return error;
}

export default {
  init,
  generate,
  check,
  migrateCodepoints,
  createConfiguration,
  createBackwardCompatibilityLayer,
} as const;
