import { Request, Response, NextFunction } from "express";

/**
 * Security middleware to protect against common web vulnerabilities
 */
export function securityMiddleware(req: Request, res: Response, next: NextFunction) {
  // 1. X-Content-Type-Options: Prevents the browser from interpreting files as a different MIME type
  res.setHeader("X-Content-Type-Options", "nosniff");

  // 2. X-Frame-Options: Prevents clickjacking by not allowing the site to be embedded in an iframe
  res.setHeader("X-Frame-Options", "DENY");

  // 3. X-XSS-Protection: Enables the browser's XSS filter
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // 4. Strict-Transport-Security: Forces HTTPS (should be enabled in production)
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  // 5. Content-Security-Policy: Controls which resources can be loaded
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;"
  );

  // 6. Referrer-Policy: Controls how much referrer information is included with requests
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  next();
}

/**
 * Simple rate limiter to prevent brute force and DoS
 */
const requestCounts = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
  const now = Date.now();
  const userData = requestCounts.get(ip) || { count: 0, lastReset: now };

  if (now - userData.lastReset > RATE_LIMIT_WINDOW) {
    userData.count = 1;
    userData.lastReset = now;
  } else {
    userData.count++;
  }

  requestCounts.set(ip, userData);

  if (userData.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  next();
}
