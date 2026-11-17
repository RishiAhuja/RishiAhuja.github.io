// Run alongside Astro: node --env-file=.env.local scripts/dev-analytics.mjs
import { createServer } from 'node:http';
import visitors from '../api/visitors.js';
import blurbs from '../api/blurbs.js';
const routes = { '/api/visitors': [visitors, 1024], '/api/blurbs': [blurbs, 8192] };
createServer(async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  const route = routes[url.pathname];
  if (!route) { response.writeHead(404); response.end(); return; }
  let body = '';
  for await (const chunk of request) { body += chunk; if (body.length > route[1]) { response.writeHead(413); response.end(); return; } }
  request.body = body;
  response.status = code => { response.statusCode = code; return response; };
  response.json = data => { response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify(data)); };
  await route[0](request, response);
}).listen(4326, '127.0.0.1', () => console.log('Local API ready at http://127.0.0.1:4326 (visitors, blurbs)'));
