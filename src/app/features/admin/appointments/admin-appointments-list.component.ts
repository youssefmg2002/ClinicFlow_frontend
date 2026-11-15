import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { AppointmentDto, DoctorDto, AppointmentStatus } from '../../../shared/models';

@Component({
  selector: 'app-admin-appointments-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    ConfirmDialogComponent
  ],
  template: `
    <app-page-header
      title="إدارة الحجوزات والدور"
      subtitle="متابعة الحجوزات، أرقام الدور، وحالات الحضور والدفع لكافة أطباء العيادة"
      [breadcrumbs]="[{ label: 'الرئيسية', url: '/admin/dashboard' }, { label: 'الحجوزات' }]"
    >
      <div actions>
        <!-- Notice on Queue Number -->
        <span class="text-xs text-text-muted bg-white border border-border-main px-3 py-1.5 rounded-xl font-medium">
          نظام الدور اليومي: التسلسل الذري هو أساس الدخول
        </span>
      </div>
    </app-page-header>

    <!-- Filters Bar -->
    <div class="bg-white rounded-2xl border border-border-main p-4 mb-6 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
      <!-- Date Filter -->
      <div>
        <label class="block text-[11px] font-bold text-text-muted mb-1">تاريخ الحجز</label>
        <input
          type="date"
          [(ngModel)]="selectedDate"
          (change)="loadData()"
          class="w-full px-3 py-1.5 bg-slate-50 border border-border-main rounded-xl text-xs text-text-main font-sans"
        />
      </div>

      <!-- Doctor Filter -->
      <div>
        <label class="block text-[11px] font-bold text-text-muted mb-1">الطبيب المعالج</label>
        <select
          [(ngModel)]="selectedDoctorId"
          (change)="loadData()"
          class="w-full px-3 py-1.5 bg-slate-50 border border-border-main rounded-xl text-xs text-text-main"
        >
          <option value="">جميع الأطباء</option>
          @for (doc of doctors(); track doc.doctorId) {
            <option [value]="doc.doctorId">{{ doc.fullName }}</option>
          }
        </select>
      </div>

      <!-- Status Filter -->
      <div>
        <label class="block text-[11px] font-bold text-text-muted mb-1">حالة الحجز</label>
        <select
          [(ngModel)]="selectedStatus"
          (change)="loadData()"
          class="w-full px-3 py-1.5 bg-slate-50 border border-border-main rounded-xl text-xs text-text-main"
        >
          <option value="">جميع الحالات</option>
          <option value="Confirmed">في الانتظار (Confirmed)</option>
          <option value="Arrived">حضر بالعيادة (Arrived)</option>
          <option value="Late">متأخر (Late)</option>
          <option value="Completed">مكتمل (Completed)</option>
          <option value="Cancelled">ملغي (Cancelled)</option>
          <option value="NotSeen">لم يتم الكشف (NotSeen)</option>
        </select>
      </div>

      <!-- Quick Reset / Total -->
      <div class="flex items-end justify-between">
        <button
          type="button"
          (click)="resetFilters()"
          class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-text-main text-xs font-bold rounded-xl transition-colors cursor-pointer w-full"
        >
          إعادة ضبط الفلاتر
        </button>
      </div>
    </div>

    <!-- Appointments Table -->
    @if (isLoading()) {
      <app-loading-skeleton type="table" [count]="5"></app-loading-skeleton>
    } @else if (appointments().length === 0) {
      <app-empty-state
        title="لا توجد حجوزات في هذا التاريخ"
        message="لم يتم العثور على أي حجوزات تطابق معايير الفلترة المحددة."
      ></app-empty-state>
    } @else {
      <div class="bg-white rounded-2xl border border-border-main overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr class="bg-slate-50/70 text-text-muted border-b border-border-subtle font-bold">
                <th class="py-3.5 px-4 rounded-r-xl w-16 text-center">رقم الدور</th>
                <th class="py-3.5 px-4">اسم المريض</th>
                <th class="py-3.5 px-4">الطبيب</th>
                <th class="py-3.5 px-4">نوع الحجز</th>
                <th class="py-3.5 px-4">حالة الحجز</th>
                <th class="py-3.5 px-4">حالة السداد</th>
                <th class="py-3.5 px-4">القيمة المسجلة</th>
                <th class="py-3.5 px-4 rounded-l-xl text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              @for (apt of appointments(); track apt.appointmentId) {
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <!-- Queue Number Badge -->
                  <td class="py-3.5 px-4 text-center">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-xl font-black text-sm font-sans"
                      [ngClass]="apt.status === 'Cancelled' ? 'bg-slate-100 text-slate-400 line-through' : 'bg-blue-100 text-primary border border-blue-200 shadow-xs'"
                    >
                      {{ apt.queueNumber }}
                    </span>
                  </td>

                  <!-- Patient Name -->
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-text-main">{{ apt.patientName }}</span>
                      @if (apt.patientIsFollowUp) {
                        <span class="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">
                          متابعة
                        </span>
                      }
                    </div>
                  </td>

                  <!-- Doctor Name -->
                  <td class="py-3.5 px-4 text-text-main font-semibold">
                    {{ apt.doctorName }}
                  </td>

                  <!-- Appointment Type -->
                  <td class="py-3.5 px-4">
                    <span class="font-medium text-xs text-text-muted">
                      {{ apt.appointmentType === 'NewExam' ? 'كشف جديد' : 'استشارة' }}
                      @if (apt.consultationNumber) {
                        ({{ apt.consultationNumber }})
                      }
                    </span>
                  </td>

                  <!-- Appointment Status -->
                  <td class="py-3.5 px-4">
                    <app-status-badge [status]="apt.status"></app-status-badge>
                  </td>

                  <!-- Paid Status -->
                  <td class="py-3.5 px-4">
                    <app-status-badge [status]="apt.paidStatus" type="payment"></app-status-badge>
                  </td>

                  <!-- Price -->
                  <td class="py-3.5 px-4 font-bold font-sans">
                    <span class="text-text-main">{{ apt.priceSnapshot }} ج.م</span>
                    @if (apt.isSpecialPriceApplied) {
                      <span class="mr-1 text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-normal">
                        سعر خاص
                      </span>
                    }
                  </td>

                  <!-- Actions -->
                  <td class="py-3.5 px-4 text-left">
                    <div class="flex items-center justify-end gap-1.5">
                      @if (apt.status !== 'Completed' && apt.status !== 'Cancelled') {
                        <button
                          type="button"
                          (click)="promptCancel(apt)"
                          class="px-2 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          إلغاء
                        </button>

                        <button
                          type="button"
                          (click)="promptNotSeen(apt)"
                          class="px-2 py-1 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          عدم كشف
                        </button>
                      } @else {
                        <span class="text-xs text-text-muted">مكتمل/مغلق</span>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }

    <!-- Cancel Dialog -->
    <app-confirm-dialog
      [isOpen]="isCancelDialogOpen()"
      title="إلغاء الحجز"
      message="هل أنت متأكد من إلغاء هذا الحجز؟ لن يتم إعادة استخدام رقم الدور لهذا اليوم."
      confirmLabel="تأكيد الإلغاء"
      [isDestructive]="true"
      (confirm)="confirmCancel()"
      (cancel)="isCancelDialogOpen.set(false)"
    ></app-confirm-dialog>

    <!-- Not Seen Dialog with Reason -->
    @if (isNotSeenDialogOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" (click)="isNotSeenDialogOpen.set(false)"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-border-main text-right" dir="rtl">
            <h3 class="text-base font-black text-text-main mb-2">تسجيل عدم الكشف (NotSeen)</h3>
            <p class="text-xs text-text-muted mb-4">يرجى توضيح سبب عدم الحضور أو عدم الكشف عن المريض:</p>

            <div class="space-y-4">
              <div>
                <label class="block font-bold text-xs text-text-main mb-1">السبب *</label>
                <input type="text" [(ngModel)]="notSeenReasonInput" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl text-xs text-text-main" placeholder="مثال: لم يحضر في الموعد، أو تم الاعتذار" />
              </div>

              <div class="flex items-center justify-end gap-2 pt-2">
                <button type="button" (click)="isNotSeenDialogOpen.set(false)" class="px-3 py-1.5 text-xs text-text-muted bg-slate-100 rounded-lg">إلغاء</button>
                <button type="button" (click)="confirmNotSeen()" class="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 rounded-lg shadow-sm">تأكيد عدم الكشف</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class AdminAppointmentsListComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  isLoading = signal<boolean>(true);
  appointments = signal<AppointmentDto[]>([]);
  doctors = signal<DoctorDto[]>([]);

  selectedDate = new Date().toISOString().split('T')[0];
  selectedDoctorId = '';
  selectedStatus = '';

  isCancelDialogOpen = signal<boolean>(false);
  isNotSeenDialogOpen = signal<boolean>(false);
  selectedAppointment = signal<AppointmentDto | null>(null);
  notSeenReasonInput = '';

  ngOnInit(): void {
    this.api.getDoctors().subscribe({
      next: (docs) => this.doctors.set(docs)
    });
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.api.getAppointments({
      date: this.selectedDate || undefined,
      doctorId: this.selectedDoctorId || undefined,
      status: (this.selectedStatus as AppointmentStatus) || undefined,
      pageNumber: 1,
      pageSize: 50
    }).subscribe({
      next: (res) => {
        this.appointments.set(res.items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  resetFilters(): void {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.selectedDoctorId = '';
    this.selectedStatus = '';
    this.loadData();
  }

  promptCancel(apt: AppointmentDto): void {
    this.selectedAppointment.set(apt);
    this.isCancelDialogOpen.set(true);
  }

  confirmCancel(): void {
    const apt = this.selectedAppointment();
    if (!apt) return;

    this.api.cancelAppointment(apt.appointmentId, 'تم الإلغاء بواسطة مدير العيادة').subscribe({
      next: () => {
        this.toast.success('تم إلغاء الحجز بنجاح مع الاحتفاظ برقم الدور');
        this.isCancelDialogOpen.set(false);
        this.loadData();
      }
    });
  }

  promptNotSeen(apt: AppointmentDto): void {
    this.selectedAppointment.set(apt);
    this.notSeenReasonInput = '';
    this.isNotSeenDialogOpen.set(true);
  }

  confirmNotSeen(): void {
    const apt = this.selectedAppointment();
    if (!apt) return;

    this.api.markAppointmentNotSeen(apt.appointmentId, this.notSeenReasonInput || 'لم يحضر المريض').subscribe({
      next: () => {
        this.toast.success('تم تسجيل عدم الكشف بنجاح');
        this.isNotSeenDialogOpen.set(false);
        this.loadData();
      }
    });
  }
}

