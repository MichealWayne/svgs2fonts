const path = require('path');
const { generate } = require('../dist');

async function main() {
  const report = await generate({
    src: path.join(__dirname, 'svg'),
    dist: path.join(__dirname, 'dest'),
    fontName: 'myfont',
    outputCss: true,
    outputManifest: true,
    verbose: true,
    performanceAnalysis: true,
  });
  if (!report.success) {
    console.error(report.errors);
    process.exitCode = 1;
    return;
  }
  console.log(`Generated ${report.directories[0].iconCount} icons in ${report.durationMs}ms`);
  console.log(report.outputs.join('\n'));
}
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
