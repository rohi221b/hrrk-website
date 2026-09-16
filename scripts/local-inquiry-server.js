const http = require('http');
const fs = require('fs');
const path = require('path');
const handler = require('../api/inquiry');

const root = path.join(__dirname, '..');
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0];
  if (urlPath === '/api/inquiry') {
    handler(req, res);
    return;
  }

  let filePath = path.join(root, urlPath === '/' ? 'index.html' : urlPath);
  if (!filePath.startsWith(root)) {
    res.statusCode = 403;
    res.end();
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    res.setHeader('Content-Type', mime[path.extname(filePath)] || 'application/octet-stream');
    res.end(data);
  });
});

server.listen(3456, '127.0.0.1', () => {
  console.log('listening on http://127.0.0.1:3456');
});
