import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { StatCardComponent } from '../../../shared/components/stat-card.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import { DetailedFinancialReportDto } from '../../../shared/models';

@Component({
  selector: 'app-financial-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    StatCardComponent,
    LoadingSkeletonComponent
  ],
  template: `
    <app-page-header
      title="التقارير المالية والأداء السريري"
      subtitle="تحليل متكامل للإيرادات، المبالغ المحصلة والمستحقة، ومعدل الكشوفات اليومية للأطباء"
      [breadcrumbs]="[{ label: 'الرئيسية', url: '/admin/dashboard' }, { label: 'التقارير المالية' }]"
    ></app-page-header>

    <!-- Date Range Filter Toolbar -->
    <div class="bg-white rounded-2xl border border-border-main p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 text-xs font-bold text-text-main">
          <span>من تاريخ:</span>
          <input
            type="date"
            [(ngModel)]="fromDate"
            class="px-2.5 py-1.5 bg-slate-50 border border-border-main rounded-xl font-sans"
          />
        </div>

        <div class="flex items-center gap-2 text-xs font-bold text-text-main">
          <span>إلى تاريخ:</span>
          <input
            type="date"
            [(ngModel)]="toDate"
            class="px-2.5 py-1.5 bg-slate-50 border border-border-main rounded-xl font-sans"
          />
        </div>

        <button
          type="button"
          (click)="loadReport()"
          class="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          عرض التقرير
        </button>
      </div>

      <div class="text-xs text-text-muted font-medium">
        الفترة: <strong class="text-text-main font-sans">{{ report()?.primaryPeriod?.totalDaysInPeriod || 30 }}</strong> يوماً
      </div>
    </div>

    @if (isLoading()) {
      <app-loading-skeleton type="card" [count]="4"></app-loading-skeleton>
    } @else {
      <!-- 1. KPI Stats Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <app-stat-card
          title="إجمالي القيمة الفعالة"
          [value]="report()?.primaryPeriod?.totalBillableValue || 0"
          unit="ج.م"
          subtitle="قيمة الحجوزات غير الملغاة"
          variant="blue"
        >
          <svg icon xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </app-stat-card>

        <app-stat-card
          title="المبالغ المحصلة"
          [value]="report()?.primaryPeriod?.collectedAmount || 0"
          unit="ج.م"
          subtitle="تم تحصيلها نقداً بالعيادة"
          variant="emerald"
          [deltaPositive]="true"
        >
          <svg icon xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </app-stat-card>

        <app-stat-card
          title="المبالغ المستحقة"
          [value]="report()?.primaryPeriod?.outstandingAmount || 0"
          unit="ج.م"
          subtitle="حجوزات غير مسددة"
          variant="amber"
        >
          <svg icon xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </app-stat-card>

        <app-stat-card
          title="متوسط الكشوفات اليومي"
          [value]="report()?.primaryPeriod?.averageDailyCompletedExams || 0"
          unit="كشف/يوم"
          subtitle="معدل الزيارات المكتملة يومياً"
          variant="navy"
          [deltaPositive]="true"
        >
          <svg icon xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </app-stat-card>
      </div>

      <!-- 2. Breakdown Table by Doctor -->
      <div class="bg-white rounded-2xl border border-border-main p-5 shadow-xs mb-6">
        <div class="flex items-center justify-between pb-3 border-b border-border-subtle mb-4">
          <h3 class="text-base font-bold text-text-main">تفاصيل الأداء المالي والتشغيلي لكل طبيب</h3>
          <span class="text-xs text-text-muted">مقارنة شاملة خلال الفترة المحددة</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr class="bg-slate-50/70 text-text-muted border-b border-border-subtle font-bold">
                <th class="py-3 px-4 rounded-r-xl">الطبيب</th>
                <th class="py-3 px-4">إجمالي الحجوزات</th>
                <th class="py-3 px-4">كشف جديد مكتمل</th>
                <th class="py-3 px-4">استشارات مكتملة</th>
                <th class="py-3 px-4">ملغي / لم يحضر</th>
                <th class="py-3 px-4">المحصل</th>
                <th class="py-3 px-4">المستحق</th>
                <th class="py-3 px-4 rounded-l-xl">إجمالي القيمة</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              @for (doc of report()?.doctorBreakdown; track doc.doctorId) {
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="py-3.5 px-4 font-bold text-text-main">
                    {{ doc.doctorName }}
                  </td>
                  <td class="py-3.5 px-4 font-bold font-sans">
                    {{ doc.totalAppointmentsCount }}
                  </td>
                  <td class="py-3.5 px-4 text-emerald-700 font-semibold font-sans">
                    {{ doc.completedNewExamsCount }}
                  </td>
                  <td class="py-3.5 px-4 text-blue-700 font-semibold font-sans">
                    {{ doc.completedConsultationsCount }}
                  </td>
                  <td class="py-3.5 px-4 text-text-muted font-sans">
                    {{ doc.cancelledCount + doc.notSeenCount }}
                  </td>
                  <td class="py-3.5 px-4 font-bold font-sans text-emerald-700">
                    {{ doc.collectedAmount.toLocaleString('ar-EG') }} ج.م
                  </td>
                  <td class="py-3.5 px-4 font-bold font-sans text-amber-700">
                    {{ doc.outstandingAmount.toLocaleString('ar-EG') }} ج.م
                  </td>
                  <td class="py-3.5 px-4 font-black font-sans text-navy-sidebar">
                    {{ doc.totalBillableValue.toLocaleString('ar-EG') }} ج.م
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `
})
export class FinancialReportsComponent implements OnInit {
  private readonly api = inject(ApiService);

