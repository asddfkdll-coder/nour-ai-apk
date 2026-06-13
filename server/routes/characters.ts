/**
 * @module routes/characters
 * @description Character management routes for Nour AI
 */

import { Router } from "express";
import { getDb } from "../db/sqlite.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

/**
 * @route GET /api/characters
 * @description List all available characters
 * @security-note Public endpoint - no auth required
 */
router.get("/", async (_req, res) => {
  try {
    const db = getDb();
    const characters = db.all("SELECT id, name, description, avatar_url, personality FROM characters");
    res.json({ success: true, characters });
  } catch (error) {
    console.error("Characters Error:", error);
    res.status(500).json({ error: "Failed to fetch characters" });
  }
});

/**
 * @route GET /api/characters/:id
 * @description Get single character details
 */
router.get("/:id", async (req, res) => {
  try {
    const db = getDb();
    const character = db.get(
      "SELECT id, name, description, avatar_url, personality FROM characters WHERE id = ?",
      [req.params.id]
    );

    if (!character) {
      return res.status(404).json({ error: "Character not found" });
    }

    res.json({ success: true, character });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch character" });
  }
});

export default router;
