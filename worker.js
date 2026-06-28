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

async function handleRequest(request) {
  const url = new URL(request.url);
  let path = url.pathname;

  // Default to index.html for root or directory paths
  if (path === '/' || path.endsWith('/')) {
    path = path.endsWith('/') ? path + 'index.html' : path + '/index.html';
  }

  // Try to fetch the file from assets
  try {
    const asset = await ASSETS.fetch(new Request(url.origin + path, request));
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

  // Fallback: try to read from the worker's own assets
  // This handles the case where files are served directly
  return serveFile(path, request);
}

async function serveFile(path, request) {
  // Map paths to actual files
  if (path === '/' || path.endsWith('/index.html')) {
    path = '/index.html';
  }

  const contentType = CONTENT_TYPE_MAP[path.slice(path.lastIndexOf('.'))] || 'application/octet-stream';

  // For Cloudflare Workers with Assets, use the ASSETS binding
  // For plain Workers, we serve from the request itself
  try {
    const assetUrl = new URL(path, request.url);
    const asset = await ASSETS.fetch(new Request(assetUrl, request));
    if (asset.status === 200) {
      const headers = new Headers(asset.headers);
      headers.set('Content-Type', contentType);
      headers.set('Cache-Control', 'public, max-age=3600');
      return new Response(asset.body, { status: 200, headers });
    }
  } catch (e) {
    // Continue to 404
  }

  return new Response('404 Not Found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request);
  }
};
