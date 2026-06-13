import { Router } from "express";
import { getDb } from "../db/sqlite";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// GET /api/messages/:characterId
router.get("/:characterId", authenticateToken, async (req, res) => {
  try {
    const characterId = parseInt(req.params.characterId);
    const userId = req.user?.id;

    const db = getDb();
    const messages = await db.all(
      `SELECT m.*, c.name as character_name 
       FROM messages m 
       JOIN characters c ON m.character_id = c.id 
       WHERE m.character_id = ? AND m.user_id = ? 
       ORDER BY m.created_at ASC`,
      [characterId, userId]
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Messages Error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
