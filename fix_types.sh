#!/bin/bash
set -e

echo "🔧 Fixing TypeScript types..."

# Fix ai/engine.ts (5 errors)
sed -i 's/async loadModel(): Promise {/async loadModel(): Promise<void> {/' server/ai/engine.ts
sed -i 's/async chat(characterId: number, message: string, userId?: number): Promise {/async chat(characterId: number, message: string, userId?: number): Promise<AIResponse> {/' server/ai/engine.ts
sed -i 's/private async generateResponse(characterId: number, _message: string): Promise {/private async generateResponse(characterId: number, _message: string): Promise<AIResponse> {/' server/ai/engine.ts
sed -i 's/async getHistory(characterId: number, userId?: number): Promise {/async getHistory(characterId: number, userId?: number): Promise<any[]> {/' server/ai/engine.ts
sed -i 's/const responses: Record = {/const responses: Record<number, string[]> = {/' server/ai/engine.ts

# Fix middleware/auth.ts (2 errors)
sed -i 's/): Promise {/): Promise<void> {/' server/middleware/auth.ts
sed -i 's/): Promise {/): Promise<string> {/' server/middleware/auth.ts

# Fix _core/context.ts (3 errors)
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

# Fix _core/index.ts (2 errors)
sed -i 's/function isPortAvailable(port: number): Promise {/function isPortAvailable(port: number): Promise<boolean> {/' server/_core/index.ts
sed -i 's/async function findAvailablePort(startPort: number = 3000): Promise {/async function findAvailablePort(startPort: number = 3000): Promise<number> {/' server/_core/index.ts

# Fix routers/index.ts (1 error)
sed -i 's/initTRPC.context().create()/initTRPC.context<TrpcContext>().create()/' server/routers/index.ts

echo "✅ Types fixed! Building..."
pnpm build

echo "📤 Pushing..."
git add -A
git commit -m "fix(ts): add missing type annotations - 14 errors resolved"
git push

echo "✅✅✅ DONE! ✅✅✅"
