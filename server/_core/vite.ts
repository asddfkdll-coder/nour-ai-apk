/**
 * @module _core/vite
 * @description Static file serving for production
 * @security-note Serves only dist/public directory
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @function serveStatic
 * @description Serve built client files in production
 */
export function serveStatic(app: express.Express) {
  const distPath = path.resolve(__dirname, "../../dist/public");

  app.use(express.static(distPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
