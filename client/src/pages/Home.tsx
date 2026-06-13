import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { offlineStorage } from "@/lib/offlineStorage";
import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, Star, Sparkles, WifiOff, LogOut, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [charactersList, setCharactersList] = useState<any[]>([]);
  const { data: serverCharacters, isLoading } = trpc.characters.list.useQuery(undefined, { enabled: isOnline });

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

  useEffect(() => {
    const loadCharacters = async () => {
      if (isOnline && serverCharacters) {
        setCharactersList(serverCharacters);
        await offlineStorage.saveCharacters(serverCharacters);
      } else {
        const localChars = await offlineStorage.getCharacters() as any[];
        if (localChars && localChars.length > 0) setCharactersList(localChars);
      }
    };
    loadCharacters();
  }, [isOnline, serverCharacters]);

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      {/* Navbar */}
      <nav className="border-b border-slate-800 sticky top-0 bg-slate-950/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary flex items-center gap-2">
            <img src="/logo.png" alt="Nour Logo" className="w-8 h-8 rounded-lg" />
            نور
          </div>
          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="hidden md:flex">لوحة التحكم</Button>
                {user?.role === 'admin' && (
                  <Button variant="ghost" onClick={() => setLocation("/admin")} className="text-amber-400">الإدارة</Button>
                )}
                <Avatar className="h-10 w-10 border border-primary/20 cursor-pointer" onClick={() => setLocation("/settings")}>
                  <AvatarImage src={user?.avatarUrl || ""} />
                  <AvatarFallback><UserIcon /></AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" onClick={() => logout()} className="text-slate-400 hover:text-red-400">
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <Button onClick={() => (window.location.href = getLoginUrl())} className="bg-primary hover:bg-primary/90 rounded-full px-6">
                تسجيل الدخول
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section with SoulChat Style */}
      <div className="relative overflow-hidden py-24 px-6 border-b border-slate-800">
        <div className="absolute inset-0 z-0">
          <img src="/hero-bg.png" alt="Background" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/80 to-slate-950"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="mb-8 animate-bounce">
             <img src="/logo.png" alt="Nour AI Logo" className="w-24 h-24 mx-auto rounded-3xl shadow-2xl shadow-primary/40 border-2 border-primary/20" />
          </div>
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary px-4 py-1 rounded-full bg-primary/5">
            <Sparkles className="w-3 h-3 ml-2" /> نور - تحدث من القلب
          </Badge>
          <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-primary to-purple-500">نور AI</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            اكتشف رفيقك الرقمي المثالي وتحدث بحرية تامة، في أي وقت، حتى بدون اتصال بالإنترنت.
          </p>
          
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
            <Input 
              placeholder="ابحث عن شخصية أو اهتمام..." 
              className="w-full h-16 bg-slate-900/80 border-slate-700 rounded-full pr-12 text-lg focus:ring-primary backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* Characters Grid */}
      <div className="max-w-7xl mx-auto py-20 px-6">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-black flex items-center gap-3 mb-3">
              <Star className="text-amber-400 h-10 w-10 fill-amber-400" />
              شخصيات SoulChat
            </h2>
            <p className="text-slate-400 text-lg">اختر شخصيتك المفضلة وابدأ رحلة الدردشة</p>
          </div>
          {!isOnline && (
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-4 py-2 text-md">
              <WifiOff className="w-5 h-5 ml-2" /> وضع عدم الاتصال
            </Badge>
          )}
        </div>

        {isLoading && isOnline ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-[450px] bg-slate-900 animate-pulse rounded-[2.5rem] border border-slate-800"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {charactersList.map((char) => (
              <Card 
                key={char.id} 
                className="group bg-slate-900 border-slate-800 hover:border-primary/50 transition-all duration-700 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-2xl hover:shadow-primary/20 flex flex-col"
                onClick={() => setLocation(`/chat/${char.id}`)}
              >
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src={char.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${char.name}`} 
                    alt={char.displayName} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent opacity-90"></div>
                  {char.isPremium && (
                    <Badge className="absolute top-5 left-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-none px-4 py-1.5 rounded-full font-bold text-xs shadow-lg">مميز</Badge>
                  )}
                  <div className="absolute bottom-6 right-6 left-6">
                    <h3 className="text-3xl font-black text-white mb-2 group-hover:text-primary transition-colors tracking-tight">
                      {char.displayName || char.name}
                    </h3>
                    <div className="flex gap-2 mb-2">
                       {char.personalityTraits?.slice(0, 2).map((trait: string) => (
                         <span key={trait} className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">{trait}</span>
                       ))}
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 flex-1">
                  <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
                    {char.description}
                  </p>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button className="w-full rounded-2xl bg-slate-800 hover:bg-primary hover:text-white transition-all duration-500 h-14 gap-3 font-black text-lg shadow-inner">
                    <MessageCircle className="w-6 h-6" />
                    دردشة الآن
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-slate-800 py-16 bg-slate-950 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="text-3xl font-black text-primary flex items-center justify-center gap-3 mb-6">
            <img src="/logo.png" alt="Nour Logo" className="w-10 h-10 rounded-xl" />
            نور AI
          </div>
          <div className="flex justify-center gap-8 mb-8 text-slate-500 font-medium">
            <a href="#" className="hover:text-white transition-colors">عن المنصة</a>
            <a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-white transition-colors">شروط الاستخدام</a>
          </div>
          <p className="text-slate-600 text-sm">© 2026 جميع الحقوق محفوظة لمنصة نور - رفيقك الذكي المعتمد على SoulChat</p>
        </div>
      </footer>
    </div>
  );
}
