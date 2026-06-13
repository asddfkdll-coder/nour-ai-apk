# هيكلية الكود - مشروع نور AI

## 📊 إحصائيات المشروع

- **ملفات TypeScript/React:** 77 ملف
- **ملفات الخادم:** 25 ملف
- **ملفات الإعدادات:** 10 ملفات
- **إجمالي الأسطر البرمجية:** ~15,000 سطر

---

## 🏗️ هيكل المشروع

```
nour-ai-app/
├── client/                          # الواجهة الأمامية (Frontend)
│   ├── src/
│   │   ├── pages/                   # صفحات التطبيق
│   │   │   ├── Home.tsx             # الصفحة الرئيسية
│   │   │   ├── AIChat.tsx           # صفحة الدردشة
│   │   │   ├── Dashboard.tsx        # لوحة التحكم
│   │   │   ├── ConversationHistory.tsx
│   │   │   ├── Settings.tsx         # الإعدادات
│   │   │   └── NotFound.tsx         # صفحة الخطأ 404
│   │   ├── components/              # المكونات القابلة لإعادة الاستخدام
│   │   │   ├── DashboardLayout.tsx  # تخطيط لوحة التحكم
│   │   │   ├── AIChatBox.tsx        # صندوق الدردشة
│   │   │   ├── ui/                  # مكونات Shadcn/UI
│   │   │   └── ...
│   │   ├── _core/                   # الأساسيات
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts       # Hook المصادقة
│   │   │   └── ...
│   │   ├── lib/                     # المكتبات المساعدة
│   │   │   ├── trpc.ts              # عميل tRPC
│   │   │   └── utils.ts
│   │   ├── App.tsx                  # التطبيق الرئيسي
│   │   ├── main.tsx                 # نقطة الدخول
│   │   └── index.css                # الأنماط العامة
│   └── public/                      # الملفات الثابتة
│
├── server/                          # الخادم (Backend)
│   ├── routers.ts                   # إجراءات tRPC
│   ├── db.ts                        # دوال قاعدة البيانات
│   ├── _core/                       # الأساسيات
│   │   ├── index.ts                 # نقطة دخول الخادم
│   │   ├── trpc.ts                  # إعداد tRPC
│   │   ├── context.ts               # سياق tRPC
│   │   ├── llm.ts                   # تكامل LLM
│   │   ├── oauth.ts                 # تكامل OAuth
│   │   ├── cookies.ts               # إدارة الكوكيز
│   │   ├── env.ts                   # متغيرات البيئة
│   │   ├── sdk.ts                   # SDK المصادقة
│   │   └── systemRouter.ts          # مسارات النظام
│   └── ...
│
├── drizzle/                         # قاعدة البيانات
│   ├── schema.ts                    # تعريفات الجداول
│   ├── relations.ts                 # العلاقات بين الجداول
│   ├── migrations/                  # ملفات الهجرة
│   └── meta/                        # بيانات وصفية
│
├── shared/                          # الأنواع المشتركة
│   ├── const.ts                     # الثوابت
│   └── types.ts                     # الأنواع
│
├── package.json                     # التبعيات
├── tsconfig.json                    # إعدادات TypeScript
├── vite.config.ts                   # إعدادات Vite
├── drizzle.config.ts                # إعدادات Drizzle
└── README.md                        # التوثيق
```

---

## 🔄 تدفق البيانات

```
المستخدم (Frontend)
    ↓
React Component
    ↓
tRPC Hook (useQuery/useMutation)
    ↓
tRPC Client
    ↓
HTTP Request → /api/trpc/*
    ↓
Express Server
    ↓
tRPC Router
    ↓
Protected/Public Procedure
    ↓
Database Query (Drizzle ORM)
    ↓
MySQL/TiDB Database
    ↓
Response → JSON
    ↓
tRPC Client
    ↓
React State Update
    ↓
UI Re-render
```

---

## 🔐 طبقات الأمان

1. **طبقة المصادقة (Authentication)**
   - OAuth 2.0 Integration
   - JWT Tokens
   - Session Cookies

2. **طبقة التفويض (Authorization)**
   - protectedProcedure
   - adminProcedure
   - Role-based Access Control

3. **طبقة التحقق (Validation)**
   - Zod Schema Validation
   - Input Sanitization
   - Type Safety

4. **طبقة الحماية (Protection)**
   - Rate Limiting
   - CSRF Protection
   - XSS Protection
   - Security Headers

---

## 📱 الصفحات الرئيسية

### 1. الصفحة الرئيسية (Home)
- عرض الشخصيات الرقمية المتاحة
- زر "ابدأ المحادثة" لكل شخصية
- معلومات عن كل شخصية

### 2. صفحة الدردشة (AIChat)
- واجهة دردشة متقدمة
- عرض سجل المحادثة
- حقل إدخال النص
- عرض الردود من الذكاء الاصطناعي

### 3. سجل المحادثات (History)
- قائمة بجميع المحادثات السابقة
- حذف المحادثات
- البحث عن محادثات

### 4. لوحة التحكم (Dashboard)
- إحصائيات الاستخدام
- الرسوم البيانية
- معلومات الحساب

### 5. الإعدادات (Settings)
- تغيير البيانات الشخصية
- تغيير اللغة
- إدارة الاشتراك

---

## 🛠️ التقنيات المستخدمة

### Frontend
- React 19
- TypeScript 5.9
- Tailwind CSS 4
- Vite 7
- tRPC 11
- Shadcn/UI
- Framer Motion

### Backend
- Express 4
- Node.js 22
- tRPC 11
- Drizzle ORM 0.44
- MySQL2 3.15

### Database
- TiDB Cloud
- MySQL 8.0 Compatible

### Tools
- pnpm (Package Manager)
- Prettier (Formatter)
- TypeScript (Type Checker)
- Vitest (Testing)

---

## 🚀 كيفية تشغيل المشروع

### التطوير
```bash
pnpm install
pnpm dev
```

### الإنتاج
```bash
pnpm build
pnpm start
```

### الاختبار
```bash
pnpm check
pnpm test
```

---

## 📝 ملفات مهمة

| الملف | الغرض |
|------|--------|
| `server/routers.ts` | تعريف جميع إجراءات tRPC |
| `server/db.ts` | دوال الوصول إلى قاعدة البيانات |
| `drizzle/schema.ts` | تعريف هيكل قاعدة البيانات |
| `client/src/App.tsx` | التطبيق الرئيسي والمسارات |
| `client/src/lib/trpc.ts` | إعداد عميل tRPC |
| `server/_core/index.ts` | نقطة دخول الخادم |

---

## ✅ الاختبارات

- ✅ Type Checking (TypeScript)
- ✅ Code Quality (Prettier, ESLint)
- ✅ Unit Tests (Vitest)
- ✅ Integration Tests (Manual)
- ✅ E2E Tests (Manual)

---

## 📚 الموارد الإضافية

- [React Documentation](https://react.dev)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [TypeScript Documentation](https://www.typescriptlang.org)
