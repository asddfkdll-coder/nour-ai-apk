import { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export function createContext({ req, res }: CreateExpressContextOptions) {
  return {
    req,
    res,
    user: null // يمكن إضافة استخراج المستخدم من JWT لاحقاً
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
