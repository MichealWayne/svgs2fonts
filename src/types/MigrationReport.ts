import { BuildIssue } from './BuildReport';

export interface MigrationOptions {
  /** A deployed JSON map/manifest or SVG font; never regenerated to guess old codes. */
  from: string;
  format?: 'auto' | 'json' | 'svg';
  /** Optional current SVG directory, compared by filename only. */
  src?: string;
  /** Omit for a read-only preview. Existing files are never replaced. */
  output?: string;
}

export interface MigrationReport {
  schemaVersion: 1;
  mode: 'migrate';
  status: 'success' | 'failed';
  success: boolean;
  from?: string;
  format?: 'json' | 'svg';
  codepoints: Record<string, number>;
  iconCount: number;
  outputs: string[];
  comparison?: { source: string; matched: string[]; missing: string[]; unmapped: string[] };
  errors: BuildIssue[];
  warnings: BuildIssue[];
  durationMs: number;
}
