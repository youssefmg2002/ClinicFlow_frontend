# معمارية الواجهة الأمامية لنظام ClinicFlow (Frontend Architecture)

تم بناء الواجهة الأمامية لنظام **ClinicFlow** باستخدام **Angular 21** بالكامل، بالاعتماد على أحدث ممارسات الويب ومعايير الأداء والأمان المؤسسي للعيادات الطبية.

---

## 1. المكونات التقنية الأساسية (Tech Stack)

| التقنية / المكتبة | الإصدار | الغرض والاستخدام |
|---|---|---|
| **Angular** | `21.2.x` | إطار العمل الأساسي بتقنية Standalone Components وSignals |
| **@angular/ssr** | `21.2.x` | تصيير الخادم (Server-Side Rendering) ودعم Hydration |
| **Tailwind CSS** | `v4.1.x` | التنسيق الشامل ودعم RTL ونظام Design Tokens |
| **@fontsource/cairo** | `^5.3.0` | تضمين خط Cairo محليًا لضمان الاستقلالية وعدم الاعتماد على Google Fonts |
| **@lucide/angular** | `^1.66.0` | حزمة الأيقونات الرسمية الحديثة والموحدة |
| **ngx-echarts & echarts** | `^21.0.0` / `^6.1.0` | الرسوم البيانية التفاعلية للوحة الإدارة والتقارير المالية |
| **Vitest** | `^4.0.8` | إطار اختبارات الوحدة السريع والمتوافق مع Angular 21 |
| **Playwright** | `^1.64.1` | إطار اختبارات End-to-End الشاملة لسيناريوهات المتصفح |

---

## 2. الهيكل المعماري للمشروع (Folder Structure)

```text
src/
├── app/
│   ├── core/                        # البنية الأساسية العامة
│   │   ├── auth/                    # خدمة المصادقة، وإدارة الرموز والجلسات
│   │   ├── guards/                  # حراس المسارات (AuthGuard, RoleGuard, TenantResolver)
│   │   ├── http/                    # محاكي التطوير (Mock Data Engine)
│   │   ├── interceptors/            # معترضات HTTP (Auth, CorrelationId, Error, MockDev)
│   │   ├── layout/                  # التخطيطات الرئيسية (Admin, Secretary, Doctor Layouts)
│   │   ├── services/                # عميل الـ API الموحد وإدارة الإشعارات
│   │   └── tenant/                  # إدارة العيادة المتعددة (Multi-tenancy context)
│   ├── features/                    # موديولات الشاشات حسب الأدوار والوظائف
│   │   ├── admin/                   # 12 شاشة لإدارة العيادة (أطباء، موظفين، أسعار، تقارير...)
│   │   ├── secretary/               # شاشات الاستقبال (الطابور، الحجز، الدفع، أدوية المتابعة...)
│   │   ├── doctor/                  # شاشات الطبيب (الطابور السريري، الكشف، الملف الصحي، السجل...)
│   │   ├── auth/                    # شاشة تسجيل الدخول المقسمة والحديثة
│   │   └── shared-pages/            # صفحات الحساب والأخطاء (الملف الشخصي، تغيير كلمة المرور، 404، 403، 500)
│   ├── shared/                      # المكونات والنماذج المشتركة
│   │   ├── components/              # المكونات التفاعلية (Badges, Skeletons, ConfirmDialogs, Headers...)
│   │   └── models/                  # العقود والنماذج المكتوبة بالكامل (TypeScript DTOs)
│   ├── app.config.ts                # تهيئة مزودي التطبيق (Router, HttpClient, Hydration, Echarts)
│   ├── app.config.server.ts         # تهيئة مزودي تصيير الخادم (SSR)
│   ├── app.routes.ts                # شجرة المسارات المحمية مع التحميل الكسول (Lazy Chunks)
│   └── app.routes.server.ts         # استراتيجية تصيير الخادم (RenderMode.Server)
```

---

## 3. نمط إدارة الحالة (State Management)

1. **Angular Signals (`signal`, `computed`)**:
   - الحالة المحلية لكل شاشة وحالة الجلسة المشتركة (`currentUser`, `clinicSlug`, `isAuthenticated`) تدار باستخدام الـ Signals لضمان تحديث فوري ودقيق للـ DOM بدون حمل زائد.
2. **RxJS**:
   - مخصص حصريًا للعمليات غير المتزامنة لطلبات الشبكة (`HttpClient`) وتتبع الأخطاء والتنقلات.

---

## 4. معمارية تعدد المستأجرين (Multi-Tenancy)

- يعتمد النظام مسار عنوان URL بادئ باسم العيادة (`/:clinicSlug/...`).
- يتولى `tenantResolver` استخلاص معرّف العيادة وتمريره إلى `TenantService`.
- كافة طلبات الـ HTTP يتم توجيهها تلقائيًا تحت البادئة `/api/{clinicSlug}/...`.
- يتم عزل جلسات التخزين ومفاتيح المتصفح لضمان عدم تداخل بيانات مستأجر مع آخر.

---

## 5. خط أنابيب معالجة الـ HTTP (Interceptors Pipeline)

تعمل طلبات الـ HTTP عبر سلسلة Interceptors وظيفية بالترتيب التالي:
1. **`correlationInterceptor`**: يُولّد معرّف تتبع فريد (`X-Correlation-ID`) لكل طلب لمطابقته في سجلات التدقيق بالخادم.
2. **`authInterceptor`**: يضيف ترويسة التخويل `Authorization: Bearer <token>` للطلبات المحمية تلقائيًا.
3. **`errorInterceptor`**: يلتقط الأخطاء الموحدة للـ API ويعرض رسائل تنبيهية بالعربية عبر `ToastService`، ويحوّل المستخدم لصفحة تسجيل الدخول عند انتهاء الجلسة (`401`) أو صفحة الحظر عند غياب الصلاحية (`403`).
4. **`mockDevInterceptor`**: محاكي تطوير متكامل ومحلي، يعمل تلقائيًا في وضع التطوير المحلي عند تعذر الاتصال بالخادم، ومعطل تمامًا وبصرامة في وضع الإنتاج (`environment.production.ts`).

