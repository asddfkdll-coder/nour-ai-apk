import { Router } from "express";
import { getDb } from "../db/sqlite";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// GET /api/characters - قائمة الشخصيات
router.get("/", async (_req, res) => {
  try {
    const db = getDb();
    const characters = await db.all("SELECT id, name, description, avatar_url, personality FROM characters");
    res.json({ success: true, characters });
  } catch (error) {
    console.error("Characters Error:", error);
    res.status(500).json({ error: "Failed to fetch characters" });
  }
});

// GET /api/characters/:id - تفاصيل شخصية
router.get("/:id", async (req, res) => {
  try {
    const db = getDb();
    const character = await db.get(
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
