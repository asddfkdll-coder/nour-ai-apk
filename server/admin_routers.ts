import { adminProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { users, messages, characters, conversations } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const adminRouter = {
  // ============ المستخدمون ============
  getAllUsers: adminProcedure.query(async () => {
    const db_instance = await getDb();
    if (!db_instance) return [];
    return db_instance.select().from(users).orderBy(desc(users.createdAt));
  }),

  getUserById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db_instance = await getDb();
      if (!db_instance) return null;
      const results = await db_instance.select().from(users).where(eq(users.id, input.id)).limit(1);
      return results[0] || null;
    }),

  updateUser: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        role: z.enum(["user", "admin"]).optional(),
        isActive: z.boolean().optional(),
        subscriptionTier: z.enum(["free", "basic", "premium", "ultimate"]).optional(),
        creditsBalance: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db_instance = await getDb();
      if (!db_instance) return null;
      
      const { id, ...updateData } = input;
      await db_instance.update(users).set(updateData).where(eq(users.id, id));
      const results = await db_instance.select().from(users).where(eq(users.id, id)).limit(1);
      return results[0] || null;
    }),

  deleteUser: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db_instance = await getDb();
      if (!db_instance) return false;
      
      await db_instance.update(users)
        .set({ isActive: false })
        .where(eq(users.id, input.id));
      return true;
    }),

  // ============ الرسائل ============
  getAllMessages: adminProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      const db_instance = await getDb();
      if (!db_instance) return [];
      return db_instance
        .select()
        .from(messages)
        .orderBy(desc(messages.createdAt))
        .limit(input.limit);
    }),

  getConversationMessages: adminProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      const db_instance = await getDb();
      if (!db_instance) return [];
      return db_instance
        .select()
        .from(messages)
        .where(eq(messages.conversationId, input.conversationId))
        .orderBy(desc(messages.createdAt));
    }),

  deleteMessage: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db_instance = await getDb();
      if (!db_instance) return false;
      
      await db_instance.update(messages)
        .set({ isDeleted: true })
        .where(eq(messages.id, input.id));
      return true;
    }),

  // ============ الشخصيات ============
  getAllCharacters: adminProcedure.query(async () => {
    const db_instance = await getDb();
    if (!db_instance) return [];
    return db_instance.select().from(characters).orderBy(desc(characters.createdAt));
  }),

  createCharacter: adminProcedure
    .input(
      z.object({
        name: z.string(),
        displayName: z.string(),
        avatarUrl: z.string(),
        description: z.string(),
        backstory: z.string(),
        personalityTraits: z.array(z.string()),
        isPremium: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const db_instance = await getDb();
      if (!db_instance) return null;
      
      const result = await db_instance.insert(characters).values({
        ...input,
        personalityTraits: input.personalityTraits,
        isActive: true,
      });
      return result;
    }),

  updateCharacter: adminProcedure
    .input(
      z.object({
        id: z.number(),
        displayName: z.string().optional(),
        description: z.string().optional(),
        isPremium: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db_instance = await getDb();
      if (!db_instance) return null;
      
      const { id, ...updateData } = input;
      await db_instance.update(characters).set(updateData).where(eq(characters.id, id));
      const results = await db_instance.select().from(characters).where(eq(characters.id, id)).limit(1);
      return results[0] || null;
    }),

  deleteCharacter: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db_instance = await getDb();
      if (!db_instance) return false;
      
      await db_instance.update(characters)
        .set({ isActive: false })
        .where(eq(characters.id, input.id));
      return true;
    }),

  // ============ الإحصائيات ============
  getStats: adminProcedure.query(async () => {
    const db_instance = await getDb();
    if (!db_instance) return null;
    
    const totalUsers = await db_instance.select().from(users);
    const totalMessages = await db_instance.select().from(messages);
    const totalConversations = await db_instance.select().from(conversations);
    const totalCharacters = await db_instance.select().from(characters);

    return {
      totalUsers: totalUsers.length,
      totalMessages: totalMessages.length,
      totalConversations: totalConversations.length,
      totalCharacters: totalCharacters.length,
      activeUsers: totalUsers.filter((u: any) => u.isActive).length,
      premiumUsers: totalUsers.filter((u: any) => u.subscriptionTier !== "free").length,
    };
  }),
};
