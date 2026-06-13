import { Router } from 'express';
import { getDb } from '../db/sqlite';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const characters = await db.all('SELECT * FROM characters WHERE is_active = 1');
    res.json(characters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const character = await db.get('SELECT * FROM characters WHERE id = ?', req.params.id);
    if (!character) return res.status(404).json({ error: 'Character not found' });
    res.json(character);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch character' });
  }
});

export default router;
