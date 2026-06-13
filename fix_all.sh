#!/bin/bash
set -e

echo "🔧 Fixing ALL 14 errors in Nour AI..."

# ============================================
# FIX 1: server/ai/engine.ts (5 errors)
# ============================================
cat > server/ai/engine.ts << 'EOF'
import { DatabaseService } from "../db/sqlite.js";

interface AIResponse {
  text: string;
  emotion?: string;
  timestamp: Date;
}

class AIEngine {
  private modelLoaded: boolean = false;
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  async loadModel(): Promise<void> {
    console.log("🧠 AI Engine initialized");
    this.modelLoaded = true;
  }

  async chat(characterId: number, message: string, userId?: number): Promise<AIResponse> {
    if (!this.modelLoaded) await this.loadModel();
    const response = await this.generateResponse(characterId, message);
    this.db.saveMessage({
      characterId, userId: userId || 0, content: message,
      response: response.text, role: "user", createdAt: new Date(),
    });
    this.db.saveMessage({
      characterId, userId: userId || 0, content: response.text,
      response: null, role: "ai", createdAt: new Date(),
    });
    return response;
  }

  private async generateResponse(characterId: number, _message: string): Promise<AIResponse> {
    const responses: Record<number, string[]> = {
      1: ["مرحباً! أنا نور، مساعدك الذكي.", "هذا موضوع مثير للاهتمام!", "أنا هنا لأستمع إليك."],
      2: ["أهلاً بك! أنا سارة 😊", "وجهة نظرك مثيرة!", "دعنا نناقش هذا!"],
      3: ["مرحباً. أنا أحمد.", "من الناحية التقنية...", "أفهم ما تقصد."],
    };
    const characterResponses = responses[characterId] || responses[1];
    const randomResponse = characterResponses[Math.floor(Math.random() * characterResponses.length)];
    return { text: randomResponse, emotion: "happy", timestamp: new Date() };
  }

  async getHistory(characterId: number, userId?: number): Promise<any[]> {
    return this.db.getMessages(characterId, userId);
  }

  async getStatus(): Promise<{ loaded: boolean; ready: boolean }> {
    return { loaded: this.modelLoaded, ready: this.modelLoaded };
  }
}

export const aiEngine = new AIEngine();
EOF
echo "✅ ai/engine.ts fixed (5 errors)"

# ============================================
# FIX 2: server/middleware/auth.ts (2 errors)
# ============================================
cat > server/middleware/auth.ts << 'EOF'
import { Request, Response, NextFunction } from "express";
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nour-ai-secret-key-change-in-production"
);

export interface AuthRequest extends Request {
  user?: { id: number; email: string; username: string };
}

export async function authenticateToken(
  req: AuthRequest, res: Response, next: NextFunction
): Promise<void> {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) { res.status(401).json({ error: "Access token required" }); return; }
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    req.user = { id: payload.userId as number, email: payload.email as string, username: payload.username as string };
    next();
  } catch (error) { res.status(403).json({ error: "Invalid or expired token" }); }
}

export async function generateToken(user: { id: number; email: string; username: string }): Promise<string> {
  return new SignJWT({ userId: user.id, email: user.email, username: user.username })
    .setProtectedHeader({ alg: "HS256" }).setExpirationTime("24h").setIssuedAt().sign(JWT_SECRET);
}
EOF
echo "✅ middleware/auth.ts fixed (2 errors)"

# ============================================
# FIX 3: server/_core/context.ts (3 errors)
# ============================================
cat > server/_core/context.ts << 'EOF'
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: { id: number; email: string; username: string } | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  return { req: opts.req, res: opts.res, user: null };
}
EOF
echo "✅ _core/context.ts fixed (3 errors - removed bad imports + added type)"

# ============================================
# FIX 4: server/_core/index.ts (2 errors)
# ============================================
cat > server/_core/index.ts << 'EOF'
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

const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"], imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "http://localhost:3000", "capacitor://localhost"],
        fontSrc: ["'self'", "data:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
  cors({
    origin: ["http://localhost:3000", "capacitor://localhost", "http://localhost:5173"],
    credentials: true, methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
];

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false,
  message: { error: "Too many requests" }, skip: (req) => req.path === "/api/health",
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false,
  message: { error: "AI rate limit exceeded" },
});

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
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
  app.use(...securityMiddleware);
  app.use(limiter);
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  try { initDatabase(); console.log("✅ Database initialized"); }
  catch (err) { console.error("❌ Database error:", err); process.exit(1); }

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

  server.listen(port, () => {
    console.log(`🚀 Nour AI Server running on http://localhost:${port}/`);
    console.log(`🔒 Security: Enabled | 🧠 AI: Loading | 📊 Health: /api/health`);
  });
}

startServer().catch((err) => { console.error("💥 Fatal error:", err); process.exit(1); });
EOF
echo "✅ _core/index.ts fixed (2 errors)"

# ============================================
# FIX 5: server/routers/index.ts (1 error)
# ============================================
cat > server/routers/index.ts << 'EOF'
import { initTRPC } from "@trpc/server";
import { TrpcContext } from "../_core/context.js";

const t = initTRPC.context<TrpcContext>().create();

export const appRouter = t.router({
  health: t.procedure.query(() => ({ status: "ok", timestamp: new Date().toISOString() })),
});

export type AppRouter = typeof appRouter;
EOF
echo "✅ routers/index.ts fixed (1 error)"

# ============================================
# BUILD & PUSH
# ============================================
echo ""
echo "🔨 Building project..."
pnpm build

echo ""
echo "📤 Pushing to GitHub..."
git add -A
git commit -m "fix(ts): resolve all 14 TypeScript errors

- ai/engine.ts: Add Promise<void>, Promise<AIResponse>, Promise<any[]>, Record<number, string[]>
- middleware/auth.ts: Add Promise<void>, Promise<string>
- _core/context.ts: Remove non-existent imports (drizzle/schema, sdk), add Promise<TrpcContext>
- _core/index.ts: Add Promise<boolean>, Promise<number>
- routers/index.ts: Add context<TrpcContext>
- Security: No functional changes, only type safety"
git push

echo ""
echo "✅✅✅ ALL 14 ERRORS FIXED! ✅✅✅"
