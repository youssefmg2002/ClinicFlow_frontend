# أمان وتصيير الخادم في ClinicFlow (SSR & Security Architecture)

يعتمد تطبيق ClinicFlow على تصيير الخادم **Angular SSR** المدمج بحزمة `@angular/ssr` لتقديم أفضل أداء ممكن وسرعة تحميل للواجهات الطبية مع الحفاظ على خصوصية بيانات المرضى.

---

## 1. استراتيجية التصيير (Server Routing Strategy)

في التطبيقات الطبية والتجارية متعددة المستأجرين، **يُمنع منعًا باتًا** استخدام `RenderMode.Prerender` للمسارات الحاملة لبيانات المرضى والمستأجرين، لأن ذلك قد يؤدي إلى حفظ صفحات تحتوي بيانات حساسة ضمن ملفات HTML الساكنة التي يمكن تخزينها في الـ CDN.

لذلك تم ضبط `src/app/app.routes.server.ts` على النمط الديناميكي الصارم:
```typescript
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
```

هذا يضمن:
1. توليد الصفحات لكل طلب مستخدم في وقت التنفيذ (Runtime) بشكل معزول ومحمي.
2. عدم تسرّب أي بيانات جلسة من مستأجر إلى مستأجر آخر.

---

## 2. قواعد الأمان أثناء تصيير الخادم (SSR Safety Rules)

1. **الامتناع عن كائنات المتصفح المباشرة**:
   - لا يتم استدعاء كائنات مثل `window` أو `document` أو `sessionStorage` أو `localStorage` في الدوال البنائية (`constructors`) للمكونات أو الخدمات المشتركة.
   - في خدمة `AuthService`، يتم فحص البيئة باستخدام توجيه Angular القياسي:
     ```typescript
     if (isPlatformBrowser(this.platformId)) {
       sessionStorage.getItem(environment.sessionStorageKey);
     }
     ```
2. **التحميل الآمن لمكتبات الرسوم البيانية**:
   - تم تهيئة مكتبة `ngx-echarts` للتحميل الكسول المتوافق مع المتصفح عبر:
     ```typescript
     provideEchartsCore({
       echarts: () => import('echarts')
     })
     ```
3. **عزل ترويسات التخزين المؤقت (No-Cache Headers)**:
   - كافة الصفحات الطبية ولوحات التحكم ترسل ترويسات تمنع التخزين الوسيط:
     ```http
     Cache-Control: private, no-cache, no-store, must-revalidate
     Pragma: no-cache
     ```

