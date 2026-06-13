/**
 * @module routes/ai
 * @description AI chat routes for Nour AI
 * @security-note Rate limited (10/min), JWT protected
 */

import { Router } from "express";
import { aiEngine } from "../ai/engine.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

/**
 * @route POST /api/ai/chat
 * @description Send message to AI character
 * @security-note Validates input, saves to database
 */
router.post("/chat", authenticateToken, async (req, res) => {
  try {
    const { characterId, message } = req.body;
    const userId = req.user?.id;

    if (!characterId || !message) {
      return res.status(400).json({ error: "characterId and message are required" });
    }

    const response = await aiEngine.chat(characterId, message, userId);
    res.json({ success: true, response });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: "AI processing failed" });
  }
});

/**
 * @route GET /api/ai/history/:characterId
 * @description Get AI chat history
 */
router.get("/history/:characterId", authenticateToken, async (req, res) => {
  try {
    const characterId = parseInt(req.params.characterId);
    const userId = req.user?.id;

    const history = await aiEngine.getHistory(characterId, userId);
    res.json({ success: true, history });
  } catch (error) {
    console.error("AI History Error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

/**
 * @route GET /api/ai/status
 * @description Get AI engine status (public)
 */
router.get("/status", async (_req, res) => {
  try {
    const status = await aiEngine.getStatus();
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ error: "Status check failed" });
  }
});

export default router;
