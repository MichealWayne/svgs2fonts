const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const project = path.resolve(__dirname, '..');
const packageRoot = process.argv[2] ? path.resolve(process.argv[2]) : project;
const fonts = require(process.argv[2] ? packageRoot : path.join(project, 'dist'));

(async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'svgs2fonts-runtime-'));
  try {
    const source = path.join(root, 'icons');
    fs.mkdirSync(source);
    fs.copyFileSync(path.join(project, 'examples/svg/24.svg'), path.join(source, 'home.svg'));
    const report = await fonts.generate({
      src: source,
      dist: path.join(root, 'out'),
      outputCss: true,
      outputManifest: true,
      codepointMap: 'codepoints.json',
    });
    assert.strictEqual(report.success, true, JSON.stringify(report.errors));
    assert.strictEqual(report.outputs.length, 12);
    for (const output of report.outputs) assert(fs.statSync(output).size > 0);
    const mapPath = path.join(root, 'out', 'codepoints.json');
    const baseline = fs.readFileSync(mapPath, 'utf8');
    fs.appendFileSync(path.join(source, 'home.svg'), '\n');
    const changed = await fonts.check({
      src: source,
      dist: path.join(root, 'out'),
      codepointMap: 'codepoints.json',
    });
    assert.strictEqual(changed.success, true);
    assert.strictEqual(changed.directories[0].changes.contentCompared, true);
    assert.deepStrictEqual(changed.directories[0].changes.changed, ['home']);
    assert.strictEqual(fs.readFileSync(mapPath, 'utf8'), baseline);
    const checked = await fonts.check({ src: source, dist: path.join(root, 'check-out') });
    assert.strictEqual(checked.success, true);
    assert.strictEqual(fs.existsSync(path.join(root, 'check-out')), false);
    const cli = spawnSync(
      process.execPath,
      [
        path.join(packageRoot, 'bin/index.js'),
        source,
        path.join(root, 'cli'),
        '--json',
        '--nodemo',
        '--formats=woff2',
      ],
      { encoding: 'utf8' }
    );
    assert.strictEqual(cli.status, 0, cli.stderr);
    assert.strictEqual(JSON.parse(cli.stdout).status, 'success');
    const deployedFont = path.join(root, 'out', 'iconfont.svg');
    const preview = await fonts.migrateCodepoints({ from: deployedFont, src: source });
    assert.strictEqual(preview.success, true, JSON.stringify(preview.errors));
    assert.deepStrictEqual(preview.codepoints, report.directories[0].codepoints);
    assert.deepStrictEqual(preview.outputs, []);
    const migrated = path.join(root, 'migration');
    fs.mkdirSync(migrated);
    const map = path.join(migrated, 'codepoints.json');
    const written = await fonts.migrateCodepoints({ from: deployedFont, output: map });
    assert.strictEqual(written.success, true, JSON.stringify(written.errors));
    const preserved = fs.readFileSync(map, 'utf8');
    const repeat = await fonts.migrateCodepoints({ from: deployedFont, output: map });
    assert.strictEqual(repeat.success, false);
    assert.strictEqual(repeat.errors[0].code, 'MIGRATION_OUTPUT_EXISTS');
    assert.strictEqual(fs.readFileSync(map, 'utf8'), preserved);
    const rebuilt = await fonts.generate({
      src: source,
      dist: migrated,
      codepointMap: 'codepoints.json',
      fontFormats: ['woff2'],
      noDemo: true,
    });
    assert.strictEqual(rebuilt.success, true, JSON.stringify(rebuilt.errors));
    assert.deepStrictEqual(rebuilt.directories[0].codepoints, report.directories[0].codepoints);
    const migrationCli = spawnSync(
      process.execPath,
      [path.join(packageRoot, 'bin/index.js'), `--migrate=${deployedFont}`, '--json'],
      { encoding: 'utf8' }
    );
    assert.strictEqual(migrationCli.status, 0, migrationCli.stderr);
    assert.deepStrictEqual(JSON.parse(migrationCli.stdout).codepoints, preview.codepoints);
    console.log(
      `Runtime smoke passed on ${process.version}: all formats, assets, content tracking, read-only checks, encoding migration and CLI JSON.`
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
