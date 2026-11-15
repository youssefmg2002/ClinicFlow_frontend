import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { AppointmentDto } from '../../../shared/models';

@Component({
  selector: 'app-secretary-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent
  ],
  template: `
    <app-page-header
      title="تسجيل المدفوعات والتحصيل قبل الكشف"
      subtitle="سداد رسوم الكشف والاستشارة بالكامل مرة واحدة لتمكين الطبيب من فحص المريض"
      [breadcrumbs]="[{ label: 'الرئيسية', url: '/secretary/dashboard' }, { label: 'تسجيل الدفع' }]"
    >
      <div actions>
        <span class="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          تنبيه: لا يمكن للطبيب إنهاء أو بدء الكشف إلا بعد سداد الرسوم بالكامل
        </span>
      </div>
    </app-page-header>

    <!-- Date selector -->
    <div class="bg-white rounded-2xl border border-border-main p-4 mb-6 shadow-xs flex items-center justify-between">
      <div class="flex items-center gap-2">
        <label class="text-xs font-bold text-text-main">تاريخ الحجوزات:</label>
        <input
          type="date"
          [(ngModel)]="selectedDate"
          (change)="loadAppointments()"
          class="px-2.5 py-1.5 bg-slate-50 border border-border-main rounded-xl text-xs font-sans text-text-main"
        />
      </div>

      <div class="text-xs text-text-muted">
        السداد كامل لمرة واحدة (لا يقبل النظام دفعاً جزئياً)
      </div>
    </div>

    @if (isLoading()) {
      <app-loading-skeleton type="table" [count]="4"></app-loading-skeleton>
    } @else if (appointments().length === 0) {
      <app-empty-state
        title="لا توجد حجوزات في هذا التاريخ"
        message="لا توجد أي حجوزات مسجلة للمطالبة بالسداد."
      ></app-empty-state>
    } @else {
      <div class="bg-white rounded-3xl border border-border-main overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr class="bg-slate-50/70 text-text-muted border-b border-border-subtle font-bold">
                <th class="py-3 px-4 rounded-r-xl w-16 text-center">الدور</th>
                <th class="py-3 px-4">اسم المريض</th>
                <th class="py-3 px-4">الطبيب</th>
                <th class="py-3 px-4">نوع الحجز</th>
                <th class="py-3 px-4">المبلغ المطلوب</th>
                <th class="py-3 px-4">حالة السداد</th>
                <th class="py-3 px-4 rounded-l-xl text-left">إجراء الدفع</th>
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
                  <td class="py-3.5 px-4 text-text-muted">
                    {{ apt.doctorName }}
                  </td>
                  <td class="py-3.5 px-4 text-xs">
                    {{ apt.appointmentType === 'NewExam' ? 'كشف جديد' : 'استشارة' }}
                  </td>
                  <td class="py-3.5 px-4 font-black font-sans text-base text-navy-sidebar">
                    {{ apt.priceSnapshot }} ج.م
                  </td>
                  <td class="py-3.5 px-4">
                    <app-status-badge [status]="apt.paidStatus" type="payment"></app-status-badge>
                  </td>
                  <td class="py-3.5 px-4 text-left">
                    @if (apt.paidStatus === 'Unpaid') {
                      <button
                        type="button"
                        (click)="recordPayment(apt)"
                        class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        إتمام الدفع الكامل ({{ apt.priceSnapshot }} ج.م)
                      </button>
                    } @else {
                      <div class="flex items-center justify-end gap-2">
                        <span class="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                          تم السداد
                        </span>

                        @if (apt.status !== 'Completed') {
                          <button
                            type="button"
                            (click)="promptCorrectPayment(apt)"
                            class="text-xs text-text-muted hover:text-rose-600 underline cursor-pointer"
                          >
                            تصحيح
                          </button>
                        }
                      </div>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }

    <!-- Correction Dialog -->
    @if (isCorrectionModalOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" (click)="isCorrectionModalOpen.set(false)"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-border-main text-right" dir="rtl">
            <h3 class="text-base font-black text-text-main mb-2">تصحيح خطأ إدخال الدفع</h3>
            <p class="text-xs text-text-muted mb-4">
              سيتم إعادة حالة الحجز إلى (غير مدفوع) قبل اكتمال الكشف. يرجى توضيح سبب التصحيح:
            </p>

            <div class="space-y-4">
              <div>
                <input type="text" [(ngModel)]="correctionReason" placeholder="مثال: تم إدخال السداد لمريض آخر بالخطأ" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl text-xs text-text-main" />
              </div>

              <div class="flex items-center justify-end gap-2 pt-2">
                <button type="button" (click)="isCorrectionModalOpen.set(false)" class="px-3 py-1.5 text-xs text-text-muted bg-slate-100 rounded-lg">إلغاء</button>
                <button type="button" (click)="confirmCorrection()" class="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 rounded-lg shadow-sm">تأكيد التصحيح</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class SecretaryPaymentsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  isLoading = signal<boolean>(true);
  appointments = signal<AppointmentDto[]>([]);
  selectedDate = new Date().toISOString().split('T')[0];

  isCorrectionModalOpen = signal<boolean>(false);
  selectedAppointment = signal<AppointmentDto | null>(null);
  correctionReason = '';

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading.set(true);
    this.api.getAppointments({ date: this.selectedDate }).subscribe({
      next: (res) => {
        this.appointments.set(res.items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  recordPayment(apt: AppointmentDto): void {
    this.api.recordPayment(apt.appointmentId, { amount: apt.priceSnapshot }).subscribe({
      next: () => {
        this.toast.success(`تم تسجيل سداد المبلغ بالكامل (${apt.priceSnapshot} ج.م) للمريض: ${apt.patientName}`);
        this.loadAppointments();
      }
    });
  }

  promptCorrectPayment(apt: AppointmentDto): void {
    this.selectedAppointment.set(apt);
    this.correctionReason = '';
    this.isCorrectionModalOpen.set(true);
  }

  confirmCorrection(): void {
    const apt = this.selectedAppointment();
    if (!apt) return;

    this.api.correctPayment(apt.appointmentId, { correctionReason: this.correctionReason || 'تصحيح إدخال السداد' }).subscribe({
      next: () => {
        this.toast.success('تم تصحيح السداد وإعادة الحالة إلى غير مدفوع');
        this.isCorrectionModalOpen.set(false);
        this.loadAppointments();
      }
    });
  }
}

