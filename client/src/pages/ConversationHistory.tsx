import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { MessageSquare, ArrowRight, Search } from "lucide-react";

export default function ConversationHistory() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);

  // Real data fetch
  const { data: conversations, isLoading } = trpc.chat.getConversations.useQuery();

  const filteredConversations = conversations?.filter((conv) =>
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">سجل المحادثات</h1>
        </div>
      </nav>

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card className="p-6 shadow-sm border-border">
                <div className="relative mb-6">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث في المحادثات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 rounded-full"
                  />
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
                    ))
                  ) : filteredConversations?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد محادثات مطابقة
                    </div>
                  ) : (
                    filteredConversations?.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setLocation(`/chat/${conv.characterId}`)}
                        className="w-full text-right p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-foreground truncate">{conv.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(conv.updatedAt).toLocaleDateString("ar-SA")}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <Button
                  onClick={() => setLocation("/")}
                  className="w-full mt-6 bg-primary hover:bg-primary/90 rounded-full py-6 font-bold"
                >
                  ابدأ محادثة جديدة
                </Button>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="p-12 text-center border-2 border-dashed border-border flex flex-col items-center justify-center min-h-[50vh] rounded-3xl">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                  <MessageSquare className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">اختر محادثة للمتابعة</h3>
                <p className="text-muted-foreground max-w-xs">
                  يمكنك العودة إلى أي محادثة سابقة ومتابعة الحوار من حيث توقفت.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
