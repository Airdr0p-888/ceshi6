// 简单 HTTP 静态服务器 (用于本地测试 fairmint-platform)
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = 7788;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.resolve(ROOT, '.' + urlPath);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, {'Content-Type': 'text/plain'}); res.end('Not Found: ' + urlPath); return; }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('FairMint 平台已启动:');
  console.log('  主页:   http://127.0.0.1:' + PORT + '/index.html');
  console.log('  部署:   http://127.0.0.1:' + PORT + '/deploy.html');
  console.log('  Mint:   http://127.0.0.1:' + PORT + '/mint.html');
  console.log('  管理:   http://127.0.0.1:' + PORT + '/admin.html');
});
