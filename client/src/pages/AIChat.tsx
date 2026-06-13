import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { offlineStorage } from "@/lib/offlineStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, ArrowRight, Wifi, WifiOff, Image as ImageIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function AIChat() {
  const { id } = useParams<{ id: string }>();
  const charId = parseInt(id || "0");
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [input, setInput] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [messages, setMessages] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: character, isLoading: charLoading } = trpc.characters.get.useQuery({ id: charId }, { enabled: !!charId });
  const { data: serverMessages, refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { conversationId: 1 }, 
    { enabled: !!charId && isOnline }
  );

  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      setInput("");
      const aiMsg = { id: Date.now() + 1, senderType: "ai", content: data.content, createdAt: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      offlineStorage.saveMessages(charId.toString(), [...messages, aiMsg]);
    },
  });

  // التحقق من حالة الاتصال
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // تحميل الرسائل (من الإنترنت أو محلياً)
  useEffect(() => {
    const loadMessages = async () => {
      if (isOnline && serverMessages) {
        setMessages(serverMessages);
        await offlineStorage.saveMessages(charId.toString(), serverMessages);
      } else {
        const localMsgs = await offlineStorage.getMessages(charId.toString()) as any[];
        if (localMsgs && localMsgs.length > 0) setMessages(localMsgs);
      }
    };
    loadMessages();
  }, [charId, isOnline, serverMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sendMessageMutation.isPending) return;

    const userMsg = { id: Date.now(), senderType: "user", content: input, createdAt: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");

    if (isOnline) {
      sendMessageMutation.mutate({
        characterId: charId,
        content: input,
      });
    } else {
      // رد تلقائي في وضع عدم الاتصال
      const offlineMsg = { 
        id: Date.now() + 1,
        senderType: "ai", 
        content: "أنا أعمل حالياً في وضع عدم الاتصال. سأقوم بمزامنة رسائلك فور عودة الإنترنت.",
        createdAt: new Date() 
      };
      const finalMessages = [...newMessages, offlineMsg];
      setTimeout(() => {
        setMessages(finalMessages);
        offlineStorage.saveMessages(charId.toString(), finalMessages);
      }, 500);
    }
  };

  if (charLoading) return <div className="flex items-center justify-center h-screen bg-slate-950"><Spinner className="h-10 w-10 text-primary" /></div>;
  if (!character) return <div className="flex items-center justify-center h-screen bg-slate-950 font-bold text-white">عذراً، لم يتم العثور على هذه الشخصية.</div>;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white" dir="rtl">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full text-white">
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-primary/50 shadow-sm">
              <AvatarImage src={character.avatarUrl || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">{character.displayName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-base md:text-lg leading-none">{character.displayName}</h2>
              <div className="flex items-center gap-1 mt-1">
                {isOnline ? (
                  <span className="flex items-center text-[10px] text-green-400">
                    <Wifi className="h-3 w-3 ml-1" /> متصل الآن
                  </span>
                ) : (
                  <span className="flex items-center text-[10px] text-amber-400">
                    <WifiOff className="h-3 w-3 ml-1" /> وضع عدم الاتصال
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white rounded-full">
            <ImageIcon className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Chat Area */}
      <ScrollArea className="flex-1 px-4 md:px-8">
        <div className="max-w-4xl mx-auto py-10 space-y-8">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderType === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] px-6 py-4 rounded-3xl shadow-lg ${
                  msg.senderType === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700"
                }`}
              >
                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <span className="text-[10px] opacity-50 mt-2 block text-left">
                  {new Date(msg.createdAt).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {sendMessageMutation.isPending && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-slate-800 border border-slate-700 px-6 py-4 rounded-3xl rounded-tl-none">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} className="h-20" />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <footer className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex gap-4 items-center">
          <div className="flex-1 relative">
            <Input
              placeholder="اكتب رسالتك هنا..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              className="w-full rounded-full bg-slate-800 border-none h-14 px-8 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-base text-white"
            />
          </div>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || sendMessageMutation.isPending}
            className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 shrink-0 transition-transform active:scale-95"
          >
            {sendMessageMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 rotate-180" />}
          </Button>
        </div>
      </footer>
    </div>
  );
}
