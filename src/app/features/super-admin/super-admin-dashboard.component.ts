import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SuperAdminApiService } from '../../core/services/super-admin-api.service';
import { PlatformDashboardMetricsDto, PlatformClinicSummaryDto } from '../../shared/models';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 lg:p-8 space-y-8 font-sans max-w-7xl mx-auto" dir="rtl">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            لوحة الإدارة المركزية (Platform Console)
          </h1>
          <p class="text-sm text-slate-500 mt-1">
            متابعة نمو المنصة، العيادات المشتركة، الاشتراكات والمدفوعات اللامركزية
          </p>
        </div>

        <div class="flex items-center gap-3">
          <a
            routerLink="/super-admin/payments"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>مراجعة التحويلات ({{ metrics()?.pendingManualPayments || 0 }})</span>
          </a>

          <a
            routerLink="/super-admin/clinics"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>استعراض كل العيادات</span>
          </a>
        </div>
      </div>

      <!-- KPI Metrics Cards -->
      @if (isLoading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          @for (i of [1,2,3,4]; track i) {
            <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm animate-pulse h-32"></div>
          }
        </div>
      } @else if (metrics()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <!-- Total Clinics -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">إجمالي العيادات</span>
              <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
            </div>
            <div class="mt-4 flex items-baseline gap-2">
              <span class="text-3xl font-extrabold text-slate-900">{{ metrics()!.totalClinics }}</span>
              <span class="text-xs text-slate-400">عيادة مسجلة</span>
            </div>
            <div class="mt-3 text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <span>{{ metrics()!.activeClinics }} عيادة نشطة</span>
              <span class="text-slate-300">•</span>
              <span class="text-amber-600">{{ metrics()!.activeTrialClinics }} في فترة التجربة</span>
            </div>
          </div>

          <!-- Pending Payments -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">تحويلات قيد المراجعة</span>
              <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div class="mt-4 flex items-baseline gap-2">
              <span class="text-3xl font-extrabold text-amber-600">{{ metrics()!.pendingManualPayments }}</span>
              <span class="text-xs text-slate-400">طلب بانتظار الاعتماد</span>
            </div>
            <div class="mt-3 text-xs text-slate-500">
              InstaPay / تحويلات بنكية / محافظ
            </div>
          </div>

          <!-- Expired / Read-Only Clinics -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">اشتراكات منتهية</span>
              <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
            </div>
            <div class="mt-4 flex items-baseline gap-2">
              <span class="text-3xl font-extrabold text-rose-600">{{ metrics()!.expiredClinics }}</span>
              <span class="text-xs text-slate-400">عيادة (وضع القراءة فقط)</span>
            </div>
            <div class="mt-3 text-xs text-slate-500">
              يمكن تمديدها أو ترقيتها يدوياً
            </div>
          </div>

          <!-- Total Revenue Collected -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">إجمالي الإيرادات المحصلة</span>
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div class="mt-4 flex items-baseline gap-2">
              <span class="text-3xl font-extrabold text-emerald-600">{{ metrics()!.totalPaymentsCollected | number:'1.0-0' }}</span>
              <span class="text-xs font-bold text-slate-600">ج.م</span>
            </div>
            <div class="mt-3 text-xs text-slate-500">
              مشرفو المنصة: {{ metrics()!.totalStaffSuperAdmins }}
            </div>
          </div>
        </div>
      }

      <!-- Privacy & System Policy Note -->
      <div class="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 sm:p-8 rounded-2xl border border-slate-800 text-white shadow-lg flex flex-col justify-between">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/20 mb-4">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <span>مبدأ عزل البيانات الصارم (Multi-Tenant Privacy)</span>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">
            حماية خصوصية السجلات الطبية والملفات السريرية للمرضى
          </h3>
          <p class="text-slate-300 text-sm leading-relaxed max-w-3xl">
            تلتزم منصة ClinicFlow بأعلى معايير حماية البيانات الطبية (HIPAA-aligned multi-tenancy). لا يملك المشرف العام (Super Admin) أي صلاحية للاطلاع على السجلات الطبية، تشخيصات المرضى، الروشتات، أو الملاحظات السريرية لأي عيادة. تنحصر صلاحيات المنصة في إدارة تراخيص النظام، الباقات، الدفعات المالية، وقوائم التخصصات العامة.
          </p>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs text-slate-400">
          <span class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            قواعد البيانات معزولة على مستوى المعرّف (Tenant ID Isolation)
          </span>
          <span class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
            تشفير كامل لكلمات المرور ورموز التحقق SMS OTP (SHA-256)
          </span>
        </div>
      </div>

      <!-- Recent Registrations Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900">آخر العيادات المنضمة للمنصة</h2>
            <p class="text-xs text-slate-500 mt-0.5">العيادات التي أكملت التسجيل الذاتي وتم تهيئتها مؤخراً</p>
          </div>
          <a routerLink="/super-admin/clinics" class="text-xs font-bold text-blue-600 hover:text-blue-700">
            عرض الكل &larr;
          </a>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-right text-sm">
            <thead class="bg-slate-50 text-slate-500 text-xs font-semibold uppercase">
              <tr>
                <th class="px-6 py-3.5">العيادة / المعرف</th>
                <th class="px-6 py-3.5">الباقة الحالية</th>
                <th class="px-6 py-3.5">حالة الاشتراك</th>
                <th class="px-6 py-3.5">الأطباء / المرضى</th>
                <th class="px-6 py-3.5">الحالة</th>
                <th class="px-6 py-3.5">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              @if (recentClinics().length === 0) {
                <tr>
                  <td colspan="6" class="px-6 py-8 text-center text-slate-400 text-sm">
                    لا توجد تسجيلات حديثة حتى الآن.
                  </td>
                </tr>
              }
              @for (clinic of recentClinics(); track clinic.id) {
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="px-6 py-4">
                    <div class="font-bold text-slate-900">{{ clinic.name }}</div>
                    <div class="text-xs text-slate-400 font-mono dir-ltr text-right inline-block">{{ clinic.slug }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700">
                      {{ clinic.currentPlanNameAr || clinic.currentPlanCode }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                      {{ clinic.subscriptionStatus }} ({{ clinic.daysRemaining }} يوم متبقي)
                    </span>
                  </td>
                  <td class="px-6 py-4 text-xs text-slate-600">
                    {{ clinic.doctorsCount }} أطباء / {{ clinic.patientsCount }} مرضى
                  </td>
                  <td class="px-6 py-4">
                    @if (clinic.isActive) {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        نشطة
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
                        <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        معلقة
                      </span>
                    }
                  </td>
                  <td class="px-6 py-4 text-xs text-slate-500">
                    {{ clinic.createdAtUtc | date:'yyyy/MM/dd HH:mm' }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SuperAdminDashboardComponent implements OnInit {
  private readonly superAdminApi = inject(SuperAdminApiService);

  readonly metrics = signal<PlatformDashboardMetricsDto | null>(null);
  readonly recentClinics = signal<PlatformClinicSummaryDto[]>([]);
  readonly isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.superAdminApi.getMetrics().subscribe({
      next: (data) => {
        this.metrics.set(data);
      },
      error: () => {}
    });

    this.superAdminApi.getClinics(undefined, undefined, 1, 5).subscribe({
      next: (res) => {
        this.recentClinics.set(res.items || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
