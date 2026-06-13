import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'nour-ai.db');
export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      display_name TEXT,
      description TEXT,
      personality TEXT,
      avatar_url TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      character_id INTEGER,
      content TEXT NOT NULL,
      sender TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      character_id INTEGER,
      title TEXT,
      last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!adminExists) {
    db.prepare(`INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`)
      .run('admin', 'admin@nour.ai', '$2b$10$YourHashedPasswordHere', 'admin');
  }

  const charsExist = db.prepare('SELECT COUNT(*) as count FROM characters').get() as { count: number };
  if (charsExist.count === 0) {
    const chars = [
      ['nour', 'نور', 'رفيقك الذكي المحبوب', 'ودود، متفهم، يساعدك في كل شيء', '/characters/nour.png'],
      ['laila', 'ليلى', 'الصديقة الحنونة', 'حنونة، صبورة، تستمع لك باهتمام', '/characters/laila.png'],
      ['omar', 'عمر', 'المستشار الذكي', 'حكيم، عملي، يعطي نصائح مفيدة', '/characters/omar.png']
    ];
    const stmt = db.prepare('INSERT INTO characters (name, display_name, description, personality, avatar_url) VALUES (?, ?, ?, ?, ?)');
    for (const char of chars) stmt.run(...char);
  }
  console.log('✅ Database initialized');
}
export default db;
