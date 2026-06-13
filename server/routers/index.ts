/**
 * @module routers/index
 * @description tRPC router for Nour AI
 * @modified 2026-06-13 - Added auth router, characters router
 * @security-note JWT verification with jose, clock tolerance 60s
 */

import { initTRPC } from "@trpc/server";
import { TrpcContext } from "../_core/context.js";
import { getDb } from "../db/sqlite.js";
import { jwtVerify } from "jose";

const t = initTRPC.context<TrpcContext>().create();

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nour-ai-secret-key-change-in-production"
);

export const appRouter = t.router({
  health: t.procedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),

  auth: t.router({
    me: t.procedure.query(async ({ ctx }) => {
      const authHeader = ctx.req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      if (!token) return null;
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
        return {
          id: payload.userId as number,
          email: payload.email as string,
          username: payload.username as string,
          role: (payload.role as string) || "user",
        };
      } catch {
        return null;
      }
    }),

    logout: t.procedure.mutation(async () => {
      return { success: true };
    }),
  }),

  characters: t.router({
    list: t.procedure.query(async () => {
      const db = getDb();
      return db.prepare("SELECT id, name, description, avatar_url, personality FROM characters").all();
    }),
  }),
});

export type AppRouter = typeof appRouter;
