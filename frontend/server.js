const http = require('node:http');
const { createReadStream } = require('node:fs');
const { stat } = require('node:fs/promises');
const path = require('node:path');
const routes = require('./js/routes');

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
};

http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let pathname;
  let asset;
  try {
    ({ pathname } = new URL(req.url, 'http://localhost'));
    asset = decodeURIComponent(pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }

  const isAsset = /^\/(?:css|js|images|fonts|pages)\//.test(asset) ||
    asset === '/favicon.ico' || asset === '/config.js';
  const file = path.resolve(__dirname, isAsset ? '.' + asset : 'index.html');
  const status = !isAsset && routes.match(pathname).name === 'notFound' ? 404 : 200;

  if (!file.startsWith(__dirname + path.sep) || asset.split('/').includes('..') || asset.includes('\\') || asset.includes('\0')) {
    res.writeHead(404).end();
    return;
  }

  try {
    const info = await stat(file);
    if (!info.isFile()) {
      res.writeHead(404).end();
      return;
    }

    res.writeHead(status, {
      'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': info.size,
    });
    if (req.method === 'HEAD') res.end();
    else createReadStream(file).on('error', () => res.destroy()).pipe(res);
  } catch (error) {
    res.writeHead(error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : 500).end();
  }
}).listen(Number(process.env.PORT) || 8080, () => {
  console.log('IZI frontend started');
});
