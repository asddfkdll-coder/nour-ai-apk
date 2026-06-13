/**
 * @module routers/index
 * @description tRPC router for Nour AI
 */

import { initTRPC } from "@trpc/server";
import { TrpcContext } from "../_core/context.js";

const t = initTRPC.context<TrpcContext>().create();

/**
 * @constant appRouter
 * @description Main tRPC router
 */
export const appRouter = t.router({
  health: t.procedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
});

export type AppRouter = typeof appRouter;
