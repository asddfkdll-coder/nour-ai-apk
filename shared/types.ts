export interface User { id: number; username: string; email: string; password_hash?: string; created_at?: string; }
export interface Character { id: number; name: string; description: string; avatar_url: string; personality: string; }
export interface Message { id: number; character_id: number; user_id: number; content: string; response: string | null; role: "user" | "ai"; created_at: string; }