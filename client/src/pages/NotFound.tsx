import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <FileQuestion className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-8xl font-black text-primary/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
            404
          </h1>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-foreground">عذراً، الصفحة غير موجودة</h2>
          <p className="text-muted-foreground">
            يبدو أن الرابط الذي تحاول الوصول إليه غير صحيح أو تم نقله لمكان آخر.
          </p>
        </div>

        <Button 
          onClick={() => setLocation("/")} 
          className="w-full py-8 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 flex gap-3"
        >
          <Home className="h-5 w-5" />
          العودة للرئيسية
        </Button>
      </div>
    </div>
  );
}
