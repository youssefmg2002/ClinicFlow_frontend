import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import { DoctorPricingDto } from '../../../shared/models';

@Component({
  selector: 'app-pricing-management',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, LoadingSkeletonComponent],
  template: `
    <app-page-header
      title="أسعار الكشف والاستشارة"
      subtitle="تحديد وضبط أسعار الكشف الجديد والاستشارة لكل طبيب في العيادة"
      [breadcrumbs]="[{ label: 'الرئيسية', url: '/admin/dashboard' }, { label: 'الأسعار' }]"
    >
      <div actions>
        <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          قاعدة الأمان: تغيير الأسعار يطبق على الحجوزات المستقبلية فقط، ولا يغير الحجوزات القديمة المسجلة
        </span>
      </div>
    </app-page-header>

    @if (isLoading()) {
      <app-loading-skeleton type="card" [count]="3"></app-loading-skeleton>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (pricing of doctorPricings(); track pricing.doctorId) {
          <div class="bg-white rounded-3xl border border-border-main p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-3 pb-4 mb-4 border-b border-border-subtle">
                <div class="w-12 h-12 rounded-2xl bg-blue-50 text-primary border border-blue-100 flex items-center justify-center font-bold text-lg">
                  {{ pricing.doctorName.charAt(0) }}
                </div>
                <div>
                  <h3 class="font-extrabold text-base text-text-main">{{ pricing.doctorName }}</h3>
                  <p class="text-xs text-text-muted">الأسعار المعتمدة للعيادة</p>
                </div>
              </div>

              <div class="space-y-3">
                <div class="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                  <span class="text-xs font-bold text-emerald-900">سعر الكشف الجديد</span>
                  <span class="text-base font-black text-emerald-700 font-sans">
                    {{ pricing.newExamPrice }} ج.م
                  </span>
                </div>

                <div class="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                  <span class="text-xs font-bold text-blue-900">سعر الاستشارة</span>
                  <span class="text-base font-black text-blue-700 font-sans">
                    {{ pricing.consultationPrice }} ج.م
                  </span>
                </div>
              </div>
            </div>

            <div class="pt-5 mt-5 border-t border-border-subtle">
              <button
                type="button"
                (click)="openEditModal(pricing)"
                class="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-border-main text-text-main font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                تعديل أسعار الطبيب
              </button>
            </div>
          </div>
        }
      </div>
    }

    <!-- Edit Pricing Modal -->
    @if (isModalOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" (click)="isModalOpen.set(false)"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-border-main text-right" dir="rtl">
            <h3 class="text-base font-black text-text-main mb-1">تعديل أسعار الطبيب</h3>
            <p class="text-xs text-text-muted mb-4">{{ selectedPricing()?.doctorName }}</p>

            <div class="space-y-4 text-xs sm:text-sm">
              <div>
                <label class="block font-bold text-text-main mb-1.5">سعر الكشف الجديد (ج.م) *</label>
                <input type="number" [(ngModel)]="newExamPriceInput" min="0" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 font-bold" />
              </div>

              <div>
                <label class="block font-bold text-text-main mb-1.5">سعر الاستشارة (ج.م) *</label>
                <input type="number" [(ngModel)]="consultationPriceInput" min="0" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 font-bold" />
              </div>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle mt-6">
                <button type="button" (click)="isModalOpen.set(false)" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-text-muted rounded-xl text-xs font-bold">
                  إلغاء
                </button>
                <button type="button" (click)="savePricing()" class="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20">
                  حفظ الأسعار
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class PricingManagementComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  isLoading = signal<boolean>(true);
  doctorPricings = signal<DoctorPricingDto[]>([]);

  isModalOpen = signal<boolean>(false);
  selectedPricing = signal<DoctorPricingDto | null>(null);

  newExamPriceInput = 300;
  consultationPriceInput = 150;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.api.getDoctorPricings().subscribe({
      next: (data) => {
        this.doctorPricings.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openEditModal(pricing: DoctorPricingDto): void {
    this.selectedPricing.set(pricing);
    this.newExamPriceInput = pricing.newExamPrice;
    this.consultationPriceInput = pricing.consultationPrice;
    this.isModalOpen.set(true);
  }

  savePricing(): void {
    const p = this.selectedPricing();
    if (!p) return;

    this.api.updateDoctorPricing(p.doctorId, {
      newExamPrice: this.newExamPriceInput,
      consultationPrice: this.consultationPriceInput
    }).subscribe({
      next: (updated) => {
        this.doctorPricings.update(list => list.map(item => item.doctorId === updated.doctorId ? updated : item));
        this.toast.success('تم تحديث أسعار الطبيب بنجاح للحجوزات الجديدة');
        this.isModalOpen.set(false);
      }
    });
  }
}

