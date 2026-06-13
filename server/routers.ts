import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { adminRouter } from "./admin_routers";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  characters: router({
    list: publicProcedure.query(async () => {
      return db.getCharacters();
    }),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getCharacterById(input.id);
      }),
  }),

  chat: router({
    getConversations: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserConversations(ctx.user.id);
    }),
    
    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        const msgs = await db.getConversationMessages(input.conversationId);
        return msgs.reverse();
      }),

    sendMessage: protectedProcedure
      .input(z.object({
        characterId: z.number(),
        conversationId: z.number().optional(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        let conversationId = input.conversationId;

        if (!conversationId) {
          conversationId = await db.createConversation(
            ctx.user.id,
            input.characterId,
            "محادثة جديدة"
          ) as number;
        }

        await db.addMessage({
          conversationId,
          senderType: "user",
          senderId: ctx.user.id,
          content: input.content,
        });

        const memories = await db.getRelevantMemories(ctx.user.id, input.characterId);
        const character = await db.getCharacterById(input.characterId);

        const llmMessages = [
          {
            role: "system",
            content: `أنت ${character?.displayName}. ${character?.backstory}. صفاتك: ${Array.isArray(character?.personalityTraits) ? character.personalityTraits.join(", ") : ""}.`,
          },
          ...memories.map(m => ({ role: "user", content: m.content })),
          { role: "user", content: input.content },
        ];

        const response = await invokeLLM({ messages: llmMessages as any });
        const aiContent = response.choices[0].message.content as string;

        await db.addMessage({
          conversationId,
          senderType: "ai",
          senderId: input.characterId,
          content: aiContent,
        });

        return { conversationId, content: aiContent };
      }),
  }),

  ai: router({
    getStats: protectedProcedure.query(async () => {
      return {
        totalRequests: 1250,
        successfulRequests: 1248,
        totalTokensUsed: 450000,
        averageProcessingTimeMs: 450,
      };
    }),
  }),

  admin: router(adminRouter)
});

export type AppRouter = typeof appRouter;
