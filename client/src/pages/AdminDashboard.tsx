import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, Zap, Settings, BarChart3, Trash2, Edit2, Plus, Search } from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("stats");
  const [searchQuery, setSearchQuery] = useState("");

  // Queries
  const { data: stats } = trpc.admin.getStats.useQuery();
  const { data: users } = trpc.admin.getAllUsers.useQuery();
  const { data: messages } = trpc.admin.getAllMessages.useQuery({ limit: 100 });
  const { data: characters } = trpc.admin.getAllCharacters.useQuery();

  // Mutations
  const deleteUserMutation = trpc.admin.deleteUser.useMutation();
  const deleteCharacterMutation = trpc.admin.deleteCharacter.useMutation();
  const deleteMessageMutation = trpc.admin.deleteMessage.useMutation();

  const handleDeleteUser = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      deleteUserMutation.mutate({ id });
    }
  };

  const handleDeleteCharacter = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الشخصية؟")) {
      deleteCharacterMutation.mutate({ id });
    }
  };

  const handleDeleteMessage = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الرسالة؟")) {
      deleteMessageMutation.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Settings className="w-8 h-8 text-primary" />
          لوحة تحكم المدير
        </h1>
        <p className="text-slate-400">إدارة شاملة للمستخدمين والرسائل والشخصيات</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">إجمالي المستخدمين</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">المستخدمون النشطون</p>
                  <p className="text-3xl font-bold text-green-400">{stats.activeUsers}</p>
                </div>
                <Zap className="w-8 h-8 text-green-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">المستخدمون المميزون</p>
                  <p className="text-3xl font-bold text-amber-400">{stats.premiumUsers}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-amber-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">إجمالي الرسائل</p>
                  <p className="text-3xl font-bold text-blue-400">{stats.totalMessages}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">الشخصيات</p>
                  <p className="text-3xl font-bold text-purple-400">{stats.totalCharacters}</p>
                </div>
                <Zap className="w-8 h-8 text-purple-400/50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-900 border-b border-slate-800 w-full justify-start rounded-none">
          <TabsTrigger value="stats" className="data-[state=active]:bg-primary">إحصائيات</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-primary">المستخدمون</TabsTrigger>
          <TabsTrigger value="messages" className="data-[state=active]:bg-primary">الرسائل</TabsTrigger>
          <TabsTrigger value="characters" className="data-[state=active]:bg-primary">الشخصيات</TabsTrigger>
        </TabsList>

        {/* Stats Tab */}
        <TabsContent value="stats" className="mt-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>ملخص النظام</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-sm">إجمالي المحادثات</p>
                  <p className="text-2xl font-bold text-primary">{stats?.totalConversations || 0}</p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-sm">معدل النشاط</p>
                  <p className="text-2xl font-bold text-green-400">
                    {stats ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-6 space-y-4">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="ابحث عن مستخدم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-800 border-slate-700 pr-10"
              />
            </div>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" />
              مستخدم جديد
            </Button>
          </div>

          {users?.map((user: any) => (
            <Card key={user.id} className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{user.name}</h3>
                    <p className="text-slate-400 text-sm">{user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "نشط" : "معطل"}
                      </Badge>
                      <Badge variant="outline">{user.subscriptionTier}</Badge>
                      {user.role === "admin" && <Badge className="bg-amber-600">مدير</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" className="text-blue-400 hover:bg-blue-500/10">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-400 hover:bg-red-500/10"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="mt-6 space-y-4">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="ابحث عن رسالة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-800 border-slate-700 pr-10"
              />
            </div>
          </div>

          {messages?.slice(0, 20).map((msg: any) => (
            <Card key={msg.id} className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-slate-300 mb-2">{msg.content}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {msg.senderType === "user" ? "مستخدم" : "AI"}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(msg.createdAt).toLocaleString("ar-EG")}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDeleteMessage(msg.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Characters Tab */}
        <TabsContent value="characters" className="mt-6 space-y-4">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="ابحث عن شخصية..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-800 border-slate-700 pr-10"
              />
            </div>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" />
              شخصية جديدة
            </Button>
          </div>

          {characters?.map((char: any) => (
            <Card key={char.id} className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <img
                      src={char.avatarUrl}
                      alt={char.displayName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-lg">{char.displayName}</h3>
                      <p className="text-slate-400 text-sm line-clamp-2">{char.description}</p>
                      <div className="flex gap-2 mt-2">
                        {char.isPremium && <Badge className="bg-amber-600">مميز</Badge>}
                        <Badge variant={char.isActive ? "default" : "secondary"}>
                          {char.isActive ? "نشط" : "معطل"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" className="text-blue-400 hover:bg-blue-500/10">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-400 hover:bg-red-500/10"
                      onClick={() => handleDeleteCharacter(char.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
