import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, decimal, boolean, index, float } from "drizzle-orm/mysql-core";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  avatarUrl: text("avatarUrl"),
  bio: text("bio"),
  dateOfBirth: timestamp("dateOfBirth"),
  gender: varchar("gender", { length: 20 }),
  language: varchar("language", { length: 10 }).default("ar"),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "basic", "premium", "ultimate"]).default("free").notNull(),
  creditsBalance: int("creditsBalance").default(0).notNull(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  deviceTokens: json("deviceTokens"),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const characterCategories = mysqlTable("character_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description"),
  iconUrl: text("iconUrl"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const characters = mysqlTable("characters", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  displayName: varchar("displayName", { length: 100 }),
  avatarUrl: text("avatarUrl"),
  bannerUrl: text("bannerUrl"),
  description: text("description"),
  backstory: text("backstory"),
  personalityTraits: json("personalityTraits"),
  voiceTone: varchar("voiceTone", { length: 50 }),
  interests: json("interests"),
  categoryId: int("categoryId"),
  creatorId: int("creatorId"),
  isCustom: boolean("isCustom").default(false).notNull(),
  isPremium: boolean("isPremium").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  popularityScore: float("popularityScore").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  characterId: int("characterId").notNull(),
  title: varchar("title", { length: 200 }).default("New Conversation"),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  lastMessageAt: timestamp("lastMessageAt"),
  messageCount: int("messageCount").default(0).notNull(),
  totalTokensUsed: int("totalTokensUsed").default(0).notNull(),
  relationshipScore: float("relationshipScore").default(0).notNull(),
  mood: varchar("mood", { length: 50 }).default("neutral"),
  contextWindow: json("contextWindow"),
  isPinned: boolean("isPinned").default(false).notNull(),
  isArchived: boolean("isArchived").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderType: mysqlEnum("senderType", ["user", "ai", "system"]).notNull(),
  senderId: int("senderId"),
  content: text("content").notNull(),
  contentType: varchar("contentType", { length: 20 }).default("text").notNull(),
  tokensUsed: int("tokensUsed").default(0),
  modelUsed: varchar("modelUsed", { length: 50 }),
  embeddingVectorId: int("embeddingVectorId"),
  emotionDetected: varchar("emotionDetected", { length: 50 }),
  sentimentScore: float("sentimentScore"),
  isEdited: boolean("isEdited").default(false).notNull(),
  isDeleted: boolean("isDeleted").default(false).notNull(),
  isFlagged: boolean("isFlagged").default(false).notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const memories = mysqlTable("memories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  characterId: int("characterId"),
  memoryType: mysqlEnum("memoryType", ["fact", "preference", "event", "emotion", "goal"]).notNull(),
  content: text("content").notNull(),
  importanceScore: float("importanceScore").default(0.5),
  confidenceScore: float("confidenceScore").default(0.8),
  sourceMessageId: int("sourceMessageId"),
  category: varchar("category", { length: 50 }),
  tags: json("tags"),
  isActive: boolean("isActive").default(true).notNull(),
  lastAccessed: timestamp("lastAccessed"),
  accessCount: int("accessCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planType: mysqlEnum("planType", ["free", "basic", "premium", "ultimate"]).notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  autoRenew: boolean("autoRenew").default(true).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subscriptionId: int("subscriptionId"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(),
  transactionId: varchar("transactionId", { length: 255 }).notNull().unique(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  receiptUrl: text("receiptUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const systemNotifications = mysqlTable("systemNotifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  notificationType: varchar("notificationType", { length: 20 }).notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
