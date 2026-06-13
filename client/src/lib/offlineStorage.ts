import localforage from "localforage";

// تهيئة مخزن البيانات المحلي للعمل بدون إنترنت
localforage.config({
  name: "NourAI",
  storeName: "offline_chats",
  description: "تخزين المحادثات والشخصيات محلياً للعمل بدون إنترنت",
});

export const offlineStorage = {
  // حفظ محادثة
  async saveConversation(id: string, data: any) {
    return await localforage.setItem(`conv_${id}`, data);
  },

  // استرجاع محادثة
  async getConversation(id: string) {
    return await localforage.getItem(`conv_${id}`);
  },

  // حفظ الرسائل
  async saveMessages(conversationId: string, messages: any[]) {
    return await localforage.setItem(`msgs_${conversationId}`, messages);
  },

  // استرجاع الرسائل
  async getMessages(conversationId: string) {
    return (await localforage.getItem(`msgs_${conversationId}`)) || [];
  },

  // حفظ قائمة الشخصيات
  async saveCharacters(characters: any[]) {
    return await localforage.setItem("characters_list", characters);
  },

  // استرجاع قائمة الشخصيات
  async getCharacters() {
    return (await localforage.getItem("characters_list")) || [];
  },
};
