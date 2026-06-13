/**
 * @module _core/index
 * @description Main server entry point for Nour AI
 * @security-note Security middleware applied before all routes
 * @modified 2026-06-13 - Fixed for better-sqlite3 sync API
 */

import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers/index.js";
import { createContext } from "./context.js";
import { serveStatic } from "./vite.js";
import healthRouter from "../routes/health.js";
import messagesRouter from "../routes/messages.js";
import charactersRouter from "../routes/characters.js";
import aiRouter from "../routes/ai.js";
import authRouter from "../routes/auth.js";
import { initDatabase } from "../db/sqlite.js";
import { aiEngine } from "../ai/engine.js";

// ─── Security Middleware ───────────────────────────────────────────

/**
 * @constant securityMiddleware
 * @description Helmet + CORS configuration
 * @security-note Strict CSP prevents inline scripts
 */
const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "http://localhost:3000", "capacitor://localhost"],
        fontSrc: ["'self'", "data:"],
      },
    },
    crossOriginEmbedderPolicy: false, // Required for Capacitor
  }),
  cors({
    origin: ["http://localhost:3000", "capacitor://localhost", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
];

// ─── Rate Limiting ─────────────────────────────────────────────────

/**
 * @constant limiter
 * @description General rate limiter: 100 requests per 15 minutes
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  skip: (req) => req.path === "/api/health", // Health checks exempt
});

/**
 * @constant aiLimiter
 * @description AI-specific rate limiter: 10 requests per minute
 * @security-note Prevents AI API abuse
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI rate limit exceeded. Please wait." },
});

// ─── Port Management ───────────────────────────────────────────────

/**
 * @function isPortAvailable
 * @description Check if a port is available
 */
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

/**
 * @function findAvailablePort
 * @description Find first available port starting from preferred
 */
async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// ─── Server Startup ────────────────────────────────────────────────

/**
 * @function startServer
 * @description Main server initialization
 * @security-note Database initialized before accepting requests
 */
async function startServer() {
  const app = express();
  const server = createServer(app);

  // Apply security layers
  app.use(...securityMiddleware);
  app.use(limiter);
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Initialize database (sync with better-sqlite3)
  try {
    initDatabase();
    console.log("✅ Database initialized");
  } catch (err) {
    console.error("❌ Database error:", err);
    process.exit(1); // Fail fast on DB error
  }

  // Pre-load AI model
  aiEngine.loadModel().catch((err) => {
    console.error("⚠️ AI model failed to load:", err);
  });

  // ─── API Routes ──────────────────────────────────────────────────
  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/messages", messagesRouter);
  app.use("/api/characters", charactersRouter);
  app.use("/api/ai", aiLimiter, aiRouter);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

  // Serve static files (production)
  serveStatic(app);

  // ─── Start Listening ───────────────────────────────────────────
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`⚠️ Port ${preferredPort} busy, using ${port}`);
  }

  server.listen(port, () => {
    console.log(`🚀 Nour AI Server running on http://localhost:${port}/`);
    console.log(`🔒 Security: Enabled`);
    console.log(`🧠 AI Engine: Loading...`);
    console.log(`📊 Health: http://localhost:${port}/api/health`);
  });
}

// ─── Entry Point ───────────────────────────────────────────────────
startServer().catch((err) => {
  console.error("💥 Fatal server error:", err);
  process.exit(1);
});
