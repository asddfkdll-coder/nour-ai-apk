/**
 * @module _core/context
 * @description tRPC context creation for Nour AI
 * @security-note User extracted from JWT if present, null if not
 */

import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: { id: number; email: string; username: string } | null;
};

/**
 * @function createContext
 * @description Create tRPC context from Express request
 * @security-note Does NOT throw on missing auth - public procedures allowed
 */
export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // TODO: Extract user from JWT if Authorization header present
  // For now, allow public access - auth handled per-procedure
  return {
    req: opts.req,
    res: opts.res,
    user: null,
  };
}
