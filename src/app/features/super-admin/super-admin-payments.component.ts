import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuperAdminApiService } from '../../core/services/super-admin-api.service';
import { PlatformManualPaymentDto } from '../../shared/models';

@Component({
  selector: 'app-super-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 lg:p-8 space-y-6 font-sans max-w-7xl mx-auto" dir="rtl">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">مراجعة التحويلات المالية والاشتراكات</h1>
          <p class="text-sm text-slate-500 mt-1">
            اعتماد أو رفض طلبات التحويل البنكي، InstaPay، والمحافظ الإلكترونية لتفعيل اشتراكات العيادات
          </p>
        </div>

        <!-- Filter Status Tabs -->
        <div class="flex items-center gap-2 bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            (click)="setStatusFilter(undefined)"
            [class]="!selectedStatus() ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
            class="px-3 py-1.5 rounded-lg transition-all"
          >
            الكل
          </button>
          <button
            type="button"
            (click)="setStatusFilter('PendingReview')"
            [class]="selectedStatus() === 'PendingReview' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
            class="px-3 py-1.5 rounded-lg transition-all"
          >
            قيد المراجعة
          </button>
          <button
            type="button"
            (click)="setStatusFilter('Approved')"
            [class]="selectedStatus() === 'Approved' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
            class="px-3 py-1.5 rounded-lg transition-all"
          >
            المعتمدة
          </button>
          <button
            type="button"
            (click)="setStatusFilter('Rejected')"
            [class]="selectedStatus() === 'Rejected' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
            class="px-3 py-1.5 rounded-lg transition-all"
          >
            المرفوضة
          </button>
        </div>
      </div>

      <!-- Feedback Banner -->
      @if (feedbackMessage()) {
        <div class="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm flex items-center justify-between">
          <span>{{ feedbackMessage() }}</span>
          <button (click)="feedbackMessage.set('')" class="text-blue-500 hover:text-blue-700 text-xs font-bold">إغلاق</button>
        </div>
      }

      <!-- Payments Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        @if (isLoading()) {
          <div class="p-12 text-center text-slate-400">جاري تحميل طلبات السداد...</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-right text-sm">
              <thead class="bg-slate-50 text-slate-500 text-xs font-semibold uppercase">
                <tr>
                  <th class="px-6 py-3.5">العيادة</th>
                  <th class="px-6 py-3.5">الباقة / الدورة</th>
                  <th class="px-6 py-3.5">طريقة الدفع</th>
                  <th class="px-6 py-3.5">المبلغ المدفوع</th>
                  <th class="px-6 py-3.5">رقم المرجع (Ref)</th>
                  <th class="px-6 py-3.5">تاريخ الإرسال</th>
                  <th class="px-6 py-3.5">الحالة</th>
                  <th class="px-6 py-3.5 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                @if (submissions().length === 0) {
                  <tr>
                    <td colspan="8" class="px-6 py-8 text-center text-slate-400 text-sm">
                      لا توجد طلبات سداد تطابق الفلتر المحدد.
                    </td>
                  </tr>
                }
                @for (sub of submissions(); track sub.id) {
                  <tr class="hover:bg-slate-50/60 transition-colors">
                    <td class="px-6 py-4">
                      <div class="font-bold text-slate-900">{{ sub.clinicName }}</div>
                      <div class="text-xs text-slate-400 font-mono">{{ sub.clinicSlug }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="font-semibold text-slate-800">{{ sub.planNameAr || sub.planCode }}</div>
                      <div class="text-xs text-blue-600 font-semibold">
                        {{ sub.billingCycle === 'Annual' ? 'اشتراك سنوي' : 'اشتراك شهري' }}
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="inline-flex px-2 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-800">
                        {{ sub.paymentMethod }}
                      </span>
                    </td>
                    <td class="px-6 py-4 font-bold text-slate-900">
                      {{ sub.amountPaid }} {{ sub.currency }}
                    </td>
                    <td class="px-6 py-4 font-mono text-xs text-slate-600">
                      {{ sub.referenceNumber }}
                    </td>
                    <td class="px-6 py-4 text-xs text-slate-500">
                      {{ sub.createdAtUtc | date:'yyyy/MM/dd HH:mm' }}
                    </td>
                    <td class="px-6 py-4">
                      @if (sub.status === 'PendingReview') {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          قيد المراجعة
                        </span>
                      } @else if (sub.status === 'Approved') {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          معتمد ومفعل
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700">
                          <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          مرفوض
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4 text-center">
                      @if (sub.status === 'PendingReview') {
                        <div class="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            (click)="approve(sub)"
                            class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                          >
                            اعتماد وتفعيل
                          </button>
                          <button
                            type="button"
                            (click)="openRejectModal(sub)"
                            class="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors"
                          >
                            رفض
                          </button>
                        </div>
                      } @else {
                        <span class="text-xs text-slate-400">
                          {{ sub.reviewerAdminName ? 'بواسطة: ' + sub.reviewerAdminName : '-' }}
                        </span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Reject Reason Modal -->
      @if (activeRejectSubmission()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 class="text-lg font-bold text-slate-900">
              رفض طلب التحويل المالي
            </h3>
            <p class="text-xs text-slate-500">
              يرجى توضيح سبب الرفض للعيادة
            </p>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">سبب الرفض</label>
              <textarea
                [(ngModel)]="rejectNotes"
                rows="3"
                class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm"
                placeholder="لم يتم العثور على المعاملة في الحساب البنكي، يرجى إعادة إرسال الإيصال الصحيح."
              ></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-3">
              <button
                type="button"
                (click)="activeRejectSubmission.set(null)"
                class="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 font-semibold"
              >
                إلغاء
              </button>
              <button
                type="button"
                (click)="confirmReject()"
                class="px-5 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class SuperAdminPaymentsComponent implements OnInit {
  private readonly superAdminApi = inject(SuperAdminApiService);

  readonly submissions = signal<PlatformManualPaymentDto[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly feedbackMessage = signal<string>('');
  readonly selectedStatus = signal<string | undefined>('PendingReview');
  readonly activeRejectSubmission = signal<PlatformManualPaymentDto | null>(null);

  rejectNotes = '';

  ngOnInit(): void {
    this.loadSubmissions();
  }

  setStatusFilter(status: string | undefined): void {
    this.selectedStatus.set(status);
    this.loadSubmissions();
  }

  loadSubmissions(): void {
    this.isLoading.set(true);
    this.superAdminApi.getManualPayments(this.selectedStatus()).subscribe({
      next: (data) => {
        this.submissions.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  approve(sub: PlatformManualPaymentDto): void {
    if (!confirm(`هل أنت متأكد من اعتماد تحويل عيادة "${sub.clinicName}" بمبلغ ${sub.amountPaid} ج.م وتفعيل الباقة؟`)) return;

    this.superAdminApi.reviewManualPayment(sub.id, true).subscribe({
      next: () => {
        this.feedbackMessage.set(`تم اعتماد وتفعيل اشتراك عيادة "${sub.clinicName}" بنجاح.`);
        this.loadSubmissions();
      },
      error: (err: any) => {
        this.feedbackMessage.set(err.error?.message || 'فشل اعتماد التحويل.');
      }
    });
  }

  openRejectModal(sub: PlatformManualPaymentDto): void {
    this.activeRejectSubmission.set(sub);
    this.rejectNotes = '';
  }

  confirmReject(): void {
    const sub = this.activeRejectSubmission();
    if (!sub) return;

    this.superAdminApi.reviewManualPayment(
      sub.id,
      false,
      this.rejectNotes.trim() || 'تم رفض الإيصال لعدم التطابق.'
    ).subscribe({
      next: () => {
        this.feedbackMessage.set(`تم رفض طلب التحويل لعيادة "${sub.clinicName}".`);
        this.activeRejectSubmission.set(null);
        this.loadSubmissions();
      },
      error: (err: any) => {
        this.feedbackMessage.set(err.error?.message || 'فشل رفض التحويل.');
      }
    });
  }
}
