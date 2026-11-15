# دليل المسارات ومصفوفة الصلاحيات في ClinicFlow (Routes & Permissions)

يلتزم نظام ClinicFlow بفصل كامل وصارم بين صلاحيات وأدوار مستخدمي النظام الثلاثة:
1. **مدير النظام (Admin)**
2. **موظف الاستقبال (Secretary)**
3. **الطبيب المعالج (Doctor)**

---

## 1. شجرة المسارات وحراس الوصول (Route Tree)

| المسار (Path) | الحراس (Guards) | الأدوار المسموح بها | وصف الصفحة |
|---|---|---|---|
| `/:clinicSlug/login` | لا يوجد | الجميع | تسجيل الدخول مع بطاقات Demo السريعة |
| `/:clinicSlug/profile` | `authGuard` | Admin, Doctor, Secretary | إدارة الملف الشخصي (الاسم والهاتف والبريد) |
| `/:clinicSlug/change-password` | `authGuard` | Admin, Doctor, Secretary | تغيير كلمة المرور الذاتية |
| **لوحة الإدارة** | | | |
| `/:clinicSlug/admin/dashboard` | `authGuard, roleGuard` | Admin | الإحصائيات الشاملة، الرسوم البيانية، الملخص المالي |
| `/:clinicSlug/admin/doctors` | `authGuard, roleGuard` | Admin | إدارة الأطباء، التخصص الرئيسي، استعادة كلمة المرور |
| `/:clinicSlug/admin/secretaries` | `authGuard, roleGuard` | Admin | إدارة السكرتارية وتعيين صلاحيات الأطباء المسموح بهم |
| `/:clinicSlug/admin/specialties` | `authGuard, roleGuard` | Admin | إدارة التخصصات الطبية وربطها بالعيادة |
| `/:clinicSlug/admin/patients` | `authGuard, roleGuard` | Admin | السجل الإداري للمرضى (محجوب تمامًا عن السجلات السريرية) |
| `/:clinicSlug/admin/appointments` | `authGuard, roleGuard` | Admin | سجل كافة الحجوزات مع فلترة الأطباء والأيام |
| `/:clinicSlug/admin/pricing` | `authGuard, roleGuard` | Admin | تسعير الكشف والاستشارة لكل طبيب وتوثيق اللائحة |
| `/:clinicSlug/admin/special-pricing` | `authGuard, roleGuard` | Admin | نظام التخفيضات ومراجعة تقرير تدقيق الخصومات |
| `/:clinicSlug/admin/schedules` | `authGuard, roleGuard` | Admin | جدول الدوام الأسبوعي وإجازات الأطباء الاستثنائية |
| `/:clinicSlug/admin/reports` | `authGuard, roleGuard` | Admin | التقارير المالية التفصيلية وتوزيع إيرادات الأطباء |
| `/:clinicSlug/admin/settings` | `authGuard, roleGuard` | Admin | بيانات وهوية وشعار ومعلومات التواصل للعيادة |
| `/:clinicSlug/admin/subscription` | `authGuard, roleGuard` | Admin | تفاصيل اشتراك باقة ClinicFlow Pro والترقية |
| **مكتب الاستقبال** | | | |
| `/:clinicSlug/secretary/dashboard` | `authGuard, roleGuard` | Secretary | ملخص الطابور اليومي والعمليات السريعة |
| `/:clinicSlug/secretary/queue` | `authGuard, roleGuard` | Secretary | إدارة طابور الانتظار (حضور، تأخر، إعادة للطابور، إلغاء) |
| `/:clinicSlug/secretary/booking` | `authGuard, roleGuard` | Secretary | حجز موعد جديد، اختيار الطبيب، تحديد الدور الآلي |
| `/:clinicSlug/secretary/payments` | `authGuard, roleGuard` | Secretary | سداد الرسوم الكاملة، إلغاء السداد في نفس اليوم |
| `/:clinicSlug/secretary/patients` | `authGuard, roleGuard` | Secretary | إدارة المرضى وتحديد نوع الحالة (متابعة / جديد) |
| `/:clinicSlug/secretary/follow-up-treatment` | `authGuard, roleGuard` | Secretary | تسجيل أدوية المتابعة حصريًا لمرضى المتابعة |
| **العيادة السريرية (الطبيب)** | | | |
| `/:clinicSlug/doctor/dashboard` | `authGuard, roleGuard` | Doctor | طابور مرضى عيادة الطبيب المعالج فقط |
| `/:clinicSlug/doctor/appointments` | `authGuard, roleGuard` | Doctor | استعراض مواعيد الطبيب السابقة والحالية |
| `/:clinicSlug/doctor/visit` | `authGuard, roleGuard` | Doctor | شاشة الكشف السريري والتشخيص وصلاحية الاستشارة |
| `/:clinicSlug/doctor/health-profile` | `authGuard, roleGuard` | Doctor | تحرير الحساسيات والأمراض المزمنة والملاحظات الطبية |
| `/:clinicSlug/doctor/medical-history` | `authGuard, roleGuard` | Doctor | التاريخ السريري الموحد للزيارات عبر كافة تخصصات العيادة |

---

## 2. مصفوفة قواعد الخصوصية الصارمة (Privacy Rules Matrix)

1. **مدير النظام (Admin Privacy Boundary)**:
   - **يُمنع منعًا باتًا** من الاطلاع على التشخيصات الطبية، الملف الصحي للأمراض المزمنة، أو تفاصيل أدوية المرضى.
   - شاشة سجل المرضى الإدارية تعرض فقط الاسم، الهاتف، العمر، وحالة النشاط.
2. **الطبيب المعالج (Doctor Privacy Boundary)**:
   - **يُمنع منعًا باتًا** من رؤية رقم الهاتف الشخصي للمريض أو رقم بطاقة المتابعة في كافة واجهات الطبيب (شاشة الكشف، التاريخ المرضي، الملف الصحي).
   - لا يستطيع الطبيب بدء الكشف أو إنهاء الزيارة الطبية إلا بعد تأكيد السداد (`PaidStatus === 'Paid'`).
3. **موظف الاستقبال (Secretary Privacy Boundary)**:
   - يرى فقط الأطباء المصرح له بإدارتهم (`permittedDoctors`).
   - لا يحدد التخصص الطبي عند الحجز، بل يختار الطبيب المعالج مباشرة.
   - تسجيل الأدوية الرقمية متاح حصريًا لمرضى المتابعة (`IsFollowUp === true`)، في حين يستخدم مرضى الكشف الجديد الروشتة الورقية المعتادة.

