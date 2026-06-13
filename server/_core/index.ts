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
import healthRouter from "../routes/health.js";
import messagesRouter from "../routes/messages.js";
import charactersRouter from "../routes/characters.js";
import aiRouter from "../routes/ai.js";
import authRouter from "../routes/auth.js";
import { initDatabase } from "../db/sqlite.js";
import { aiEngine } from "../ai/engine.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    crossOriginEmbedderPolicy: false,
  }),
  cors({
    origin: [
      "http://localhost:3000",
      "capacitor://localhost",
      "http://localhost",
      "http://127.0.0.1:3000",
      "http://0.0.0.0:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
];

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests" },
  skip: (req) => req.path === "/api/health",
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI rate limit exceeded" },
});

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => { server.close(() => resolve(true)); });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort = 3000) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

function serveStatic(app) {
  const distPath = path.resolve(__dirname, "../../dist/public");
  const clientPath = path.resolve(__dirname, "../../client/dist");
  let servePath = "";
  if (fs.existsSync(distPath)) servePath = distPath;
  else if (fs.existsSync(clientPath)) servePath = clientPath;

  if (servePath) {
    app.use(express.static(servePath));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/trpc")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      const indexPath = path.join(servePath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("<h1>Nour AI</h1><p>Building... Please run: pnpm build</p>");
      }
    });
  } else {
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/trpc")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      res.send(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head><meta charset="UTF-8"><title>نور AI</title>
        <style>body{font-family:system-ui;background:#0f172a;color:#e2e8f0;padding:40px;text-align:center}
        h1{color:#38bdf8}a{color:#818cf8}</style></head>
        <body>
        <h1>🚀 نور AI Server</h1>
        <p>السيرفر يعمل على المنفذ ${process.env.PORT || 3000}</p>
        <p>الحالة: <a href="/api/health">/api/health</a></p>
        <p><strong>ملاحظة:</strong> الواجهة لم تُبنَ بعد. نفّذ: <code>pnpm build</code></p>
        <hr>
        <h2>نقاط النهاية:</h2>
        <ul style="list-style:none;padding:0">
          <li>GET <a href="/api/health">/api/health</a> - فحص الصحة</li>
          <li>GET <a href="/api/characters">/api/characters</a> - الشخصيات</li>
          <li>POST /api/auth/register - تسجيل</li>
          <li>POST /api/auth/login - دخول</li>
          <li>POST /api/ai/chat - محادثة AI</li>
        </ul>
        </body></html>
      `);
    });
  }
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(...securityMiddleware);
  app.use(limiter);
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  try {
    initDatabase();
    console.log("✅ Database initialized");
  } catch (err) {
    console.error("❌ Database error:", err);
    process.exit(1);
  }

  aiEngine.loadModel().catch((err) => console.error("⚠️ AI model failed:", err));

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/messages", messagesRouter);
  app.use("/api/characters", charactersRouter);
  app.use("/api/ai", aiLimiter, aiRouter);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

  serveStatic(app);

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) console.log(`⚠️ Port ${preferredPort} busy, using ${port}`);

  server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Nour AI Server running on http://localhost:${port}/`);
    console.log(`🌐 Network: http://0.0.0.0:${port}/`);
    console.log(`🔒 Security: Enabled | 🧠 AI: Loading | 📊 Health: /api/health`);
    console.log(`📱 Open browser: http://localhost:${port}/`);
  });
}

startServer().catch((err) => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});
