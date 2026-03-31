import { execFileSync, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const cliPath = path.resolve(__dirname, '../bin/index.js');
const fixtureSvg = path.resolve(__dirname, '../examples/svg/24.svg');

function createTempSvgDir(prefix: string): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  fs.copyFileSync(fixtureSvg, path.join(directory, 'sample.svg'));
  return directory;
}

function runCLI(args: string[]) {
  return spawnSync('node', [cliPath, ...args], {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8',
  });
}

describe('CLI', () => {
  beforeAll(() => {
    execFileSync('npm', ['run', 'build'], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'pipe',
    });
  });

  test('prints version with explicit flag', () => {
    const result = runCLI(['--version']);

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toMatch(/^v\d+\.\d+\.\d+$/);
  });

  test('prints help with explicit help flag', () => {
    const result = runCLI(['--help']);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('usage: svgs2fonts [src] [dist] [options]');
    expect(result.stdout).toContain('Experimental options:');
  });

  test('fails on unknown flags with a non-zero exit code', () => {
    const result = runCLI(['--wat']);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('Unknown option(s): --wat');
  });

  test('fails with a short recovery message when src is missing', () => {
    const result = runCLI(['--name=test-font']);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('Single-directory mode requires [src].');
    expect(result.stderr).toContain('svgs2fonts ./icons ./dist');
  });

  test('parses comma-separated batch input without placeholder src', () => {
    const inputA = createTempSvgDir('svgs2fonts-batch-a-');
    const inputB = createTempSvgDir('svgs2fonts-batch-b-');
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-batch-out-'));

    const result = runCLI([
      '--batch',
      `--input=${inputA},${inputB}`,
      outputDir,
      '--name=batch-font',
      '--nodemo',
      '--no-progress',
    ]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Font: batch-font');
    expect(result.stdout).not.toContain('Batch Processing:');
    expect(fs.existsSync(path.join(outputDir, path.basename(inputA), 'batch-font.svg'))).toBe(true);
    expect(fs.existsSync(path.join(outputDir, path.basename(inputB), 'batch-font.svg'))).toBe(true);
  });

  test('only keeps requested output formats in single-directory mode', () => {
    const inputDir = createTempSvgDir('svgs2fonts-formats-in-');
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-formats-out-'));

    const result = runCLI([
      inputDir,
      outputDir,
      '--name=formats-only',
      '--formats=woff2,woff',
      '--nodemo',
      '--no-progress',
    ]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Formats: woff2, woff');
    expect(fs.existsSync(path.join(outputDir, 'formats-only.woff'))).toBe(true);
    expect(fs.existsSync(path.join(outputDir, 'formats-only.woff2'))).toBe(true);
    expect(fs.existsSync(path.join(outputDir, 'formats-only.svg'))).toBe(false);
    expect(fs.existsSync(path.join(outputDir, 'formats-only.ttf'))).toBe(false);
    expect(fs.existsSync(path.join(outputDir, 'formats-only.eot'))).toBe(false);
  });

  test('supports batch output templates and preserved directory structure', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-cli-root-'));
    const nestedGroup = path.join(rootDir, 'group');
    fs.mkdirSync(nestedGroup, { recursive: true });

    const inputA = path.join(rootDir, 'alpha');
    const inputB = path.join(nestedGroup, 'beta');
    fs.mkdirSync(inputA, { recursive: true });
    fs.mkdirSync(inputB, { recursive: true });
    fs.copyFileSync(fixtureSvg, path.join(inputA, 'sample.svg'));
    fs.copyFileSync(fixtureSvg, path.join(inputB, 'sample.svg'));

    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-cli-pattern-out-'));
    const result = runCLI([
      '--batch',
      `--input=${inputA},${inputB}`,
      outputDir,
      '--name=templated-font',
      '--output-pattern=fonts/[name]-[fontname]',
      '--preserve-structure',
      '--nodemo',
      '--no-progress',
    ]);

    expect(result.status).toBe(0);
    expect(
      fs.existsSync(
        path.join(outputDir, 'alpha', 'fonts', 'alpha-templated-font', 'templated-font.svg')
      )
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(
          outputDir,
          'group',
          'beta',
          'fonts',
          'beta-templated-font',
          'templated-font.svg'
        )
      )
    ).toBe(true);
  });
});
