import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuperAdminApiService } from '../../core/services/super-admin-api.service';
import { PlatformClinicSummaryDto } from '../../shared/models';

@Component({
  selector: 'app-super-admin-clinics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 lg:p-8 space-y-6 font-sans max-w-7xl mx-auto" dir="rtl">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">إدارة العيادات المشتركة</h1>
          <p class="text-sm text-slate-500 mt-1">
            متابعة تراخيص العيادات، تمديد الاشتراكات، تغيير الباقات، وتجميد أو تنشيط الحسابات
          </p>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            placeholder="بحث باسم العيادة أو المعرف..."
            class="px-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 w-full sm:w-72 bg-white"
          />
        </div>
      </div>

      <!-- Feedback Banner -->
      @if (feedbackMessage()) {
        <div class="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm flex items-center justify-between">
          <span>{{ feedbackMessage() }}</span>
          <button (click)="feedbackMessage.set('')" class="text-blue-500 hover:text-blue-700 text-xs font-bold">إغلاق</button>
        </div>
      }

      <!-- Clinics Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        @if (isLoading()) {
          <div class="p-12 text-center text-slate-400">جاري تحميل قائمة العيادات...</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-right text-sm">
              <thead class="bg-slate-50 text-slate-500 text-xs font-semibold uppercase">
                <tr>
                  <th class="px-6 py-3.5">العيادة</th>
                  <th class="px-6 py-3.5">المعرف (Slug)</th>
                  <th class="px-6 py-3.5">الباقة</th>
                  <th class="px-6 py-3.5">حالة الاشتراك</th>
                  <th class="px-6 py-3.5">صلاحية الترخيص حتى</th>
                  <th class="px-6 py-3.5">الأطباء / المرضى</th>
                  <th class="px-6 py-3.5">الحالة التشغيلية</th>
                  <th class="px-6 py-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                @for (clinic of clinics(); track clinic.id) {
                  <tr class="hover:bg-slate-50/60 transition-colors">
                    <td class="px-6 py-4">
                      <div class="font-bold text-slate-900">{{ clinic.name }}</div>
                      <div class="text-xs text-slate-400 font-mono">{{ clinic.phoneNumber || 'لا يوجد هاتف' }}</div>
                    </td>
                    <td class="px-6 py-4 font-mono text-xs dir-ltr text-right">
                      {{ clinic.slug }}
                    </td>
                    <td class="px-6 py-4">
                      <span class="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700">
                        {{ clinic.currentPlanNameAr || clinic.currentPlanCode }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      @if (clinic.subscriptionStatus === 'Active') {
                        <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          نشط ({{ clinic.daysRemaining }} يوم متبقي)
                        </span>
                      } @else if (clinic.subscriptionStatus === 'Trial') {
                        <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                          فترة تجريبية ({{ clinic.daysRemaining }} يوم متبقي)
                        </span>
                      } @else if (clinic.subscriptionStatus === 'Expired') {
                        <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
                          منتهي (قراءة فقط)
                        </span>
                      } @else {
                        <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                          {{ clinic.subscriptionStatus }}
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4 text-xs font-mono">
                      {{ clinic.subscriptionEndDate ? (clinic.subscriptionEndDate | date:'yyyy/MM/dd') : 'غير محدد' }}
                    </td>
                    <td class="px-6 py-4 text-xs">
                      {{ clinic.doctorsCount }} أطباء / {{ clinic.patientsCount }} مرضى
                    </td>
                    <td class="px-6 py-4">
                      @if (clinic.isActive) {
                        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          مفعلة
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                          معلقة
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          (click)="openExtendModal(clinic)"
                          class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                        >
                          تمديد
                        </button>
                        <button
                          type="button"
                          (click)="toggleActive(clinic)"
                          [class]="clinic.isActive ? 'px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold' : 'px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold'"
                        >
                          {{ clinic.isActive ? 'تجميد' : 'تنشيط' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Extend Subscription Modal -->
      @if (activeModalClinic()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 class="text-lg font-bold text-slate-900">
              تمديد اشتراك: {{ activeModalClinic()!.name }}
            </h3>
            <p class="text-xs text-slate-500">
              يمكنك إضافة أيام إضافية لفترة التجربة أو الاشتراك الساري للعيادة
            </p>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">عدد الأيام المراد إضافتها</label>
              <input
                type="number"
                [(ngModel)]="extendDays"
                min="1"
                max="365"
                class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">سبب التمديد</label>
              <input
                type="text"
                [(ngModel)]="extendReason"
                placeholder="مثال: منحة دعم فني / هدية ترويجية"
                class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div class="flex justify-end gap-3 pt-3">
              <button
                type="button"
                (click)="activeModalClinic.set(null)"
                class="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 font-semibold"
              >
                إلغاء
              </button>
              <button
                type="button"
                (click)="confirmExtend()"
                class="px-5 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
              >
                تأكيد التمديد
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class SuperAdminClinicsComponent implements OnInit {
  private readonly superAdminApi = inject(SuperAdminApiService);

  readonly clinics = signal<PlatformClinicSummaryDto[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly feedbackMessage = signal<string>('');
  readonly activeModalClinic = signal<PlatformClinicSummaryDto | null>(null);

  searchQuery = '';
  extendDays = 30;
  extendReason = 'تمديد إداري من المنصة';

  ngOnInit(): void {
    this.loadClinics();
  }

  loadClinics(): void {
    this.isLoading.set(true);
    this.superAdminApi.getClinics(this.searchQuery.trim() || undefined).subscribe({
      next: (res) => {
        this.clinics.set(res.items || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onSearch(): void {
    this.loadClinics();
  }

  openExtendModal(clinic: PlatformClinicSummaryDto): void {
    this.activeModalClinic.set(clinic);
    this.extendDays = 30;
    this.extendReason = 'تمديد إداري من المنصة';
  }

  confirmExtend(): void {
    const clinic = this.activeModalClinic();
    if (!clinic) return;

    this.superAdminApi.extendSubscription(clinic.id, this.extendDays, this.extendReason).subscribe({
      next: () => {
        this.feedbackMessage.set(`تم تمديد اشتراك عيادة "${clinic.name}" بنجاح لمدة ${this.extendDays} يوماً.`);
        this.activeModalClinic.set(null);
        this.loadClinics();
      },
      error: (err: any) => {
        this.feedbackMessage.set(err.error?.message || 'فشل تمديد الاشتراك.');
      }
    });
  }

  toggleActive(clinic: PlatformClinicSummaryDto): void {
    const newStatus = !clinic.isActive;
    const actionLabel = newStatus ? 'تنشيط' : 'تجميد';
    if (!confirm(`هل أنت متأكد من ${actionLabel} عيادة "${clinic.name}"؟`)) return;

    this.superAdminApi.updateClinicStatus(
      clinic.id,
      newStatus,
      newStatus ? undefined : 'تجميد إداري من قبل المشرف العام'
    ).subscribe({
      next: () => {
        this.feedbackMessage.set(`تم ${actionLabel} العيادة بنجاح.`);
        this.loadClinics();
      },
      error: (err: any) => {
        this.feedbackMessage.set(err.error?.message || `فشل ${actionLabel} العيادة.`);
      }
    });
  }
}
