import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useLocation } from "wouter";
import { ArrowRight, Save, User, Settings as SettingsIcon, Bell } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [enableMemory, setEnableMemory] = useState(true);

  const handleSaveSettings = async () => {
    localStorage.setItem(
      "nour_user_settings",
      JSON.stringify({ temperature, maxTokens, enableMemory })
    );
    toast.success("تم حفظ التفضيلات بنجاح");
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">الإعدادات</h1>
        </div>
      </nav>

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 gap-8">
            {/* Profile Section */}
            <Card className="p-8 shadow-sm">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 overflow-hidden">
                  {user?.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <User className="h-10 w-10 text-primary" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user?.name || "مستخدم نور"}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">الاسم المعروض</label>
                  <Input defaultValue={user?.name || ""} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">اللغة المفضلة</label>
                  <Input defaultValue="العربية" disabled className="rounded-xl bg-muted" />
                </div>
              </div>
            </Card>

            {/* AI Settings */}
            <Card className="p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <SettingsIcon className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold">تفضيلات المحادثة</h2>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="font-bold">مستوى الإبداع (Temperature)</label>
                    <span className="text-primary font-mono">{temperature.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[temperature]}
                    onValueChange={(val) => setTemperature(val[0])}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    القيم المنخفضة تعطي إجابات أكثر دقة، والقيم العالية تعطي إجابات أكثر إبداعاً.
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                  <div>
                    <p className="font-bold">تفعيل الذاكرة الطويلة</p>
                    <p className="text-xs text-muted-foreground">تسمح للشخصيات بتذكر تفضيلاتك وتاريخك.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableMemory}
                    onChange={(e) => setEnableMemory(e.target.checked)}
                    className="w-6 h-6 rounded-lg accent-primary"
                  />
                </div>
              </div>
            </Card>

            {/* Notifications */}
            <Card className="p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold">التنبيهات</h2>
              </div>
              <p className="text-muted-foreground text-sm mb-4">إدارة كيفية تلقي التحديثات والتنبيهات من المنصة.</p>
              <Button variant="outline" className="rounded-full w-full">إدارة التنبيهات</Button>
            </Card>

            <Button
              onClick={handleSaveSettings}
              className="w-full py-8 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 flex gap-3"
            >
              <Save className="h-5 w-5" />
              حفظ كافة التغييرات
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
