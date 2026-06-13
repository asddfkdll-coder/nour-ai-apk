import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowRight, Activity, Zap, Users, ShieldCheck } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: stats } = trpc.ai.getStats.useQuery();

  const taskTypeData = [
    { name: "دردشة", value: 65, color: "#3b82f6" },
    { name: "تحليل", value: 20, color: "#8b5cf6" },
    { name: "أخرى", value: 15, color: "#10b981" },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">الإحصائيات</h1>
        </div>
      </nav>

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="text-sm font-bold text-muted-foreground">إجمالي الرسائل</div>
              </div>
              <div className="text-3xl font-bold">{stats?.totalRequests || 0}</div>
            </Card>

            <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="text-sm font-bold text-muted-foreground">الرموز المستهلكة</div>
              </div>
              <div className="text-3xl font-bold">{stats?.totalTokensUsed || 0}</div>
            </Card>

            <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="text-sm font-bold text-muted-foreground">معدل الاستجابة</div>
              </div>
              <div className="text-3xl font-bold">99.9%</div>
            </Card>

            <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <Users className="h-5 w-5" />
                </div>
                <div className="text-sm font-bold text-muted-foreground">التفاعل اليومي</div>
              </div>
              <div className="text-3xl font-bold">نشط</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-8">
              <h3 className="text-lg font-bold mb-6">توزيع الاستخدام</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taskTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {taskTypeData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">التقارير التفصيلية</h3>
              <p className="text-muted-foreground max-w-xs mb-6">
                قريباً ستتمكن من تصدير تقارير مفصلة عن تفاعلاتك مع الشخصيات المختلفة.
              </p>
              <Button disabled variant="outline" className="rounded-full">قريباً</Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
