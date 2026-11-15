import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { TenantService } from '../../../core/tenant/tenant.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import { AppointmentDto } from '../../../shared/models';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSkeletonComponent
  ],
  template: `
    <app-page-header
      [title]="'مرحباً ' + (authService.currentUser()?.fullName || 'د. أحمد علي')"
      subtitle="نتمنى لك يوماً موفقاً في عيادتك. إليك ملخص حالات اليوم وطابور الانتظار الخاص بك."
    >
      <div actions class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          العيادة جاهزة لاستقبال الحالات
        </span>
      </div>
    </app-page-header>

    @if (isLoading()) {
      <app-loading-skeleton type="card" [count]="3"></app-loading-skeleton>
    } @else {
      <!-- 1. Doctor KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-3xl p-6 border border-border-main shadow-xs flex items-center justify-between">
          <div>
            <p class="text-xs text-text-muted font-medium">مواعيد اليوم الكلية</p>
            <p class="text-3xl font-black text-text-main font-sans mt-1">{{ appointments().length }}</p>
            <p class="text-[11px] text-text-muted mt-1">حالات مجدولة في عيادتك اليوم</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-6 border border-border-main shadow-xs flex items-center justify-between">
          <div>
            <p class="text-xs text-amber-800 font-bold">المرضى في الانتظار الآن</p>
            <p class="text-3xl font-black text-amber-600 font-sans mt-1">{{ waitingPatientsCount() }}</p>
            <p class="text-[11px] text-text-muted mt-1">جاهزون بالعيادة للدخول</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-6 border border-border-main shadow-xs flex items-center justify-between">
          <div>
            <p class="text-xs text-emerald-800 font-bold">الكشوفات المكتملة</p>
            <p class="text-3xl font-black text-emerald-600 font-sans mt-1">{{ completedCount() }}</p>
            <p class="text-[11px] text-text-muted mt-1">تم توثيق تشخيصهم بنجاح</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 2. Today Queue for This Doctor Only -->
      <div class="bg-white rounded-3xl border border-border-main p-6 sm:p-8 shadow-xs">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-border-subtle">
          <div>
            <h3 class="text-base font-bold text-text-main">طابور فحص اليوم (الخاص بك فقط)</h3>
            <p class="text-xs text-text-muted mt-0.5">انقر "بدء الفحص" لفتح شاشة الكشف السريري والتشخيص</p>
          </div>

          <span class="text-xs text-text-muted font-medium">
            حجوزات باقي أطباء العيادة محجوبة للحفاظ على الخصوصية
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr class="bg-slate-50/70 text-text-muted border-b border-border-subtle font-bold">
                <th class="py-3 px-4 rounded-r-xl w-20 text-center">رقم الدور</th>
                <th class="py-3 px-4">اسم المريض</th>
                <th class="py-3 px-4">نوع الزيارة</th>
                <th class="py-3 px-4">حالة الحضور</th>
                <th class="py-3 px-4">حالة السداد</th>
                <th class="py-3 px-4 rounded-l-xl text-left">الكشف والتشخيص</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              @for (apt of appointments(); track apt.appointmentId) {
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="py-3.5 px-4 text-center">
                    <span class="inline-flex items-center justify-center w-9 h-9 rounded-xl font-black text-sm bg-blue-100 text-primary font-sans">
                      {{ apt.queueNumber }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="font-bold text-text-main">{{ apt.patientName }}</span>
                    @if (apt.patientIsFollowUp) {
                      <span class="mr-2 text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">
                        متابعة
                      </span>
                    }
                  </td>
                  <td class="py-3.5 px-4 text-text-muted">
                    {{ apt.appointmentType === 'NewExam' ? 'كشف جديد' : 'استشارة' }}
                  </td>
                  <td class="py-3.5 px-4">
                    <app-status-badge [status]="apt.status"></app-status-badge>
                  </td>
                  <td class="py-3.5 px-4">
                    <app-status-badge [status]="apt.paidStatus" type="payment"></app-status-badge>
                  </td>
                  <td class="py-3.5 px-4 text-left">
                    @if (apt.status === 'Completed') {
                      <span class="text-xs font-bold text-emerald-700 flex items-center justify-end gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                        تم الكشف
                      </span>
                    } @else if (apt.paidStatus === 'Paid') {
                      <a
                        [routerLink]="['/' + tenantService.clinicSlug() + '/doctor/visit']"
                        [queryParams]="{ appointmentId: apt.appointmentId }"
                        class="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span>بدء الفحص</span>
                        <span>←</span>
                      </a>
                    } @else {
                      <span class="text-xs text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                        بانتظار السداد بالاستقبال
                      </span>
                    }
                  </td>
                </tr>
              }
              @if (appointments().length === 0) {
                <tr>
                  <td colspan="6" class="text-center py-8 text-text-muted text-xs">
                    لا توجد حجوزات مسجلة في عيادتك اليوم.
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
export class DoctorDashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly authService = inject(AuthService);
  readonly tenantService = inject(TenantService);

  isLoading = signal<boolean>(true);
  appointments = signal<AppointmentDto[]>([]);

  ngOnInit(): void {
    this.loadTodayQueue();
  }

  loadTodayQueue(): void {
    this.isLoading.set(true);
    const doctorId = this.authService.doctorId() || 'dddd1111-1111-1111-1111-111111111111';
    this.api.getDoctorTodayQueue(doctorId).subscribe({
      next: (items) => {
        this.appointments.set(items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  waitingPatientsCount(): number {
    return this.appointments().filter(a => a.status === 'Arrived' || a.status === 'Confirmed').length;
  }

  completedCount(): number {
    return this.appointments().filter(a => a.status === 'Completed').length;
  }
}

