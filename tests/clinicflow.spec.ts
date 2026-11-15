import { test, expect } from '@playwright/test';

test.describe('ClinicFlow End-to-End Suite', () => {

  test('1. Root URL redirects to tenant login page with RTL Arabic layout', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/alnoor\/login/);

    const htmlDir = await page.getAttribute('html', 'dir');
    expect(htmlDir).toBe('rtl');

    // Branding checks
    await expect(page.locator('text=ClinicFlow')).toBeVisible();
    await expect(page.locator('text=إدارة عيادتك .. بكل سهولة')).toBeVisible();
    await expect(page.locator('input[name="userName"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('2. Admin login redirects to Admin Dashboard with full management navigation', async ({ page }) => {
    await page.goto('/alnoor/login');

    // Click demo admin chip
    await page.locator('button:has-text("مدير النظام (Admin)")').click();
    await expect(page.locator('input[name="userName"]')).toHaveValue('admin');
    await expect(page.locator('input[name="password"]')).toHaveValue('Admin@123');

    // Submit login
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/alnoor\/admin\/dashboard/);

    // Verify Admin Layout & Dashboard stats
    await expect(page.locator('text=لوحة تحكم إدارة العيادة')).toBeVisible();
    await expect(page.locator('text=إجمالي حجوزات اليوم')).toBeVisible();
    await expect(page.locator('text=إيرادات آخر 7 أيام')).toBeVisible();
    await expect(page.locator('text=أداء أطباء العيادة اليوم')).toBeVisible();

    // Verify Admin Navigation items
    await expect(page.locator('nav a:has-text("الأطباء والعيادات")')).toBeVisible();
    await expect(page.locator('nav a:has-text("طاقم السكرتارية")')).toBeVisible();
    await expect(page.locator('nav a:has-text("التخصصات الطبية")')).toBeVisible();
    await expect(page.locator('nav a:has-text("سجل المرضى")')).toBeVisible();
    await expect(page.locator('nav a:has-text("الحجوزات وقائمة الانتظار")')).toBeVisible();
    await expect(page.locator('nav a:has-text("لائحة أسعار الكشف")')).toBeVisible();
    await expect(page.locator('nav a:has-text("الأسعار الخاصة والتخفيضات")')).toBeVisible();
    await expect(page.locator('nav a:has-text("مواعيد وإجازات الأطباء")')).toBeVisible();
    await expect(page.locator('nav a:has-text("التقارير المالية")')).toBeVisible();
    await expect(page.locator('nav a:has-text("إعدادات العيادة")')).toBeVisible();
  });

  test('3. Strict Security: Admin is redirected if accessing Doctor clinical screens', async ({ page }) => {
    await page.goto('/alnoor/login');
    await page.locator('button:has-text("مدير النظام (Admin)")').click();
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/alnoor\/admin\/dashboard/);

    // Try accessing doctor visit directly
    await page.goto('/alnoor/doctor/visit');
    // Role guard redirects Admin back to their dashboard
    await expect(page).toHaveURL(/\/alnoor\/admin\/dashboard/);
  });

  test('4. Secretary login opens Reception Dashboard and Queue operations', async ({ page }) => {
    await page.goto('/alnoor/login');
    await page.locator('button:has-text("موظف استقبال (Secretary)")').click();
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/alnoor\/secretary\/dashboard/);

    await expect(page.locator('text=لوحة تحكم مكتب الاستقبال')).toBeVisible();
    await expect(page.locator('text=حجز موعد جديد')).toBeVisible();

    // Navigate to Queue
    await page.locator('nav a:has-text("طابور الانتظار اليومي")').click();
    await page.waitForURL(/\/alnoor\/secretary\/queue/);
    await expect(page.locator('text=إدارة طابور الانتظار وقبول المرضى')).toBeVisible();

    // Verify atomic queue number representation
    await expect(page.locator('text=رقم الدور').first()).toBeVisible();
  });

  test('5. Secretary Booking Flow: Patient lookup, doctor selection, queue preview', async ({ page }) => {
    await page.goto('/alnoor/login');
    await page.locator('button:has-text("موظف استقبال (Secretary)")').click();
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/alnoor\/secretary\/dashboard/);

    await page.goto('/alnoor/secretary/booking');
    await expect(page.locator('text=إنشاء حجز جديد')).toBeVisible();

    // Verify Secretary chooses Doctor directly (no specialty dropdown at booking)
    await expect(page.locator('label:has-text("الطبيب المعالج")')).toBeVisible();
    // Verify Queue preview card
    await expect(page.locator('text=تذكرة الدور والحجز')).toBeVisible();
  });

  test('6. Doctor login opens Doctor clinical workspace', async ({ page }) => {
    await page.goto('/alnoor/login');
    await page.locator('button:has-text("طبيب معالج (Doctor)")').click();
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/alnoor\/doctor\/dashboard/);

    await expect(page.locator('text=العيادة السريرية وفحص المرضى')).toBeVisible();
    await expect(page.locator('text=طابور الانتظار لعيادتك اليوم')).toBeVisible();

    // Navigate to clinical health profile
    await page.locator('nav a:has-text("الملف الصحي العام")').click();
    await page.waitForURL(/\/alnoor\/doctor\/health-profile/);
    await expect(page.locator('text=الملف الصحي العام للمريض')).toBeVisible();
    await expect(page.locator('text=حماية الخصوصية: رقم الهاتف وبطاقة المتابعة محجوبة عن الطبيب')).toBeVisible();

    // Verify categories
    await expect(page.locator('text=الأمراض المزمنة')).toBeVisible();
    await expect(page.locator('text=حساسية الأدوية')).toBeVisible();
    await expect(page.locator('text=حساسية الأطعمة')).toBeVisible();

    // Navigate to medical history
    await page.locator('nav a:has-text("السجل والتاريخ المرضي")').click();
    await page.waitForURL(/\/alnoor\/doctor\/medical-history/);
    await expect(page.locator('text=السجل والتاريخ المرضي للزيارات')).toBeVisible();
  });

  test('7. Doctor Visit enforces Unpaid block for uncollected fees', async ({ page }) => {
    await page.goto('/alnoor/login');
    await page.locator('button:has-text("طبيب معالج (Doctor)")').click();
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/alnoor\/doctor\/dashboard/);

    // Query param appointmentId=a-4 which is unpaid in mock data
    await page.goto('/alnoor/doctor/visit?appointmentId=a-4');
    await expect(page.locator('text=هذا الحجز غير مسدد (Unpaid)')).toBeVisible();
    await expect(page.locator('text=قواعد النظام الصارمة تمنع بدء الفحص أو إنهاء الزيارة الطبية قبل إتمام السداد الكامل')).toBeVisible();
  });

});

