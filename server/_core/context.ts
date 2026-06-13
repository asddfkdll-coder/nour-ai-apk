import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
export interface TrpcUser { id: number; email: string; username: string; }
export type TrpcContext = { req: CreateExpressContextOptions["req"]; res: CreateExpressContextOptions["res"]; user: TrpcUser | null; };
export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  const authReq = opts.req as any;
  return { req: opts.req, res: opts.res, user: authReq.user || null };
}