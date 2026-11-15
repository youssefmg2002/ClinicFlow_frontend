import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuperAdminApiService } from '../../core/services/super-admin-api.service';
import { PlatformPlanDto } from '../../shared/models';

@Component({
  selector: 'app-super-admin-plans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 lg:p-8 space-y-6 font-sans max-w-7xl mx-auto" dir="rtl">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">باقات الاشتراك والأسعار</h1>
          <p class="text-sm text-slate-500 mt-1">
            إدارة الخطط التسعيرية الشهرية والسنوية، المزايا التنافسية، وحالة النشر بالموقع
          </p>
        </div>

        <button
          type="button"
          (click)="openCreateModal()"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>إضافة باقة جديدة</span>
        </button>
      </div>

      <!-- Feedback Banner -->
      @if (feedbackMessage()) {
        <div class="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm flex items-center justify-between">
          <span>{{ feedbackMessage() }}</span>
          <button (click)="feedbackMessage.set('')" class="text-blue-500 hover:text-blue-700 text-xs font-bold">إغلاق</button>
        </div>
      }

      <!-- Plans Cards -->
      @if (isLoading()) {
        <div class="p-12 text-center text-slate-400">جاري تحميل الباقات...</div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (plan of plans(); track plan.id) {
            <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:border-blue-300 transition-all">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider"
                    [class]="plan.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'">
                    {{ plan.isPublished ? 'منشورة بالموقع' : 'مسودة مخفية' }}
                  </span>
                  <span class="text-xs text-slate-400 font-mono">كود: {{ plan.code }}</span>
                </div>

                <h3 class="text-xl font-bold text-slate-900">{{ plan.nameAr }}</h3>
                <p class="text-xs text-slate-500 mt-1 min-h-[36px]">{{ plan.description || 'لا يوجد وصف متاح' }}</p>

                <!-- Pricing Display -->
                <div class="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div class="flex justify-between items-baseline">
                    <span class="text-xs text-slate-500 font-semibold">السعر الشهري:</span>
                    <span class="text-lg font-black text-slate-900">{{ plan.monthlyPrice }} <span class="text-xs font-normal">ج.م</span></span>
                  </div>
                  <div class="flex justify-between items-baseline">
                    <span class="text-xs text-slate-500 font-semibold">السعر السنوي:</span>
                    <span class="text-lg font-black text-blue-600">{{ plan.annualPrice }} <span class="text-xs font-normal">ج.م</span></span>
                  </div>
                </div>

                <!-- Features -->
                @if (plan.featuresJson) {
                  <div class="mt-4 text-xs text-slate-600 font-sans line-clamp-2">
                    {{ plan.featuresJson }}
                  </div>
                }
              </div>

              <!-- Actions -->
              <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  (click)="openEditModal(plan)"
                  class="px-4 py-2 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  تعديل الباقة
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Edit / Create Modal -->
      @if (editingPlan()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 class="text-lg font-bold text-slate-900">
              {{ isEditingExisting() ? 'تعديل باقة: ' + formPlan.nameAr : 'إضافة باقة جديدة' }}
            </h3>

            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">اسم الباقة (عربي)</label>
                  <input
                    type="text"
                    [(ngModel)]="formPlan.nameAr"
                    class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm"
                    placeholder="مثال: الباقة الاحترافية"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">الكود الفريد (Code)</label>
                  <input
                    type="text"
                    [(ngModel)]="formPlan.code"
                    class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm font-mono uppercase"
                    placeholder="PRO"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">الاسم بالإنجليزية</label>
                <input
                  type="text"
                  [(ngModel)]="formPlan.nameEn"
                  class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm"
                  placeholder="Professional Plan"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">وصف مختصر</label>
                <textarea
                  [(ngModel)]="formPlan.description"
                  rows="2"
                  class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm"
                  placeholder="وصف الفئة المستهدفة من العيادات..."
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">السعر الشهري (ج.م)</label>
                  <input
                    type="number"
                    [(ngModel)]="formPlan.monthlyPrice"
                    class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">السعر السنوي (ج.م)</label>
                  <input
                    type="number"
                    [(ngModel)]="formPlan.annualPrice"
                    class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">المزايا (مفصولة بفواصل)</label>
                <input
                  type="text"
                  [(ngModel)]="formPlan.featuresJson"
                  class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm"
                  placeholder="إدارة الحجوزات, الروشتة الإلكترونية, التقارير المالية"
                />
              </div>

              <div class="flex items-center gap-6 pt-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="formPlan.isPublished"
                    class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span class="text-xs font-semibold text-slate-700">نشر الباقة بالموقع وصفحة الأسعار</span>
                </label>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">ترتيب العرض</label>
                  <input
                    type="number"
                    [(ngModel)]="formPlan.displayOrder"
                    class="w-20 px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                (click)="editingPlan.set(null)"
                class="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 font-semibold"
              >
                إلغاء
              </button>
              <button
                type="button"
                (click)="savePlan()"
                class="px-5 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
              >
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class SuperAdminPlansComponent implements OnInit {
  private readonly superAdminApi = inject(SuperAdminApiService);

  readonly plans = signal<PlatformPlanDto[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly feedbackMessage = signal<string>('');
  readonly editingPlan = signal<PlatformPlanDto | null>(null);
  readonly isEditingExisting = signal<boolean>(false);

  formPlan = {
    code: '',
    nameAr: '',
    nameEn: '',
    description: '',
    monthlyPrice: 500,
    annualPrice: 5000,
    featuresJson: '',
    isPublished: true,
    isActive: true,
    displayOrder: 1
  };

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.isLoading.set(true);
    this.superAdminApi.getPlans().subscribe({
      next: (data) => {
        this.plans.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.isEditingExisting.set(false);
    this.formPlan = {
      code: '',
      nameAr: '',
      nameEn: '',
      description: '',
      monthlyPrice: 500,
      annualPrice: 5000,
      featuresJson: 'جدول المواعيد, إدارة المرضى والروشتات, التقارير',
      displayOrder: this.plans().length + 1,
      isPublished: true,
      isActive: true
    };
    this.editingPlan.set({} as any);
  }

  openEditModal(plan: PlatformPlanDto): void {
    this.isEditingExisting.set(true);
    this.editingPlan.set(plan);
    this.formPlan = {
      code: plan.code,
      nameAr: plan.nameAr,
      nameEn: plan.nameEn,
      description: plan.description || '',
      monthlyPrice: plan.monthlyPrice,
      annualPrice: plan.annualPrice,
      featuresJson: plan.featuresJson || '',
      displayOrder: plan.displayOrder,
      isPublished: plan.isPublished,
      isActive: plan.isActive
    };
  }

  savePlan(): void {
    if (!this.formPlan.nameAr.trim() || !this.formPlan.code.trim()) {
      alert('يرجى إدخال اسم الباقة والكود.');
      return;
    }

    this.superAdminApi.upsertPlan(this.formPlan).subscribe({
      next: () => {
        this.feedbackMessage.set('تم حفظ بيانات الباقة بنجاح.');
        this.editingPlan.set(null);
        this.loadPlans();
      },
      error: (err: any) => {
        this.feedbackMessage.set(err.error?.message || 'فشل حفظ الباقة.');
      }
    });
  }
}
