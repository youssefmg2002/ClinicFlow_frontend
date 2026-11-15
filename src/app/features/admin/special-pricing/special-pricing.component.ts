import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import {
  ClinicSpecialPricingSettingsDto,
  DoctorSpecialPricingItemDto,
  DoctorDto,
  SpecialPricingReportItemDto,
  AppointmentType
} from '../../../shared/models';

@Component({
  selector: 'app-special-pricing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    LoadingSkeletonComponent
  ],
  template: `
    <app-page-header
      title="الأسعار الخاصة والتخفيضات"
      subtitle="تفعيل نظام الأسعار الخاصة، تحديد أسعار مخفضة لكل طبيب، ومراجعة تقرير الاستخدام"
      [breadcrumbs]="[{ label: 'الرئيسية', url: '/admin/dashboard' }, { label: 'الأسعار الخاصة' }]"
    ></app-page-header>

    <!-- Tab navigation -->
    <div class="flex items-center gap-2 border-b border-border-main mb-6">
      <button
        type="button"
        (click)="activeTab.set('settings')"
        class="pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer"
        [ngClass]="activeTab() === 'settings' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'"
      >
        إعدادات الأسعار الخاصة
      </button>
      <button
        type="button"
        (click)="activeTab.set('report')"
        class="pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer"
        [ngClass]="activeTab() === 'report' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'"
      >
        تقرير استخدام الأسعار الخاصة
      </button>
    </div>

    @if (isLoading()) {
      <app-loading-skeleton type="card" [count]="3"></app-loading-skeleton>
    } @else if (activeTab() === 'settings') {
      <!-- 1. System Master Toggle & Rules Box -->
      <div class="bg-white rounded-3xl border border-border-main p-6 mb-6 shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
          <div>
            <h3 class="text-base font-bold text-text-main">تفعيل نظام الأسعار الخاصة في العيادة</h3>
            <p class="text-xs text-text-muted mt-0.5">عند تفعيله، يظهر خيار تطبيق السعر الخاص للسكرتير أثناء الحجز</p>
          </div>

          <label class="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              [(ngModel)]="isSpecialPricingEnabled"
              (change)="saveSettingsToggle()"
              class="sr-only peer"
            />
            <div class="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            <span class="mr-3 text-xs font-bold text-text-main">
              {{ isSpecialPricingEnabled ? 'النظام مفعّل' : 'النظام معطل' }}
            </span>
          </label>
        </div>

        <div class="mt-4">
          <label class="block text-xs font-bold text-text-main mb-1.5">الشروط والقواعد المعلنة للعيادة (اختياري)</label>
          <div class="flex gap-2">
            <input
              type="text"
              [(ngModel)]="announcedRulesInput"
              placeholder="مثال: خصم خاص للحالات الإنسانية ورعاية الأيتام ومحاربي السرطان"
              class="flex-1 px-3 py-2 bg-slate-50 border border-border-main rounded-xl text-xs text-text-main"
            />
            <button
              type="button"
              (click)="saveSettingsToggle()"
              class="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              حفظ الوصف
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Doctor Special Pricing Cards -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-bold text-text-main">تحديد الأسعار الخاصة لكل طبيب</h3>
        <button
          type="button"
          (click)="openAddDoctorSpecialPriceModal()"
          class="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-primary text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          + إضافة سعر خاص لطبيب
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (item of settings()?.doctorSpecialPrices; track item.id) {
          <div class="bg-white rounded-2xl border border-border-main p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="font-bold text-text-main text-sm">{{ item.doctorName }}</span>
                <span class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {{ item.appointmentType === 'NewExam' ? 'كشف جديد' : 'استشارة' }}
                </span>
              </div>

              <div class="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-center text-xs">
                <div>
                  <p class="text-[10px] text-text-muted">الأساسي</p>
                  <p class="font-bold text-text-main mt-0.5 font-sans">{{ item.basePrice }} ج.م</p>
                </div>
                <div>
                  <p class="text-[10px] text-emerald-700 font-bold">الخاص</p>
                  <p class="font-black text-emerald-700 mt-0.5 font-sans">{{ item.specialPrice }} ج.م</p>
                </div>
                <div>
                  <p class="text-[10px] text-amber-700 font-bold">الخصم</p>
                  <p class="font-black text-amber-700 mt-0.5 font-sans">{{ item.discountAmount }} ج.م</p>
                </div>
              </div>

              @if (item.conditionsNotes) {
                <p class="text-[11px] text-text-muted mt-3">
                  <strong class="text-text-main">ملاحظات:</strong> {{ item.conditionsNotes }}
                </p>
              }
            </div>

            <div class="pt-3 mt-3 border-t border-border-subtle flex items-center justify-between text-xs">
              <span class="text-emerald-600 font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                مفعّل للحجز
              </span>
            </div>
          </div>
        }
      </div>
    } @else {
      <!-- 2. Usage Report Tab -->
      <div class="bg-white rounded-2xl border border-border-main overflow-hidden shadow-xs">
        <div class="p-4 border-b border-border-subtle flex items-center justify-between">
          <h3 class="text-base font-bold text-text-main">سجل الحالات التي استفادت من الأسعار الخاصة</h3>
          <span class="text-xs text-text-muted">توثيق رقابي إداري شامل</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr class="bg-slate-50/70 text-text-muted border-b border-border-subtle font-bold">
                <th class="py-3 px-4 rounded-r-xl">تاريخ التطبيق</th>
                <th class="py-3 px-4">المريض</th>
                <th class="py-3 px-4">الطبيب</th>
                <th class="py-3 px-4">السكرتير المدخل</th>
                <th class="py-3 px-4">السعر الأصلي</th>
                <th class="py-3 px-4">السعر بعد التخفيض</th>
                <th class="py-3 px-4">قيمة التخفيض</th>
                <th class="py-3 px-4 rounded-l-xl">السبب / الملاحظة</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              @for (rep of usageReport(); track rep.usageId) {
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="py-3 px-4 text-text-muted">
                    {{ rep.appointmentDate }}
                  </td>
                  <td class="py-3 px-4 font-bold text-text-main">
                    {{ rep.patientName }}
                  </td>
                  <td class="py-3 px-4 text-text-main">
                    {{ rep.doctorName }}
                  </td>
                  <td class="py-3 px-4 font-semibold text-text-muted">
                    {{ rep.secretaryName }}
                  </td>
                  <td class="py-3 px-4 font-sans text-slate-500 line-through">
                    {{ rep.basePrice }} ج.م
                  </td>
                  <td class="py-3 px-4 font-bold font-sans text-emerald-700">
                    {{ rep.specialPrice }} ج.م
                  </td>
                  <td class="py-3 px-4 font-bold font-sans text-amber-700">
                    {{ rep.discountAmount }} ج.م
                  </td>
                  <td class="py-3 px-4 text-text-muted text-xs">
                    {{ rep.specialPriceNotes || 'بدون ملاحظات' }}
                  </td>
                </tr>
              }
              @if (usageReport().length === 0) {
                <tr>
                  <td colspan="8" class="text-center py-8 text-text-muted text-xs">
                    لم يتم تسجيل أي استخدامات للأسعار الخاصة حتى الآن.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }

    <!-- Modal: Add Doctor Special Price -->
    @if (isModalOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" (click)="isModalOpen.set(false)"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-border-main text-right" dir="rtl">
            <h3 class="text-base font-black text-text-main mb-4">تحديد سعر خاص لطبيب</h3>

            <div class="space-y-4 text-xs sm:text-sm">
              <div>
                <label class="block font-bold text-text-main mb-1.5">اختر الطبيب *</label>
                <select [(ngModel)]="selectedDoctorId" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl">
                  @for (doc of doctors(); track doc.doctorId) {
                    <option [value]="doc.doctorId">{{ doc.fullName }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="block font-bold text-text-main mb-1.5">نوع الحجز *</label>
                <select [(ngModel)]="selectedAppointmentType" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl">
                  <option value="NewExam">كشف جديد</option>
                  <option value="Consultation">استشارة</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-text-main mb-1.5">السعر الخاص بعد الخصم (ج.م) *</label>
                <input type="number" [(ngModel)]="specialPriceInput" min="0" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl font-bold" />
              </div>

              <div>
                <label class="block font-bold text-text-main mb-1.5">ملاحظات / شروط التطبيق</label>
                <input type="text" [(ngModel)]="conditionsNotesInput" placeholder="مثال: لأول 5 حالات يومياً" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl" />
              </div>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle mt-6">
                <button type="button" (click)="isModalOpen.set(false)" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-text-muted rounded-xl text-xs font-bold">إلغاء</button>
                <button type="button" (click)="saveDoctorSpecialPrice()" class="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20">حفظ السعر</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class SpecialPricingComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  activeTab = signal<'settings' | 'report'>('settings');
  isLoading = signal<boolean>(true);

  settings = signal<ClinicSpecialPricingSettingsDto | null>(null);
  usageReport = signal<SpecialPricingReportItemDto[]>([]);
  doctors = signal<DoctorDto[]>([]);

  isSpecialPricingEnabled = true;
  announcedRulesInput = '';

  isModalOpen = signal<boolean>(false);
  selectedDoctorId = '';
  selectedAppointmentType: AppointmentType = 'NewExam';
  specialPriceInput = 200;
  conditionsNotesInput = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    this.api.getDoctors().subscribe({
      next: (docs) => {
        this.doctors.set(docs);
        if (docs.length > 0) this.selectedDoctorId = docs[0].doctorId;
      }
    });

    this.api.getSpecialPricingSettings().subscribe({
      next: (data) => {
        this.settings.set(data);
        this.isSpecialPricingEnabled = data.isSpecialPricingEnabled;
        this.announcedRulesInput = data.announcedRulesDescription || '';
      }
    });

    this.api.getSpecialPricingReport().subscribe({
      next: (rep) => {
        this.usageReport.set(rep);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  saveSettingsToggle(): void {
    this.api.updateSpecialPricingToggle({
      isSpecialPricingEnabled: this.isSpecialPricingEnabled,
      announcedRulesDescription: this.announcedRulesInput
    }).subscribe({
      next: () => {
        this.toast.success('تم تحديث إعدادات نظام الأسعار الخاصة بنجاح');
      }
    });
  }

  openAddDoctorSpecialPriceModal(): void {
    this.specialPriceInput = 200;
    this.conditionsNotesInput = '';
    this.isModalOpen.set(true);
  }

  saveDoctorSpecialPrice(): void {
    if (!this.selectedDoctorId) return;

    this.api.upsertDoctorSpecialPricing(this.selectedDoctorId, {
      appointmentType: this.selectedAppointmentType,
      specialPrice: this.specialPriceInput,
      conditionsNotes: this.conditionsNotesInput,
      isActive: true
    }).subscribe({
      next: () => {
        this.toast.success('تم حفظ السعر الخاص للطبيب بنجاح');
        this.isModalOpen.set(false);
        this.loadData();
      }
    });
  }
}
