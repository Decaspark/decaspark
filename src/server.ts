import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine({
  allowedHosts: [
    'localhost',
    '127.0.0.1',
    '*.e2b.app',
    '*.vercel.app',
    'decaspark.com',
    '*.decaspark.com',
  ],
});

/**
 * Security headers for static and server-rendered responses.
 */
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

/**
 * Serve static files from /browser with immutable caching for hashed assets.
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * Bind to 0.0.0.0 by default so container and cloud preview proxies can connect.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = Number(process.env['PORT'] ?? 4000);
  const host = process.env['HOST'] ?? '0.0.0.0';
  app.listen(port, host, (error) => {
    if (error) {
      throw error;
    }
    console.log(`Decaspark Angular SSR server listening on http://${host}:${port}`);
  });
}

/**
 * Request handler used by Angular CLI dev-server, build prerender, and Vercel serverless functions.
 */
export const reqHandler = createNodeRequestHandler(app);
