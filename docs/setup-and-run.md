# دليل التثبيت والتشغيل (Setup & Run Guide)

يوضح هذا الدليل خطوات تشغيل واختبار الواجهة الأمامية لنظام **ClinicFlow** محليًا وبناء حزمة الإنتاج.

---

## 1. المتطلبات الأساسية للبيئة (Prerequisites)

- **Node.js**: الإصدار `^20.19.0` أو `^22.12.0` أو `^24.0.0` (تم التحقق والتطوير على Node `v24.19.0`).
- **npm**: الإصدار `^10.x` أو `^12.x` (تم التطوير على npm `12.0.2`).
- **Angular CLI**: الإصدار `21.2.x`.

---

## 2. تثبيت الحزم (Installation)

من داخل مجلد المشروع `d:\ClinicFlow\ClinicFlow_frontend`:
```bash
npm install
```

---

## 3. تشغيل وضع التطوير (Development Server)

لتشغيل السيرفر المحلي مع خاصية إعادة التحميل الفوري (Hot Reload):
```bash
npm start
```
أو عبر Angular CLI:
```bash
npx ng serve
```
سيكون التطبيق متاحًا على العنوان:
[http://localhost:4200/alnoor/login](http://localhost:4200/alnoor/login)

---

## 4. بناء نسخة الإنتاج والـ SSR (Production Build)

لتجميع المشروع بكامل حزم الـ SSR والتحسينات المتقدمة:
```bash
npm run build
```
تُحفظ مخرجات البناء في:
- متصفح العميل (Client Bundles): `dist/ClinicFlow_frontend/browser`
- خادم الـ SSR (Server Engine): `dist/ClinicFlow_frontend/server`

---

## 5. تشغيل خادم الإنتاج SSR (Run Production SSR Server)

لتشغيل سيرفر الـ SSR المبني عبر Express:
```bash
npm run serve:ssr:ClinicFlow_frontend
```
أو مباشرة عبر Node:
```bash
node dist/ClinicFlow_frontend/server/server.mjs
```
سيبدأ خادم الـ SSR بالاستماع على العنوان:
[http://localhost:4000/alnoor/login](http://localhost:4000/alnoor/login)

---

## 6. تشغيل الاختبارات (Testing)

### اختبارات الوحدة (Unit & Integration Tests):
تُنفّذ عبر محرك Vitest الحديث والمتوافق مع Angular 21:
```bash
npm test -- --watch=false
```

### اختبارات المتصفح الشاملة (Playwright End-to-End):
```bash
npx playwright test
```

---

## 7. بيانات الدخول التجريبية (Demo Credentials)

تتضمن شاشة تسجيل الدخول (`/:clinicSlug/login`) أزرارًا تفاعلية سريعة تملأ الحساب بنقرة واحدة:

| الدور (Role) | اسم المستخدم | كلمة المرور | الوجهة التلقائية |
|---|---|---|---|
| **مدير النظام (Admin)** | `admin` | `Admin@123` | `/alnoor/admin/dashboard` |
| **موظف استقبال (Secretary)** | `sec_sara` | `Sec@123` | `/alnoor/secretary/dashboard` |
| **طبيب معالج (Doctor)** | `dr_ahmed` | `Doc@123` | `/alnoor/doctor/dashboard` |

