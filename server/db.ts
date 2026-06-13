import { drizzle } from "drizzle-orm/mysql2";
import { eq, and, desc, sql } from "drizzle-orm";
import { 
  users, 
  characters, 
  characterCategories, 
  conversations, 
  messages, 
  memories,
  subscriptions,
  payments
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return null;
    try {
      _db = drizzle(dbUrl);
    } catch (error) {
      _db = null;
    }
  }
  return _db;
}

// User Operations
export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return results[0] || null;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return results[0] || null;
}

export async function upsertUser(user: any): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(users).values({
    openId: user.openId,
    name: user.name,
    email: user.email,
    loginMethod: user.loginMethod,
    lastSignedIn: new Date(),
  }).onDuplicateKeyUpdate({
    set: {
      name: user.name,
      email: user.email,
      loginMethod: user.loginMethod,
      lastSignedIn: new Date(),
    }
  });
}

// Character Operations
export async function getCharacters() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(characters).where(eq(characters.isActive, true));
}

export async function getCharacterById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(characters).where(eq(characters.id, id)).limit(1);
  return results[0] || null;
}

// Chat Operations
export async function createConversation(userId: number, characterId: number, title: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(conversations).values({
    userId,
    characterId,
    title,
    lastMessageAt: new Date(),
  });
  return result[0].insertId;
}

export async function addMessage(message: any) {
  const db = await getDb();
  if (!db) return;
  await db.insert(messages).values({
    conversationId: message.conversationId,
    senderType: message.senderType,
    senderId: message.senderId,
    content: message.content,
  });
  
  await db.update(conversations)
    .set({ lastMessageAt: new Date(), updatedAt: new Date() })
    .where(eq(conversations.id, message.conversationId));
}

export async function getConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(50);
}

export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt));
}

// Memory Operations
export async function saveMemory(memory: any) {
  const db = await getDb();
  if (!db) return;
  await db.insert(memories).values({
    userId: memory.userId,
    characterId: memory.characterId,
    memoryType: memory.memoryType,
    content: memory.content,
    importanceScore: memory.importanceScore || 0.5,
  });
}

export async function getRelevantMemories(userId: number, characterId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memories)
    .where(and(
      eq(memories.userId, userId),
      eq(memories.characterId, characterId),
      eq(memories.isActive, true)
    ))
    .orderBy(desc(memories.importanceScore))
    .limit(5);
}
