const http = require('node:http');
const path = require('node:path');
const { readFile } = require('./file');

const hostname = 'localhost';
const port = Number(process.env.PORT) || 8082;
const publicDirectory = path.resolve(__dirname, 'public');
const dataFile = path.join(__dirname, 'data.json');

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function getPublicFile(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, `http://${hostname}:${port}`).pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
  const filePath = path.resolve(publicDirectory, relativePath);

  if (filePath !== publicDirectory && !filePath.startsWith(`${publicDirectory}${path.sep}`)) {
    return null;
  }

  return filePath;
}

async function handleJsonApi(request, response) {
  if (request.method === 'GET') {
    try {
      const data = await readFile(dataFile);
      sendJson(response, 200, JSON.parse(data));
    } catch (error) {
      sendJson(response, 500, { error: 'Unable to read data file' });
    }
    return true;
  }

  if (request.method === 'PUT' || request.method === 'PATCH') {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => { body += chunk; });
    request.on('end', async () => {
      try {
        const parsedBody = JSON.parse(body);
        await require('node:fs/promises').writeFile(dataFile, `${JSON.stringify(parsedBody, null, 2)}\n`, 'utf8');
        sendJson(response, 200, parsedBody);
      } catch (error) {
        sendJson(response, 400, { error: 'Request body must be valid JSON' });
      }
    });
    return true;
  }

  return false;
}

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url, `http://${hostname}:${port}`);

    if (requestUrl.pathname === '/api/data') {
      if (await handleJsonApi(request, response)) return;
      response.setHeader('Allow', 'GET, PUT, PATCH');
      sendJson(response, 405, { error: 'Method not allowed' });
      return;
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.setHeader('Allow', 'GET, HEAD');
      response.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Method Not Allowed');
      return;
    }

    const filePath = getPublicFile(request.url);
    if (!filePath || path.extname(filePath).toLowerCase() !== '.html') {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not Found');
      return;
    }

    const data = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    if (request.method === 'GET') response.end(data);
    else response.end();
  } catch (error) {
    if (error.code === 'ENOENT') {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not Found');
      return;
    }
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Internal Server Error');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
