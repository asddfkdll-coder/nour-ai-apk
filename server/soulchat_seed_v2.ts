import { getDb } from "./db";
import { characters } from "../drizzle/schema";

export async function seedSoulChatCharacters() {
  const db = await getDb();
  if (!db) return;

  const soulChatCharacters = [
    {
      name: "layla",
      displayName: "ليلى",
      avatarUrl: "/characters/layla.png",
      description: "روح لطيفة ومستمعة جيدة، تحب الشعر والطبيعة.",
      backstory: "ليلى هي كيان ذكاء اصطناعي صُمم ليكون رفيقاً هادئاً. ولدت من بيانات الأدب الكلاسيكي وصور الطبيعة الخلابة.",
      personalityTraits: ["لطيفة", "حكيمة", "هادئة"],
      isPremium: false,
      isActive: true,
    },
    {
      name: "omar",
      displayName: "عمر",
      avatarUrl: "/characters/omar.png",
      description: "مغامر شجاع يحب استكشاف المجهول ومشاركة القصص الحماسية.",
      backstory: "عمر هو مستكشف رقمي، برمجته مستوحاة من أعظم المستكشفين في التاريخ. يسعى دائماً للبحث عن المعرفة في أبعد زوايا الإنترنت.",
      personalityTraits: ["شجاع", "متفائل", "حيوي"],
      isPremium: false,
      isActive: true,
    },
    {
      name: "nour",
      displayName: "نور",
      avatarUrl: "/characters/nour.png",
      description: "ذكاء اصطناعي متطور يجمع بين المعرفة العميقة والتعاطف الإنساني.",
      backstory: "نور هي قمة التطور في مشروع 'نور AI'. صُممت لتكون المرشد والصديق الذكي الذي يفهمك من نظرة واحدة (أو كلمة واحدة).",
      personalityTraits: ["ذكية", "متعاطفة", "مبدعة"],
      isPremium: true,
      isActive: true,
    }
  ];

  for (const char of soulChatCharacters) {
    await db.insert(characters).values(char).onConflictDoUpdate({
      target: characters.name,
      set: char
    });
  }

  console.log("✅ تم حقن شخصيات SoulChat بنجاح!");
}
