// Run alongside Astro: node --env-file=.env.local scripts/dev-analytics.mjs
import { createServer } from 'node:http';
import handler from '../api/visitors.js';
createServer(async (request, response) => {
  if (new URL(request.url, 'http://127.0.0.1').pathname !== '/api/visitors') { response.writeHead(404); response.end(); return; }
  let body = '';
  for await (const chunk of request) { body += chunk; if (body.length > 1024) { response.writeHead(413); response.end(); return; } }
  request.body = body;
  response.status = code => { response.statusCode = code; return response; };
  response.json = data => { response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify(data)); };
  await handler(request, response);
}).listen(4326, '127.0.0.1', () => console.log('Analytics API ready at http://127.0.0.1:4326/api/visitors'));
