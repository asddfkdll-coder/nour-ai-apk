import { initTRPC } from "@trpc/server";
import { TrpcContext } from "../_core/context.js";

const t = initTRPC.context<TrpcContext>().create();

export const appRouter = t.router({
  health: t.procedure.query(() => ({ status: "ok", timestamp: new Date().toISOString() })),
});

export type AppRouter = typeof appRouter;
