import { Router } from 'express';
import { getDb } from '../db/sqlite';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    const db = await getDb();
    await db.get('SELECT 1');
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(), 
      uptime: process.uptime(), 
      database: 'connected' 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(), 
      error: 'Database connection failed' 
    });
  }
});

router.get('/info', (req, res) => {
  res.json({ 
    name: 'Nour AI Server', 
    version: '1.0.0', 
    environment: process.env.NODE_ENV || 'development', 
    port: process.env.PORT || 3000 
  });
});

export default router;
