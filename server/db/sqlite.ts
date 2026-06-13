import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'nour-ai.db');
let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
  }
  return db;
}

export async function initDatabase() {
  const database = await getDb();
  
  await database.exec(`
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
      is_active INTEGER DEFAULT 1,
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

  const adminExists = await database.get('SELECT id FROM users WHERE username = ?', 'admin');
  if (!adminExists) {
    await database.run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@nour.ai', '$2b$10$YourHashedPasswordHere', 'admin']
    );
  }

  const charsExist = await database.get('SELECT COUNT(*) as count FROM characters');
  if (!charsExist || charsExist.count === 0) {
    const chars = [
      ['nour', 'نور', 'رفيقك الذكي المحبوب', 'ودود، متفهم، يساعدك في كل شيء', '/characters/nour.png'],
      ['laila', 'ليلى', 'الصديقة الحنونة', 'حنونة، صبورة، تستمع لك باهتمام', '/characters/laila.png'],
      ['omar', 'عمر', 'المستشار الذكي', 'حكيم، عملي، يعطي نصائح مفيدة', '/characters/omar.png']
    ];
    const stmt = await database.prepare('INSERT INTO characters (name, display_name, description, personality, avatar_url) VALUES (?, ?, ?, ?, ?)');
    for (const char of chars) await stmt.run(char);
    await stmt.finalize();
  }

  console.log('✅ Database initialized');
}

export { db };
export default db;
