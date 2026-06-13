import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic } from "./vite";
import healthRouter from "../routes/health";
import messagesRouter from "../routes/messages";
import charactersRouter from "../routes/characters";
import aiRouter from "../routes/ai";
import authRouter from "../routes/auth";
import { initDatabase } from "../db/sqlite";
import { aiEngine } from "../ai/engine";

// Security middleware
const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:"],
      },
    },
  }),
  cors({
    origin: ['http://localhost:3000', 'capacitor://localhost'],
    credentials: true
  })
];

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute
  message: { error: 'AI rate limit exceeded. Please wait.' }
});

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => { server.close(() => resolve(true)); });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Apply security
  app.use(...securityMiddleware);
  app.use(limiter);
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Initialize database
  try {
    await initDatabase();
    console.log("✅ Database initialized");
  } catch (err) {
    console.error("❌ Database error:", err);
  }

  // Pre-load AI model
  aiEngine.loadModel().catch(err => {
    console.error("⚠️ AI model failed to load:", err);
  });

  // Routes
  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/messages", messagesRouter);
  app.use("/api/characters", charactersRouter);
  app.use("/api/ai", aiLimiter, aiRouter);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  
  serveStatic(app);

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) console.log(`Port ${preferredPort} busy, using ${port}`);

  server.listen(port, () => {
    console.log(`🚀 Nour AI Server running on http://localhost:${port}/`);
    console.log(`🔒 Security: Enabled`);
    console.log(`🧠 AI Engine: Loading...`);
    console.log(`📊 Health: http://localhost:${port}/api/health`);
  });
}

startServer().catch(console.error);