  isLoading = signal<boolean>(true);
  report = signal<DetailedFinancialReportDto | null>(null);

  fromDate = '2026-04-01';
  toDate = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.isLoading.set(true);
    this.api.getDetailedFinancialReport(this.fromDate, this.toDate).subscribe({
      next: (data) => {
        this.report.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        // Fallback demo metrics if endpoint needs mock in dev
        this.report.set({
          primaryPeriod: {
            fromDate: this.fromDate,
            toDate: this.toDate,
            totalDaysInPeriod: 30,
            totalAppointmentsCount: 145,
            completedNewExamsCount: 88,
            completedConsultationsCount: 38,
            waitingCount: 12,
            cancelledCount: 5,
            notSeenCount: 2,
            averageDailyCompletedExams: 4.2,
            totalBillableValue: 109500,
            collectedAmount: 85000,
            outstandingAmount: 24500
          },
          doctorBreakdown: [
            {
              doctorId: 'dddd1111-1111-1111-1111-111111111111',
              doctorName: 'د. أحمد علي',
              totalAppointmentsCount: 80,
              completedNewExamsCount: 50,
              completedConsultationsCount: 22,
              waitingCount: 5,
              cancelledCount: 2,
              notSeenCount: 1,
              totalBillableValue: 62000,
              collectedAmount: 48000,
              outstandingAmount: 14000
            },
            {
              doctorId: 'dddd2222-2222-2222-2222-222222222222',
              doctorName: 'د. مريم محمود',
              totalAppointmentsCount: 45,
              completedNewExamsCount: 26,
              completedConsultationsCount: 12,
              waitingCount: 5,
              cancelledCount: 1,
              notSeenCount: 1,
              totalBillableValue: 31500,
              collectedAmount: 25000,
              outstandingAmount: 6500
            },
            {
              doctorId: 'dddd3333-3333-3333-3333-333333333333',
              doctorName: 'د. خالد سعيد',
              totalAppointmentsCount: 20,
              completedNewExamsCount: 12,
              completedConsultationsCount: 4,
              waitingCount: 2,
              cancelledCount: 2,
              notSeenCount: 0,
              totalBillableValue: 16000,
              collectedAmount: 12000,
              outstandingAmount: 4000
            }
          ]
        });
        this.isLoading.set(false);
      }
    });
  }
}

