import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { TenantService } from '../../../core/tenant/tenant.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { StatCardComponent } from '../../../shared/components/stat-card.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import { OnboardingChecklistComponent } from './onboarding-checklist.component';
import {
  DailyDashboardStatsDto,
  DailyRevenueChartPointDto,
  DoctorDailyPerformanceDto,
  FinancialSummaryDto,
  ShortcutsSummaryDto,
  SubscriptionDto
} from '../../../shared/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    PageHeaderComponent,
    StatCardComponent,
    LoadingSkeletonComponent,
    OnboardingChecklistComponent
  ],
  template: `
    <app-page-header
      title="لوحة التحكم الرئيسية"
      subtitle="نظرة عامة على أداء العيادة، الحجوزات اليومية، المؤشرات المالية، وحركة الأطباء"
    >
      <div actions class="flex items-center gap-2">
        <button
          type="button"
          (click)="loadData()"
          class="inline-flex items-center gap-2 px-3 py-2 bg-white border border-border-main hover:bg-slate-50 text-text-main text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          تحديث البيانات
        </button>
      </div>
    </app-page-header>

    <!-- Onboarding Checklist for newly registered clinics -->
    <app-onboarding-checklist></app-onboarding-checklist>

    <!-- Read-Only Banner when subscription is expired -->
    @if (subscription()?.isExpired) {
      <div class="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg shrink-0">
            !
          </div>
          <div>
            <h4 class="font-bold text-sm text-rose-900">انتهت فترة التجربة / صلاحية اشتراك العيادة (وضع القراءة فقط)</h4>
            <p class="text-xs text-rose-700 mt-0.5">يمكنك استعراض البيانات والتقارير ولكن تم تعليق إنشاء الحجوزات والعمليات الجديدة حتى تجديد الاشتراك.</p>
          </div>
        </div>
        <a [routerLink]="['/' + tenantService.clinicSlug() + '/admin/subscription']" class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shrink-0">
          تجديد الاشتراك الآن
        </a>
      </div>
    }

    @if (isLoading()) {
      <app-loading-skeleton type="card" [count]="4"></app-loading-skeleton>
    } @else {
      <!-- 1. Daily KPI Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <app-stat-card
          title="حجوزات اليوم"
          [value]="dailyStats()?.totalAppointmentsCount || 0"
          unit="حجز"
          subtitle="إجمالي حجوزات العيادة اليوم"
          variant="blue"
        >
          <svg icon xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </app-stat-card>

        <app-stat-card
          title="الكشوفات المكتملة"
          [value]="dailyStats()?.completedCount || 0"
          unit="حالة"
          subtitle="تم فحصهم وإنهاء زياراتهم"
          variant="emerald"
          [deltaPositive]="true"
        >
          <svg icon xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </app-stat-card>

        <app-stat-card
          title="المرضى في الانتظار"
          [value]="dailyStats()?.waitingCount || 0"
          unit="مريض"
          subtitle="بانتظار دور الكشف الآن"
          variant="amber"
        >
          <svg icon xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </app-stat-card>

        <app-stat-card
          title="المبالغ المحصلة اليوم"
          [value]="dailyStats()?.collectedAmount || 0"
          unit="ج.م"
          [subtitle]="'المستحق: ' + (dailyStats()?.outstandingAmount || 0) + ' ج.م'"
          variant="navy"
          [deltaPositive]="true"
        >
          <svg icon xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </app-stat-card>
      </div>

      <!-- 2. Revenue Chart (Last 7 Days) & Monthly Financial Card -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- 7-Day Revenue Trend Chart (2 cols) -->
        <div class="lg:col-span-2 bg-white rounded-2xl p-5 border border-border-main shadow-xs">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-border-subtle">
            <div>
              <h3 class="text-base font-bold text-text-main">إيرادات آخر 7 أيام</h3>
              <p class="text-xs text-text-muted mt-0.5">مقارنة المبالغ المحصلة والمستحقة يومياً</p>
            </div>
            <div class="flex items-center gap-4 text-xs font-semibold">
              <span class="flex items-center gap-1.5 text-text-main">
                <span class="w-3 h-3 rounded-full bg-primary inline-block"></span>
                المحصلة
              </span>
              <span class="flex items-center gap-1.5 text-text-main">
                <span class="w-3 h-3 rounded-full bg-sky-200 inline-block"></span>
                المستحقة
              </span>
            </div>
          </div>

          <!-- Clean Native Visual Bars -->
          <div class="space-y-4 pt-2">
            @for (point of revenuePoints(); track point.date) {
              <div class="flex items-center gap-3 text-xs">
                <span class="w-16 font-bold text-text-muted text-right">{{ point.dayNameAr }}</span>
                <div class="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden flex" dir="ltr">
                  <div
                    class="bg-primary h-full transition-all duration-500 rounded-l-full"
                    [style.width.%]="calcPercentage(point.collectedAmount, maxRevenue())"
                    [title]="'المحصل: ' + point.collectedAmount + ' ج.م'"
                  ></div>
                  <div
                    class="bg-sky-200 h-full transition-all duration-500"
                    [style.width.%]="calcPercentage(point.outstandingAmount, maxRevenue())"
                    [title]="'المستحق: ' + point.outstandingAmount + ' ج.م'"
                  ></div>
                </div>
                <div class="w-24 text-left font-bold text-text-main">
                  {{ point.totalBillableValue.toLocaleString('ar-EG') }} ج.م
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Monthly Financial Summary with Date Filter (1 col) -->
        <div class="bg-white rounded-2xl p-5 border border-border-main shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-border-subtle mb-4">
              <h3 class="text-base font-bold text-text-main">الملخص المالي للفترة</h3>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-primary border border-blue-100">
                الشهر الحالي
              </span>
            </div>

            <!-- Custom Date Filter -->
            <div class="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label class="block text-[11px] font-bold text-text-muted mb-1">من تاريخ</label>
                <input
                  type="date"
                  [(ngModel)]="filterFromDate"
                  (change)="onFilterDateChange()"
                  class="w-full px-2.5 py-1.5 bg-slate-50 border border-border-main rounded-lg text-xs text-text-main"
                />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-text-muted mb-1">إلى تاريخ</label>
                <input
                  type="date"
                  [(ngModel)]="filterToDate"
                  (change)="onFilterDateChange()"
                  class="w-full px-2.5 py-1.5 bg-slate-50 border border-border-main rounded-lg text-xs text-text-main"
                />
              </div>
            </div>

            <!-- Financial Metrics List -->
            <div class="space-y-3.5">
              <div class="p-3.5 rounded-xl bg-slate-50 border border-border-subtle flex items-center justify-between">
                <div>
                  <p class="text-xs text-text-muted">إجمالي قيمة الحجوزات</p>
                  <p class="text-lg font-black text-navy-sidebar font-sans mt-0.5">
                    {{ (financialSummary()?.totalAppointmentsValue || 0).toLocaleString('ar-EG') }} ج.م
                  </p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-blue-100 text-primary flex items-center justify-center font-bold">
                  Σ
                </div>
              </div>

              <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <div>
                  <p class="text-xs text-emerald-800">المبالغ المحصلة بالفعل</p>
                  <p class="text-lg font-black text-emerald-700 font-sans mt-0.5">
                    {{ (financialSummary()?.collectedAmount || 0).toLocaleString('ar-EG') }} ج.م
                  </p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-between">
                <div>
                  <p class="text-xs text-amber-800">المبالغ المستحقة (غير مدفوعة)</p>
                  <p class="text-lg font-black text-amber-700 font-sans mt-0.5">
                    {{ (financialSummary()?.outstandingAmount || 0).toLocaleString('ar-EG') }} ج.م
                  </p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <a
            [routerLink]="['/' + tenantService.clinicSlug() + '/admin/reports']"
            class="mt-4 block text-center py-2 px-3 text-xs font-bold text-primary hover:text-primary-hover bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            عرض التقرير المالي المفصل ←
          </a>
        </div>
      </div>

      <!-- 3. Doctors Today Performance Table -->
      <div class="bg-white rounded-2xl border border-border-main p-5 shadow-xs mb-6">
        <div class="flex items-center justify-between pb-3 border-b border-border-subtle mb-4">
          <div>
            <h3 class="text-base font-bold text-text-main">أداء الأطباء اليوم</h3>
            <p class="text-xs text-text-muted mt-0.5">متابعة عدد الكشوفات والاستشارات والإيرادات المحققة لكل طبيب</p>
          </div>
          <a
            [routerLink]="['/' + tenantService.clinicSlug() + '/admin/doctors']"
            class="text-xs font-bold text-primary hover:underline"
          >
            إدارة كافة الأطباء
          </a>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs">
            <thead>
              <tr class="text-text-muted border-b border-border-subtle bg-slate-50/70">
                <th class="py-3 px-4 font-bold rounded-r-xl">الطبيب</th>
                <th class="py-3 px-4 font-bold">كشوفات مكتملة</th>
                <th class="py-3 px-4 font-bold">استشارات مكتملة</th>
                <th class="py-3 px-4 font-bold">في الانتظار</th>
                <th class="py-3 px-4 font-bold">المحصل</th>
                <th class="py-3 px-4 font-bold rounded-l-xl">إجمالي القيمة</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              @for (doc of doctorPerformance(); track doc.doctorId) {
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="py-3.5 px-4 font-bold text-text-main flex items-center gap-2.5">
                    <div class="w-7 h-7 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-xs">
                      د
                    </div>
                    <span>{{ doc.doctorName }}</span>
                  </td>
                  <td class="py-3.5 px-4 font-semibold text-emerald-700">
                    {{ doc.completedExamsCount }}
                  </td>
                  <td class="py-3.5 px-4 font-semibold text-blue-700">
                    {{ doc.completedConsultationsCount }}
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      {{ doc.waitingPatientsCount }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 font-extrabold text-emerald-700 font-sans">
                    {{ doc.collectedRevenue.toLocaleString('ar-EG') }} ج.م
                  </td>
                  <td class="py-3.5 px-4 font-extrabold text-navy-sidebar font-sans">
                    {{ doc.totalBillableValue.toLocaleString('ar-EG') }} ج.م
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. Quick Shortcuts Summary -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <a
          [routerLink]="['/' + tenantService.clinicSlug() + '/admin/doctors']"
          class="p-4 bg-white rounded-2xl border border-border-main hover:border-primary/50 shadow-xs hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p class="text-xs text-text-muted">الأطباء</p>
            <p class="text-base font-black text-text-main">{{ shortcuts()?.doctorsCount || 3 }} أطباء</p>
          </div>
        </a>

        <a
          [routerLink]="['/' + tenantService.clinicSlug() + '/admin/secretaries']"
          class="p-4 bg-white rounded-2xl border border-border-main hover:border-primary/50 shadow-xs hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p class="text-xs text-text-muted">السكرتارية</p>
            <p class="text-base font-black text-text-main">{{ shortcuts()?.secretariesCount || 2 }} موظفين</p>
          </div>
        </a>

        <a
          [routerLink]="['/' + tenantService.clinicSlug() + '/admin/patients']"
          class="p-4 bg-white rounded-2xl border border-border-main hover:border-primary/50 shadow-xs hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p class="text-xs text-text-muted">المرضى المسجلون</p>
            <p class="text-base font-black text-text-main">{{ shortcuts()?.totalPatientsCount || 50 }} مريض</p>
          </div>
        </a>

        <a
          [routerLink]="['/' + tenantService.clinicSlug() + '/admin/appointments']"
          class="p-4 bg-white rounded-2xl border border-border-main hover:border-primary/50 shadow-xs hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-xs text-text-muted">حجوزات اليوم</p>
            <p class="text-base font-black text-text-main">{{ shortcuts()?.todayAppointmentsCount || 45 }} حجز</p>
          </div>
        </a>
      </div>
    }
  `
})
export class AdminDashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly tenantService = inject(TenantService);

  isLoading = signal<boolean>(true);
  dailyStats = signal<DailyDashboardStatsDto | null>(null);
  revenuePoints = signal<DailyRevenueChartPointDto[]>([]);
  doctorPerformance = signal<DoctorDailyPerformanceDto[]>([]);
  financialSummary = signal<FinancialSummaryDto | null>(null);
  shortcuts = signal<ShortcutsSummaryDto | null>(null);
  subscription = signal<SubscriptionDto | null>(null);

  filterFromDate = '2026-04-01';
  filterToDate = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    this.api.getDailyStats().subscribe({
      next: (data) => this.dailyStats.set(data),
      error: () => {}
    });

    this.api.getRevenueLast7Days().subscribe({
      next: (data) => this.revenuePoints.set(data),
      error: () => {}
    });

    this.api.getDoctorPerformanceToday().subscribe({
      next: (data) => this.doctorPerformance.set(data),
      error: () => {}
    });

    this.api.getFinancialSummary(this.filterFromDate, this.filterToDate).subscribe({
      next: (data) => this.financialSummary.set(data),
      error: () => {}
    });

    this.api.getSubscription().subscribe({
      next: (data) => this.subscription.set(data),
      error: () => {}
    });

    this.api.getShortcutsSummary().subscribe({
      next: (data) => {
        this.shortcuts.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onFilterDateChange(): void {
    this.api.getFinancialSummary(this.filterFromDate, this.filterToDate).subscribe({
      next: (data) => this.financialSummary.set(data),
      error: () => {}
    });
  }

  maxRevenue(): number {
    const points = this.revenuePoints();
    if (!points || points.length === 0) return 1;
    return Math.max(...points.map(p => p.totalBillableValue), 1);
  }

  calcPercentage(val: number, max: number): number {
    if (!max || max <= 0) return 0;
    return Math.min(Math.round((val / max) * 100), 100);
  }
}

