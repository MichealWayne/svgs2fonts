const fs = require('fs');
const path = require('path');
const http = require('http');
const { generate } = require('../dist');
const root = path.join(__dirname, '.preview');

(async () => {
  fs.mkdirSync(path.join(root, 'src'), { recursive: true });
  for (const name of ['home', 'alarm-clock', 'home.dark"&']) {
    fs.writeFileSync(
      path.join(root, 'src', `${name}.svg`),
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 10 L12 2 L22 10 L22 22 L2 22 Z"/></svg>'
    );
  }
  const output = path.join(root, 'out');
  const report = await generate({
    src: path.join(root, 'src'),
    dist: output,
    fontFormats: ['woff2', 'woff'],
    outputCss: true,
    outputManifest: true,
    codepointMap: 'codepoints.json',
  });
  if (!report.success) throw new Error(JSON.stringify(report.errors));
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  };
  const server = http.createServer((request, response) => {
    if (request.url === '/health') return response.end('ready');
    try {
      const name = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname).slice(1);
      const file = path.resolve(output, name);
      if (!file.startsWith(output + path.sep) || !fs.statSync(file).isFile())
        throw new Error('Not found');
      response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      response.end(fs.readFileSync(file));
    } catch (_) {
      response.statusCode = 404;
      response.end('Not found');
    }
  });
  server.listen(4173, '127.0.0.1');
  for (const signal of ['SIGINT', 'SIGTERM'])
    process.on(signal, () => server.close(() => process.exit(0)));
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
