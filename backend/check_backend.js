const http = require('http');
const paths = ['/', '/src/index.html', '/manifest.json', '/api-tienda/auth/health'];
const req = (p) => new Promise((resolve) => {
  const options = { hostname: 'localhost', port: 3000, path: p, method: 'GET' };
  const request = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      resolve({ path: p, status: res.statusCode, contentType: res.headers['content-type'], body: data.slice(0, 150) });
    });
  });
  request.on('error', (err) => {
    resolve({ path: p, error: err.message });
  });
  request.end();
});
(async () => {
  for (const path of paths) {
    const result = await req(path);
    console.log(JSON.stringify(result));
  }
})();
