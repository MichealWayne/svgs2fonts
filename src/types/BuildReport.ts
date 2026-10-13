export interface BuildIssue {
  code: string;
  message: string;
  file?: string;
  directory?: string;
  phase?: string;
  format?: string;
}

export interface CodepointChanges {
  added: string[];
  removed: string[];
  changed: string[];
  /** False when an older mapping has no SVG content baseline. */
  contentCompared?: boolean;
}

export interface DirectoryReport {
  source: string;
  output: string;
  status: 'success' | 'failed' | 'skipped';
  outputs: string[];
  iconCount: number;
  codepoints: Record<string, number>;
  /** SHA-256 of each current input SVG's original bytes. */
  sourceHashes?: Record<string, string>;
  errors: BuildIssue[];
  warnings: BuildIssue[];
  durationMs: number;
  changes?: CodepointChanges;
  timings?: Record<string, number>;
}

export interface BuildReport {
  schemaVersion: 1;
  status: 'success' | 'partial' | 'failed';
  success: boolean;
  mode: 'generate' | 'check';
  directories: DirectoryReport[];
  outputs: string[];
  errors: BuildIssue[];
  warnings: BuildIssue[];
  durationMs: number;
}
