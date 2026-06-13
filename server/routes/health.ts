import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    uptime: process.uptime()
  });
});

export default router;
