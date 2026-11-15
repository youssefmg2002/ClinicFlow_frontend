import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { TenantService } from '../../../core/tenant/tenant.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { AppointmentDto } from '../../../shared/models';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent
  ],
  template: `
    <app-page-header
      title="مواعيدي وحجوزاتي"
      subtitle="استعراض جدول الحالات السابقة والحالية والقادمة الخاصة بك في العيادة"
      [breadcrumbs]="[{ label: 'الرئيسية', url: '/doctor/dashboard' }, { label: 'مواعيدي' }]"
    >
      <div actions>
        <span class="text-xs text-text-muted bg-white border border-border-main px-3 py-1.5 rounded-xl font-medium">
          إنشاء الحجوزات يتم حصرياً عبر مكتب الاستقبال
        </span>
      </div>
    </app-page-header>

    <!-- Filter Bar -->
    <div class="bg-white rounded-2xl border border-border-main p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <label class="text-xs font-bold text-text-main">تاريخ المواعيد:</label>
        <input
          type="date"
          [(ngModel)]="selectedDate"
          (change)="loadAppointments()"
          class="px-2.5 py-1.5 bg-slate-50 border border-border-main rounded-xl text-xs font-sans text-text-main"
        />
      </div>

      <div class="text-xs text-text-muted">
        حالات العيادة الخاصة بك فقط
      </div>
    </div>

    @if (isLoading()) {
      <app-loading-skeleton type="table" [count]="4"></app-loading-skeleton>
    } @else if (appointments().length === 0) {
      <app-empty-state
        title="لا توجد مواعيد مسجلة"
        message="لا توجد أي حجوزات مجدولة في عيادتك لهذا التاريخ."
      ></app-empty-state>
    } @else {
      <div class="bg-white rounded-3xl border border-border-main overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr class="bg-slate-50/70 text-text-muted border-b border-border-subtle font-bold">
                <th class="py-3.5 px-4 rounded-r-xl w-16 text-center">الدور</th>
                <th class="py-3.5 px-4">اسم المريض</th>
                <th class="py-3.5 px-4">التاريخ</th>
                <th class="py-3.5 px-4">نوع الزيارة</th>
                <th class="py-3.5 px-4">حالة الحضور</th>
                <th class="py-3.5 px-4">حالة السداد</th>
                <th class="py-3.5 px-4 rounded-l-xl text-left">الملف السريري</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              @for (apt of appointments(); track apt.appointmentId) {
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="py-3.5 px-4 text-center">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-xl font-black text-sm bg-blue-100 text-primary font-sans">
                      {{ apt.queueNumber }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 font-bold text-text-main">
                    {{ apt.patientName }}
                  </td>
                  <td class="py-3.5 px-4 text-text-muted font-sans">
                    {{ apt.appointmentDate }}
                  </td>
                  <td class="py-3.5 px-4 text-xs">
                    {{ apt.appointmentType === 'NewExam' ? 'كشف جديد' : 'استشارة' }}
                  </td>
                  <td class="py-3.5 px-4">
                    <app-status-badge [status]="apt.status"></app-status-badge>
                  </td>
                  <td class="py-3.5 px-4">
                    <app-status-badge [status]="apt.paidStatus" type="payment"></app-status-badge>
                  </td>
                  <td class="py-3.5 px-4 text-left">
                    <a
                      [routerLink]="['/' + tenantService.clinicSlug() + '/doctor/visit']"
                      [queryParams]="{ appointmentId: apt.appointmentId }"
                      class="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-primary text-xs font-bold rounded-lg border border-blue-200 transition-colors inline-block"
                    >
                      فتح الكشف
                    </a>
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
export class DoctorAppointmentsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  readonly tenantService = inject(TenantService);

  isLoading = signal<boolean>(true);
  appointments = signal<AppointmentDto[]>([]);
  selectedDate = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading.set(true);
    const docId = this.auth.doctorId() || 'dddd1111-1111-1111-1111-111111111111';
    this.api.getAppointments({
      doctorId: docId,
      date: this.selectedDate
    }).subscribe({
      next: (res) => {
        this.appointments.set(res.items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}

