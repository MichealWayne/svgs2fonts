import fs from 'fs';
import path from 'path';
import { ValidatedOptions } from '../config/ConfigurationManager';
import { CodepointChanges } from '../types/BuildReport';
import { BuildError } from './buildSupport';

export interface StableCodepoints {
  path?: string;
  codepoints: Record<string, number>;
  changes: CodepointChanges;
  sourceHashes?: Record<string, string>;
}

export function prepareCodepoints(
  options: ValidatedOptions,
  names: string[],
  sourceHashes?: Record<string, string>
): StableCodepoints | undefined {
  if (!options.codepointMap && !options.codepoints) return undefined;
  const mapPath = options.codepointMap
    ? path.resolve(options.dist, options.codepointMap)
    : undefined;
  let previous: Record<string, number> = {};
  let previousHashes: Record<string, string> | undefined;
  if (mapPath && fs.existsSync(mapPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
      if (
        data.schemaVersion !== 1 ||
        !data.codepoints ||
        typeof data.codepoints !== 'object' ||
        Array.isArray(data.codepoints)
      )
        throw new Error('Expected schemaVersion: 1 and a codepoints object');
      previous = data.codepoints;
      if (data.sourceHashes !== undefined) {
        if (
          !data.sourceHashes ||
          typeof data.sourceHashes !== 'object' ||
          Array.isArray(data.sourceHashes)
        )
          throw new Error('sourceHashes must be an object');
        for (const [name, hash] of Object.entries(data.sourceHashes)) {
          if (
            !Object.prototype.hasOwnProperty.call(previous, name) ||
            typeof hash !== 'string' ||
            !/^[a-f0-9]{64}$/.test(hash)
          )
            throw new Error(`Invalid source hash for ${name}`);
        }
        previousHashes = data.sourceHashes;
      }
    } catch (e) {
      throw new BuildError(
        'INVALID_CODEPOINT_MAP',
        `Invalid codepoint map ${mapPath}: ${(e as Error).message}`,
        mapPath,
        'check'
      );
    }
  }
  const codes: Record<string, number> = Object.assign(Object.create(null), previous);
  for (const [name, code] of Object.entries(options.codepoints || {})) {
    if (Object.prototype.hasOwnProperty.call(previous, name) && previous[name] !== code) {
      throw new BuildError(
        'CODEPOINT_CONFLICT',
        `Seed codepoint changes existing mapping for ${name}`,
        mapPath,
        'check'
      );
    }
    codes[name] = code;
  }
  const used = new Set<number>();
  for (const [name, code] of Object.entries(codes)) {
    if (
      !name ||
      !Number.isInteger(code) ||
      code < 0 ||
      code > 65535 ||
      (code >= 0xd800 && code <= 0xdfff) ||
      used.has(code)
    ) {
      throw new BuildError(
        'CODEPOINT_CONFLICT',
        `Invalid or duplicate codepoint for ${name}`,
        mapPath,
        'check'
      );
    }
    used.add(code);
  }
  let next = options.unicodeStart;
  for (const name of [...names].sort()) {
    if (Object.prototype.hasOwnProperty.call(codes, name)) continue;
    while (used.has(next) || (next >= 0xd800 && next <= 0xdfff)) next++;
    if (next > 59999)
      throw new BuildError(
        'CODEPOINT_RANGE_EXHAUSTED',
        'No available codepoints in configured range',
        mapPath,
        'check'
      );
    codes[name] = next;
    used.add(next++);
  }
  return {
    path: mapPath,
    codepoints: codes,
    sourceHashes,
    changes: {
      added: names.filter(
        name => !Object.prototype.hasOwnProperty.call(previousHashes || previous, name)
      ),
      removed: Object.keys(previousHashes || previous).filter(name => !names.includes(name)),
      changed:
        previousHashes && sourceHashes
          ? names.filter(
              name =>
                Object.prototype.hasOwnProperty.call(previousHashes, name) &&
                previousHashes![name] !== sourceHashes[name]
            )
          : [],
      contentCompared: Boolean(previousHashes && sourceHashes),
    },
  };
}
