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
