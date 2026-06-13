import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic } from "./vite";
import { securityMiddleware, rateLimiter } from "../security";
import { seedSoulChatCharacters } from "../soulchat_seed_v2";
import healthRouter from "../routes/health";
import messagesRouter from "../routes/messages";
import charactersRouter from "../routes/characters";
import { initDatabase } from "../db/sqlite";

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

  try {
    await initDatabase();
    console.log("✅ SQLite database initialized");
  } catch (err) {
    console.error("❌ Failed to initialize database:", err);
  }

  app.use(securityMiddleware);
  app.use(rateLimiter);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);
  
  app.use("/api/health", healthRouter);
  app.use("/api/messages", messagesRouter);
  app.use("/api/characters", charactersRouter);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  
  serveStatic(app);

  try {
    await seedSoulChatCharacters();
  } catch (err) {
    console.error("Failed to seed characters:", err);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) console.log(`Port ${preferredPort} busy, using ${port}`);

  server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}/`);
    console.log(`📊 Health: http://localhost:${port}/api/health`);
    console.log(`💬 Messages: http://localhost:${port}/api/messages`);
    console.log(`👥 Characters: http://localhost:${port}/api/characters`);
  });
}

startServer().catch(console.error);
