import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { TenantService } from '../../../core/tenant/tenant.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import { AppointmentDto, DoctorDto } from '../../../shared/models';

@Component({
  selector: 'app-secretary-dashboard',
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
      title="لوحة تحكم مكتب الاستقبال"
      subtitle="نظرة فورية على حركة العيادة اليوم، طابور الانتظار، وأرقام الدور للأطباء المصرح بهم"
    >
      <div actions class="flex items-center gap-2">
        <a
          [routerLink]="['/' + tenantService.clinicSlug() + '/secretary/booking']"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-primary/20 transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          إنشاء حجز جديد
        </a>
      </div>
    </app-page-header>

    @if (isLoading()) {
      <app-loading-skeleton type="card" [count]="4"></app-loading-skeleton>
    } @else {
      <!-- 1. Reception Today Counters -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div class="bg-white rounded-2xl p-4 border border-border-main text-center shadow-xs">
          <span class="text-xs text-text-muted font-medium">إجمالي اليوم</span>
          <p class="text-2xl font-black text-text-main font-sans mt-1">{{ totalToday() }}</p>
        </div>

        <div class="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 text-center shadow-xs">
          <span class="text-xs text-primary font-bold">حضر بالعيادة</span>
          <p class="text-2xl font-black text-primary font-sans mt-1">{{ arrivedCount() }}</p>
        </div>

        <div class="bg-amber-50/60 rounded-2xl p-4 border border-amber-100 text-center shadow-xs">
          <span class="text-xs text-amber-800 font-bold">في الانتظار</span>
          <p class="text-2xl font-black text-amber-700 font-sans mt-1">{{ waitingCount() }}</p>
        </div>

        <div class="bg-orange-50/60 rounded-2xl p-4 border border-orange-100 text-center shadow-xs">
          <span class="text-xs text-orange-800 font-bold">متأخر (Late)</span>
          <p class="text-2xl font-black text-orange-700 font-sans mt-1">{{ lateCount() }}</p>
        </div>

        <div class="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 text-center shadow-xs">
          <span class="text-xs text-emerald-800 font-bold">تم الكشف</span>
          <p class="text-2xl font-black text-emerald-700 font-sans mt-1">{{ completedCount() }}</p>
        </div>

        <div class="bg-rose-50/60 rounded-2xl p-4 border border-rose-100 text-center shadow-xs">
          <span class="text-xs text-rose-800 font-bold">ملغي / لم يحضر</span>
          <p class="text-2xl font-black text-rose-700 font-sans mt-1">{{ cancelledOrNotSeenCount() }}</p>
        </div>
      </div>

      <!-- 2. Today Queue Quick View -->
      <div class="bg-white rounded-3xl border border-border-main p-6 shadow-xs mb-6">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-border-subtle">
          <div>
            <h3 class="text-base font-bold text-text-main">طابور الانتظار المباشر اليوم</h3>
            <p class="text-xs text-text-muted mt-0.5">الحالات الحالية بأرقام الدور وإجراءات التحضير</p>
          </div>
          <a
            [routerLink]="['/' + tenantService.clinicSlug() + '/secretary/queue']"
            class="text-xs font-bold text-primary hover:underline"
          >
            الانتقال لإدارة الدور الكاملة ←
          </a>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr class="bg-slate-50/70 text-text-muted border-b border-border-subtle font-bold">
                <th class="py-3 px-4 rounded-r-xl w-16 text-center">الدور</th>
                <th class="py-3 px-4">اسم المريض</th>
                <th class="py-3 px-4">الطبيب</th>
                <th class="py-3 px-4">النوع</th>
                <th class="py-3 px-4">الحالة</th>
                <th class="py-3 px-4">الدفع</th>
                <th class="py-3 px-4 rounded-l-xl text-left">إجراء سريع</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              @for (apt of todayAppointments(); track apt.appointmentId) {
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-xl font-black text-sm bg-blue-100 text-primary font-sans">
                      {{ apt.queueNumber }}
                    </span>
                  </td>
                  <td class="py-3 px-4 font-bold text-text-main">
                    {{ apt.patientName }}
                  </td>
                  <td class="py-3 px-4 text-text-muted font-semibold">
                    {{ apt.doctorName }}
                  </td>
                  <td class="py-3 px-4 text-xs text-text-muted">
                    {{ apt.appointmentType === 'NewExam' ? 'كشف جديد' : 'استشارة' }}
                  </td>
                  <td class="py-3 px-4">
                    <app-status-badge [status]="apt.status"></app-status-badge>
                  </td>
                  <td class="py-3 px-4">
                    <app-status-badge [status]="apt.paidStatus" type="payment"></app-status-badge>
                  </td>
                  <td class="py-3 px-4 text-left">
                    @if (apt.status === 'Confirmed') {
                      <button
                        type="button"
                        (click)="arrive(apt)"
                        class="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-primary text-xs font-bold rounded-lg border border-blue-200 transition-colors cursor-pointer"
                      >
                        تسجيل حضور
                      </button>
                    } @else if (apt.status === 'Arrived') {
                      <span class="text-xs font-bold text-blue-600">جاهز للدخول</span>
                    } @else {
                      <span class="text-xs text-text-muted">{{ apt.status }}</span>
                    }
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
export class SecretaryDashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly tenantService = inject(TenantService);

  isLoading = signal<boolean>(true);
  todayAppointments = signal<AppointmentDto[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    const today = new Date().toISOString().split('T')[0];
    this.api.getAppointments({ date: today }).subscribe({
      next: (res) => {
        this.todayAppointments.set(res.items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  totalToday(): number {
    return this.todayAppointments().length;
  }

  arrivedCount(): number {
    return this.todayAppointments().filter(a => a.status === 'Arrived').length;
  }

  waitingCount(): number {
    return this.todayAppointments().filter(a => a.status === 'Confirmed').length;
  }

  lateCount(): number {
    return this.todayAppointments().filter(a => a.status === 'Late').length;
  }

  completedCount(): number {
    return this.todayAppointments().filter(a => a.status === 'Completed').length;
  }

  cancelledOrNotSeenCount(): number {
    return this.todayAppointments().filter(a => a.status === 'Cancelled' || a.status === 'NotSeen').length;
  }

  arrive(apt: AppointmentDto): void {
    this.api.arriveAppointment(apt.appointmentId).subscribe({
      next: () => {
        this.todayAppointments.update(list =>
          list.map(a => a.appointmentId === apt.appointmentId ? { ...a, status: 'Arrived' } : a)
        );
      }
    });
  }
}
