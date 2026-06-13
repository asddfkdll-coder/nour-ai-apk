import { useState, useEffect } from 'react';
import { useServerStatus } from '@/hooks/useServerStatus';
import { Button } from '@/components/ui/button';
import { Loader2, Server, Wifi, WifiOff } from 'lucide-react';

export const SplashScreen = ({ children }: { children: React.ReactNode }) => {
  const { isOnline, isChecking } = useServerStatus();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => { if (!isChecking) setShowSplash(false); }, 2000);
    return () => clearTimeout(timer);
  }, [isChecking]);

  if (!showSplash) return <>{children}</>;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center z-50">
      <div className="mb-8">
        <img src="/logo.png" alt="Nour AI" className="w-32 h-32 animate-pulse" 
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      </div>
      <h1 className="text-4xl font-bold text-white mb-2">نور AI</h1>
      <p className="text-purple-300 text-lg mb-8">رفيقك الذكي للتحدث من القلب</p>

      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
        {isChecking ? (
          <><Loader2 className="w-5 h-5 text-purple-400 animate-spin" /><span className="text-white">جاري التحقق...</span></>
        ) : isOnline ? (
          <><Wifi className="w-5 h-5 text-green-400" /><span className="text-green-400">السيرفر متصل</span></>
        ) : (
          <><WifiOff className="w-5 h-5 text-red-400" /><span className="text-red-400">السيرفر غير متصل</span></>
        )}
      </div>

      {!isOnline && !isChecking && (
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-gray-300 mb-4">يجب تشغيل السيرفر أولاً في Termux:</p>
          <code className="block bg-black/50 text-green-400 p-3 rounded-lg text-sm mb-4 text-right" dir="ltr">
            cd ~/projects && node dist/index.js
          </code>
          <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
            <Server className="w-4 h-4 ml-2" /> إعادة المحاولة
          </Button>
        </div>
      )}

      <div className="absolute bottom-8 flex gap-2">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};
export default SplashScreen;
