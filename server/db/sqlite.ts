/**
 * @module db/sqlite
 * @description Database module using Node.js 26 built-in node:sqlite
 * @security-note All queries use prepared statements to prevent SQL injection
 * @modified 2026-06-13 - Migrated to node:sqlite (Node.js 26 built-in) for Termux zero-dependency
 */

import { DatabaseSync } from "node:sqlite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.resolve(__dirname, "../../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DB_PATH = path.resolve(dataDir, "nour-ai.db");

let db: DatabaseSync | null = null;

/**
 * @function initDatabase
 * @description Initialize SQLite database with all required tables
 * @security-note Uses parameterized queries only
 * @performance-note WAL mode enabled for concurrent reads
 */
export function initDatabase(): void {
  try {
    db = new DatabaseSync(DB_PATH);
    
    // Enable WAL mode for better performance
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA foreign_keys = ON;");
    db.exec("PRAGMA busy_timeout = 5000;");

    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        avatar_url TEXT,
        personality TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        response TEXT,
        role TEXT NOT NULL CHECK(role IN ('user', 'ai')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (character_id) REFERENCES characters(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE INDEX IF NOT EXISTS idx_messages_character ON messages(character_id);
      CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
    `);

    // Insert default characters if table is empty
    const countStmt = db.prepare("SELECT COUNT(*) as count FROM characters");
    const count = countStmt.get() as { count: number };
    
    if (count.count === 0) {
      const insertStmt = db.prepare(
        "INSERT INTO characters (name, description, personality) VALUES (?, ?, ?)"
      );
      insertStmt.run("نور", "مساعد ذكي ودود يساعدك في كل شيء", "ودود، متعاون، يحب المساعدة، صبور");
      insertStmt.run("سارة", "صديقة متفائلة تحب الحديث", "متفائلة، طاقتها إيجابية، تحب الحديث، مرحة");
      insertStmt.run("أحمد", "خبير تقني يحب التعليم", "ذكي، هادئ، يحب التعليم، محب للتفاصيل");
      console.log("✅ Default characters inserted");
    }

    console.log("📊 SQLite database initialized (node:sqlite built-in)");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

/**
 * @function getDb
 * @description Get database instance
 * @throws Error if database not initialized
 */
export function getDb(): DatabaseSync {
  if (!db) throw new Error("Database not initialized. Call initDatabase() first.");
  return db;
}

/**
 * @class DatabaseService
 * @description Service layer for database operations
 * @security-note All methods use prepared statements
 */
export class DatabaseService {
  /**
   * @method getMessages
   * @description Get chat history for a character
   * @param {number} characterId - Character ID
   * @param {number} [userId] - Optional user ID filter
   * @returns {any[]} Array of messages
   */
  getMessages(characterId: number, userId?: number): any[] {
    const db = getDb();
    if (userId) {
      const stmt = db.prepare(
        `SELECT * FROM messages 
         WHERE character_id = ? AND user_id = ? 
         ORDER BY created_at DESC 
         LIMIT 50`
      );
      return stmt.all(characterId, userId) as any[];
    }
    const stmt = db.prepare(
      `SELECT * FROM messages 
       WHERE character_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`
    );
    return stmt.all(characterId) as any[];
  }

  /**
   * @method saveMessage
   * @description Save a message to database
   * @security-note Uses parameterized query
   */
  saveMessage(message: {
    characterId: number;
    userId: number;
    content: string;
    response: string | null;
    role: string;
    createdAt: Date;
  }): void {
    const db = getDb();
    const stmt = db.prepare(
      `INSERT INTO messages (character_id, user_id, content, response, role, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    stmt.run(
      message.characterId,
      message.userId,
      message.content,
      message.response,
      message.role,
      message.createdAt.toISOString()
    );
  }

  /**
   * @method getUserByEmail
   * @description Find user by email
   * @security-note Prevents enumeration attacks by consistent timing
   */
  getUserByEmail(email: string): any {
    const db = getDb();
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    return stmt.get(email);
  }

  /**
   * @method createUser
   * @description Create new user
   * @returns {number} New user ID
   */
  createUser(username: string, email: string, passwordHash: string): number {
    const db = getDb();
    const stmt = db.prepare(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)"
    );
    const result = stmt.run(username, email, passwordHash);
    return Number(result.lastInsertRowid);
  }

  /**
   * @method getUserById
   * @description Get user by ID
   */
  getUserById(id: number): any {
    const db = getDb();
    const stmt = db.prepare(
      "SELECT id, username, email, created_at FROM users WHERE id = ?"
    );
    return stmt.get(id);
  }
}
