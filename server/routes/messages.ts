/**
 * @module routes/messages
 * @description Message history routes for Nour AI
 * @security-note Protected by JWT authentication
 */

import { Router } from "express";
import { getDb } from "../db/sqlite.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

/**
 * @route GET /api/messages/:characterId
 * @description Get chat history for a specific character
 * @security-note User can only access their own messages
 */
router.get("/:characterId", authenticateToken, async (req, res) => {
  try {
    const characterId = parseInt(req.params.characterId);
    const userId = req.user?.id;

    const db = getDb();
    const messages = db.all(
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
