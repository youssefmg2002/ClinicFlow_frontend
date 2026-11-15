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
import { AppointmentDto, DoctorDto } from '../../../shared/models';

@Component({
  selector: 'app-secretary-queue',
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
      title="إدارة قائمة الانتظار والدور"
      subtitle="تنظيم دخول المرضى بالرقم، تسجيل الحضور، تحويل المتأخرين، وإعادة إدخالهم لآخر الدور"
      [breadcrumbs]="[{ label: 'الرئيسية', url: '/secretary/dashboard' }, { label: 'قائمة الانتظار' }]"
    ></app-page-header>

    <!-- Toolbar: Doctor & Date Picker -->
    <div class="bg-white rounded-2xl border border-border-main p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <div class="flex items-center gap-2">
          <label class="text-xs font-bold text-text-main whitespace-nowrap">الطبيب:</label>
          <select
            [ngModel]="selectedDoctorId()"
            (ngModelChange)="onDoctorChange($event)"
            class="px-3 py-1.5 bg-slate-50 border border-border-main rounded-xl text-xs font-bold text-text-main focus:bg-white"
          >
            @for (doc of doctors(); track doc.doctorId) {
              <option [value]="doc.doctorId">{{ doc.fullName }} ({{ doc.specialties[0]?.specialtyName || 'طبيب' }})</option>
            }
          </select>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-xs font-bold text-text-main whitespace-nowrap">التاريخ:</label>
          <input
            type="date"
            [(ngModel)]="selectedDate"
            (change)="loadQueue()"
            class="px-2.5 py-1.5 bg-slate-50 border border-border-main rounded-xl text-xs font-sans text-text-main"
          />
        </div>
      </div>

      <div class="text-xs text-text-muted flex items-center gap-2">
        <span>إجمالي حالات الطابور:</span>
        <span class="font-extrabold text-text-main font-sans text-sm">{{ queueItems().length }}</span>
      </div>
    </div>

    @if (isLoading()) {
      <app-loading-skeleton type="table" [count]="5"></app-loading-skeleton>
    } @else if (queueItems().length === 0) {
      <app-empty-state
        title="طابور الانتظار فارغ"
        message="لا توجد حجوزات مسجلة لهذا الطبيب في التاريخ المحدد."
      ></app-empty-state>
    } @else {
      <div class="bg-white rounded-3xl border border-border-main overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr class="bg-slate-50/70 text-text-muted border-b border-border-subtle font-bold">
                <th class="py-3.5 px-4 rounded-r-xl w-20 text-center">رقم الدور</th>
                <th class="py-3.5 px-4">اسم المريض</th>
                <th class="py-3.5 px-4">نوع الحجز</th>
                <th class="py-3.5 px-4">حالة الحضور</th>
                <th class="py-3.5 px-4">حالة السداد</th>
                <th class="py-3.5 px-4 rounded-l-xl text-left">إجراءات الدور</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              @for (item of queueItems(); track item.appointmentId) {
                <tr class="hover:bg-slate-50/50 transition-colors" [class.opacity-60]="item.status === 'Cancelled'">
                  <!-- Queue Number -->
                  <td class="py-3.5 px-4 text-center">
                    <span
                      class="inline-flex items-center justify-center w-9 h-9 rounded-xl font-black text-base font-sans"
                      [ngClass]="item.status === 'Cancelled' ? 'bg-slate-100 text-slate-400 line-through' : (item.status === 'Late' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-primary border border-blue-200 shadow-xs')"
                    >
                      {{ item.queueNumber }}
                    </span>
                  </td>

                  <!-- Patient Name -->
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-text-main text-sm">{{ item.patientName }}</span>
                      @if (item.patientIsFollowUp) {
                        <span class="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">
                          متابعة
                        </span>
                      }
                    </div>
                    <p class="text-[11px] text-text-muted font-mono" dir="ltr">{{ item.patientPhone }}</p>
                  </td>

                  <!-- Type -->
                  <td class="py-3.5 px-4">
                    <span class="font-semibold text-text-muted">
                      {{ item.appointmentType === 'NewExam' ? 'كشف جديد' : 'استشارة' }}
                      @if (item.consultationNumber) {
                        ({{ item.consultationNumber }})
                      }
                    </span>
                  </td>

                  <!-- Status -->
                  <td class="py-3.5 px-4">
                    <app-status-badge [status]="item.status"></app-status-badge>
                  </td>

                  <!-- Paid Status -->
                  <td class="py-3.5 px-4">
                    <app-status-badge [status]="item.paidStatus" type="payment"></app-status-badge>
                  </td>

                  <!-- Actions -->
                  <td class="py-3.5 px-4 text-left">
                    <div class="flex items-center justify-end gap-1.5">
                      <!-- 1. Arrive -->
                      @if (item.status === 'Confirmed') {
                        <button
                          type="button"
                          (click)="arrive(item)"
                          class="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-primary text-xs font-bold rounded-lg border border-blue-200 transition-colors cursor-pointer"
                          title="تسجيل حضور المريض بالعيادة"
                        >
                          حضور
                        </button>
                      }

                      <!-- 2. Late -->
                      @if (item.status === 'Confirmed' || item.status === 'Arrived') {
                        <button
                          type="button"
                          (click)="markLate(item)"
                          class="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-lg border border-orange-200 transition-colors cursor-pointer"
                          title="تحويل المريض لمتأخر لعدم وجوده وقت ندائه"
                        >
                          تأخر
                        </button>
                      }

                      <!-- 3. Return to queue (for Late patients) -->
                      @if (item.status === 'Late') {
                        <button
                          type="button"
                          (click)="returnToQueue(item)"
                          class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                          title="إعادة إدخال المريض المتأخر لآخر الدور برقم جديد"
                        >
                          <span>إعادة للدور</span>
                          <span class="text-[10px] text-emerald-600 font-normal">(رقم جديد)</span>
                        </button>
                      }

                      <!-- 4. Cancel & NotSeen -->
                      @if (item.status !== 'Completed' && item.status !== 'Cancelled') {
                        <button
                          type="button"
                          (click)="promptCancel(item)"
                          class="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="إلغاء الحجز"
                        >
                          ✕
                        </button>

                        <button
                          type="button"
                          (click)="promptNotSeen(item)"
                          class="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        >
                          لم يحضر
                        </button>
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
      title="تأكيد إلغاء الحجز"
      message="هل أنت متأكد من إلغاء هذا الحجز؟ لن يتم إعادة استخدام رقم الدور لهذا اليوم لضمان الترتيب."
      confirmLabel="إلغاء الحجز"
      [isDestructive]="true"
      (confirm)="confirmCancel()"
      (cancel)="isCancelDialogOpen.set(false)"
    ></app-confirm-dialog>

    <!-- Not Seen Dialog -->
    @if (isNotSeenDialogOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" (click)="isNotSeenDialogOpen.set(false)"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-border-main text-right" dir="rtl">
            <h3 class="text-base font-black text-text-main mb-2">تسجيل عدم الحضور (NotSeen)</h3>
            <p class="text-xs text-text-muted mb-4">اكتب سبب عدم فحص المريض:</p>

            <div class="space-y-4">
              <div>
                <input type="text" [(ngModel)]="notSeenReason" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl text-xs text-text-main" placeholder="مثال: انتهاء فترة العيادة دون حضوره" />
              </div>

              <div class="flex items-center justify-end gap-2 pt-2">
                <button type="button" (click)="isNotSeenDialogOpen.set(false)" class="px-3 py-1.5 text-xs text-text-muted bg-slate-100 rounded-lg">إلغاء</button>
                <button type="button" (click)="confirmNotSeen()" class="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 rounded-lg shadow-sm">تأكيد</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class SecretaryQueueComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  isLoading = signal<boolean>(true);
  doctors = signal<DoctorDto[]>([]);
  selectedDoctorId = signal<string>('');
  selectedDate = new Date().toISOString().split('T')[0];
  queueItems = signal<AppointmentDto[]>([]);

  isCancelDialogOpen = signal<boolean>(false);
  isNotSeenDialogOpen = signal<boolean>(false);
  selectedAppointment = signal<AppointmentDto | null>(null);
  notSeenReason = '';

  ngOnInit(): void {
    this.api.getDoctors().subscribe({
      next: (docs) => {
        this.doctors.set(docs);
        if (docs.length > 0) {
          this.selectedDoctorId.set(docs[0].doctorId);
          this.loadQueue();
        } else {
          this.isLoading.set(false);
        }
      }
    });
  }

  onDoctorChange(docId: string): void {
    this.selectedDoctorId.set(docId);
    this.loadQueue();
  }

  loadQueue(): void {
    const docId = this.selectedDoctorId();
    if (!docId) return;

    this.isLoading.set(true);
    this.api.getAppointments({
      doctorId: docId,
      date: this.selectedDate,
      pageNumber: 1,
      pageSize: 100
    }).subscribe({
      next: (res) => {
        // Sort by queueNumber ascending
        const sorted = res.items.sort((a, b) => a.queueNumber - b.queueNumber);
        this.queueItems.set(sorted);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  arrive(apt: AppointmentDto): void {
    this.api.arriveAppointment(apt.appointmentId).subscribe({
      next: (updated) => {
        this.queueItems.update(list => list.map(a => a.appointmentId === updated.appointmentId ? updated : a));
        this.toast.success(`تم تسجيل حضور المريض: ${apt.patientName}`);
      }
    });
  }

  markLate(apt: AppointmentDto): void {
    this.api.markAppointmentLate(apt.appointmentId).subscribe({
      next: (updated) => {
        this.queueItems.update(list => list.map(a => a.appointmentId === updated.appointmentId ? updated : a));
        this.toast.warning(`تم تحويل المريض إلى متأخر: ${apt.patientName}`);
      }
    });
  }

  returnToQueue(apt: AppointmentDto): void {
    this.api.returnToQueue(apt.appointmentId).subscribe({
      next: (updated) => {
        this.toast.success(`تمت إعادة المريض لآخر الدور برقم جديد: ${updated.queueNumber}`);
        this.loadQueue();
      }
    });
  }

  promptCancel(apt: AppointmentDto): void {
    this.selectedAppointment.set(apt);
    this.isCancelDialogOpen.set(true);
  }

  confirmCancel(): void {
    const apt = this.selectedAppointment();
    if (!apt) return;

    this.api.cancelAppointment(apt.appointmentId, 'تم الإلغاء بواسطة السكرتير').subscribe({
      next: () => {
        this.toast.success('تم إلغاء الحجز بنجاح وعدم إعادة استخدام رقم الدور');
        this.isCancelDialogOpen.set(false);
        this.loadQueue();
      }
    });
  }

  promptNotSeen(apt: AppointmentDto): void {
    this.selectedAppointment.set(apt);
    this.notSeenReason = '';
    this.isNotSeenDialogOpen.set(true);
  }

  confirmNotSeen(): void {
    const apt = this.selectedAppointment();
    if (!apt) return;

    this.api.markAppointmentNotSeen(apt.appointmentId, this.notSeenReason || 'لم يحضر في موعده').subscribe({
      next: () => {
        this.toast.success('تم تسجيل عدم الكشف للمريض');
        this.isNotSeenDialogOpen.set(false);
        this.loadQueue();
      }
    });
  }
}

