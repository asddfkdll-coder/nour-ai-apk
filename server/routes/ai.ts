import { Router } from "express";
import { aiEngine } from "../ai/engine";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// POST /api/ai/chat - محادثة مع الشخصية
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

// GET /api/ai/history/:characterId - سجل المحادثات
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

// GET /api/ai/status - حالة محرك AI
router.get("/status", async (_req, res) => {
  try {
    const status = await aiEngine.getStatus();
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ error: "Status check failed" });
  }
});

export default router;
