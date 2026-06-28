/**
 * Cloudflare Workers static site handler
 * Serves HTML, CSS, JS, JSON, and other static assets
 */

const CONTENT_TYPE_MAP = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
};

async function handleRequest(request, env) {
  const url = new URL(request.url);
  let path = url.pathname;

  // Default to index.html for root or directory paths
  if (path === '/' || path.endsWith('/')) {
    path = path.endsWith('/') ? path + 'index.html' : path + '/index.html';
  }

  // Try to fetch the file from assets
  try {
    const asset = await env.ASSETS.fetch(new Request(url.origin + path, request));
    if (asset.status === 200) {
      const contentType = CONTENT_TYPE_MAP[path.slice(path.lastIndexOf('.'))] || 'application/octet-stream';
      const headers = new Headers(asset.headers);
      headers.set('Content-Type', contentType);
      // Cache static assets for 1 hour
      headers.set('Cache-Control', 'public, max-age=3600');
      return new Response(asset.body, { status: 200, headers });
    }
  } catch (e) {
    // ASSETS may not be available in all environments, fall through
  }

  return new Response('404 Not Found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  }
};
