# تكامل الواجهة الأمامية مع الـ API (API Integration Guide)

تم تصميم طبقة الربط الشبكي في ClinicFlow لتكون متوافقة بنسبة 100% مع مواصفات وعقود مشروع الـ Backend `.NET API` الموجود في `ClinicFlow_API`.

---

## 1. بنية عناوين الـ API المتعددة المستأجرين (Multi-Tenant Endpoints)

كافة المسارات تبدأ ببادئة العيادة المحددة:
```http
POST   /api/{clinicSlug}/auth/login
GET    /api/{clinicSlug}/auth/me
PUT    /api/{clinicSlug}/auth/me/profile
POST   /api/{clinicSlug}/auth/me/change-password

GET    /api/{clinicSlug}/dashboard/daily-stats
GET    /api/{clinicSlug}/dashboard/revenue-last-7-days
GET    /api/{clinicSlug}/dashboard/doctors-performance
GET    /api/{clinicSlug}/dashboard/financial-summary

GET    /api/{clinicSlug}/doctors
POST   /api/{clinicSlug}/doctors
PUT    /api/{clinicSlug}/doctors/{id}
POST   /api/{clinicSlug}/doctors/{id}/reset-password
GET    /api/{clinicSlug}/doctors/{id}/weekly-schedule
PUT    /api/{clinicSlug}/doctors/{id}/weekly-schedule

GET    /api/{clinicSlug}/secretaries
PUT    /api/{clinicSlug}/secretaries/{secretaryUserId}/doctor-permissions

GET    /api/{clinicSlug}/appointments
POST   /api/{clinicSlug}/appointments/book
POST   /api/{clinicSlug}/appointments/{id}/check-in
POST   /api/{clinicSlug}/appointments/{id}/mark-late
POST   /api/{clinicSlug}/appointments/{id}/return-to-queue
POST   /api/{clinicSlug}/appointments/{id}/cancel
POST   /api/{clinicSlug}/appointments/{id}/pay
POST   /api/{clinicSlug}/appointments/{id}/reverse-payment

GET    /api/{clinicSlug}/medical-visits/{appointmentId}/workspace
POST   /api/{clinicSlug}/medical-visits/{appointmentId}/complete
GET    /api/{clinicSlug}/patients/{patientId}/health-profile
POST   /api/{clinicSlug}/patients/{patientId}/health-profile
GET    /api/{clinicSlug}/patients/{patientId}/history
```

---

## 2. إدارة جلسات المصادقة (JWT & Refresh Token Flow)

- تستقبل الواجهة عند تسجيل الدخول `accessToken` و`refreshToken` وكائن بيانات المستخدم `CurrentUserProfileDto`.
- يتم حفظ الجلسة في `sessionStorage` (داخل المتصفح فقط وبشكل آمن من ناحية الـ SSR).
- ترويسة التخويل القياسية:
  ```http
  Authorization: Bearer <accessToken>
  ```
- معرّف تتبع العمليات:
  ```http
  X-Correlation-ID: <uuid-v4>
  ```

---

## 3. محاكي التطوير الذكي (Mock Development Adapter)

لتمكين فريق الواجهة الأمامية من تشغيل واختبار كامل السيناريوهات والشاشات دون الحاجة لتشغيل الخادم المحلي، تم بناء محاكي تطوير متكامل داخل `src/app/core/interceptors/mock-dev.interceptor.ts`:

- **حفظ الحالة في الذاكرة (Stateful Memory Store)**:
  - إضافة طبيب أو سكرتيرة تظهر فورًا في الجداول.
  - حجز مريض يولد رقم دور تتابعي ذري (`Atomic Queue Number`).
  - تسجيل حضور مريض أو تأخره يحدث شاشات الطابور مباشرة.
  - سداد الرسوم يفعل فحص الكشف ويسمح للطبيب بإنهاء الزيارة.
- **الحماية الصارمة لبيئة الإنتاج (Production Safeguard)**:
  - يتم استيراد `mockDevInterceptor` فقط في بيئة التطوير. في ملف `environment.production.ts` تكون خاصية `enableDevMock: false` مما يمنع تشغيل أي بيانات وهمية في بيئات الإنتاج تمامًا.

