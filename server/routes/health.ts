/**
 * @module routes/health
 * @description Health check endpoints for Nour AI
 * @security-note Exposes minimal system info only
 */

import { Router } from "express";
import { getDb } from "../db/sqlite.js";

const router = Router();

/**
 * @route GET /api/health
 * @description Basic health check with database connectivity
 */
router.get("/", (_req, res) => {
  try {
    const db = getDb();
    db.prepare("SELECT 1").get();
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "connected",
      version: "1.0.0",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: "Database connection failed",
    });
  }
});

/**
 * @route GET /api/health/info
 * @description Server info (no sensitive data)
 */
router.get("/info", (_req, res) => {
  res.json({
    name: "Nour AI Server",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    nodeVersion: process.version,
  });
});

export default router;
