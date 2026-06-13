import { Router } from 'express';
import { getDb } from '../db/sqlite';

const router = Router();

router.get('/:characterId', async (req, res) => {
  try {
    const db = await getDb();
    const messages = await db.all(
      'SELECT * FROM messages WHERE character_id = ? ORDER BY timestamp ASC',
      req.params.characterId
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const { characterId, content, sender } = req.body;
    const result = await db.run(
      'INSERT INTO messages (character_id, content, sender) VALUES (?, ?, ?)',
      [characterId, content, sender]
    );
    res.json({ id: result.lastID, characterId, content, sender });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
