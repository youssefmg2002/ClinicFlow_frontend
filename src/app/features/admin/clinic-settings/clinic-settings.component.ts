import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { TenantService } from '../../../core/tenant/tenant.service';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import { ClinicSettingsDto } from '../../../shared/models';

@Component({
  selector: 'app-clinic-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    LoadingSkeletonComponent
  ],
  template: `
    <app-page-header
      title="إعدادات العيادة والهوية"
      subtitle="تعديل اسم العيادة الرسمي، الشعار، بيانات التواصل، وعنوان المقر"
      [breadcrumbs]="[{ label: 'الرئيسية', url: '/admin/dashboard' }, { label: 'إعدادات العيادة' }]"
    ></app-page-header>

    @if (isLoading()) {
      <app-loading-skeleton type="card" [count]="2"></app-loading-skeleton>
    } @else {
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 1. Logo Card -->
        <div class="bg-white rounded-3xl border border-border-main p-6 shadow-xs flex flex-col items-center justify-between text-center">
          <div class="w-full">
            <h3 class="text-base font-bold text-text-main mb-1">شعار العيادة</h3>
            <p class="text-xs text-text-muted mb-6">يظهر في شاشة تسجيل الدخول والترويسة</p>

            <div class="w-36 h-36 mx-auto rounded-3xl bg-slate-50 border-2 border-dashed border-border-main p-4 flex items-center justify-center relative overflow-hidden shadow-xs mb-4">
              <img
                [src]="logoPreview() || '/assets/brand/clinicflow-logo.png'"
                alt="شعار العيادة"
                class="w-full h-full object-contain"
              />
            </div>
            <p class="text-[11px] text-text-muted">الامتدادات المدعومة: PNG, JPEG, WebP (بحد أقصى 2MB)</p>
          </div>

          <div class="w-full pt-4 border-t border-border-subtle mt-4">
            <label class="block w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-primary font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-xs">
              <span>تغيير الشعار</span>
              <input type="file" (change)="onLogoSelected($event)" accept="image/png,image/jpeg,image/webp" class="hidden" />
            </label>
          </div>
        </div>

        <!-- 2. Settings Form -->
        <div class="lg:col-span-2 bg-white rounded-3xl border border-border-main p-6 sm:p-8 shadow-xs">
          <div class="flex items-center justify-between pb-4 mb-6 border-b border-border-subtle">
            <div>
              <h3 class="text-base font-bold text-text-main">بيانات العيادة الأساسية</h3>
              <p class="text-xs text-text-muted mt-0.5">المعلومات المعتمدة لمرضى العيادة والرسائل</p>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              واجهة عربية (RTL)
            </span>
          </div>

          <form [formGroup]="form" (ngSubmit)="saveSettings()" class="space-y-4 text-xs sm:text-sm">
            <div>
              <label class="block font-bold text-text-main mb-1.5">اسم العيادة الرسمي *</label>
              <input
                type="text"
                formControlName="clinicName"
                placeholder="عيادة النور التخصصية"
                class="w-full px-3 py-2.5 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
              @if (form.get('clinicName')?.touched && form.get('clinicName')?.invalid) {
                <p class="text-rose-600 text-[11px] mt-1 font-medium">اسم العيادة مطلوب.</p>
              }
            </div>

            <div>
              <label class="block font-bold text-text-main mb-1.5">العنوان والمقر *</label>
              <input
                type="text"
                formControlName="address"
                placeholder="123 شارع الجمهورية - القاهرة"
                class="w-full px-3 py-2.5 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-text-main mb-1.5">رقم الهاتف الرسمي *</label>
                <input
                  type="text"
                  formControlName="phoneNumber"
                  placeholder="01012345678"
                  class="w-full px-3 py-2.5 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label class="block font-bold text-text-main mb-1.5">رقم WhatsApp للتواصل</label>
                <input
                  type="text"
                  formControlName="whatsAppNumber"
                  placeholder="01012345678"
                  class="w-full px-3 py-2.5 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label class="block font-bold text-text-main mb-1.5">البريد الإلكتروني للعيادة (اختياري)</label>
              <input
                type="email"
                formControlName="email"
                placeholder="info@alnoorclinic.com"
                class="w-full px-3 py-2.5 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div class="flex items-center justify-end pt-5 border-t border-border-subtle mt-6">
              <button
                type="submit"
                [disabled]="form.invalid || isSubmitting()"
                class="px-6 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-primary/20 transition-colors cursor-pointer"
              >
                حفظ التغييرات
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class ClinicSettingsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly tenantService = inject(TenantService);

  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  logoPreview = signal<string | null>(null);

  form = this.fb.group({
    clinicName: ['', [Validators.required]],
    address: ['', [Validators.required]],
    phoneNumber: ['', [Validators.required]],
    whatsAppNumber: [''],
    email: ['']
  });

  ngOnInit(): void {
    this.api.getClinicSettings().subscribe({
      next: (settings) => {
        this.form.patchValue({
          clinicName: settings.clinicName,
          address: settings.address,
          phoneNumber: settings.phoneNumber,
          whatsAppNumber: settings.whatsAppNumber || '',
          email: settings.email || ''
        });
        this.logoPreview.set(settings.hasLogo ? '/assets/brand/clinicflow-logo.png' : null);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onLogoSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.toast.error('الحد الأقصى لحجم الشعار هو 2 ميجابايت');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview.set(reader.result as string);
        this.toast.success('تم تحميل الشعار ومعاينته بنجاح');
      };
      reader.readAsDataURL(file);
    }
  }

  saveSettings(): void {
    if (this.form.invalid) return;
    this.isSubmitting.set(true);

    const val = this.form.value;
    this.api.updateClinicSettings({
      clinicName: val.clinicName!,
      address: val.address!,
      phoneNumber: val.phoneNumber!,
      whatsAppNumber: val.whatsAppNumber || null,
      email: val.email || null
    }).subscribe({
      next: (res) => {
        this.toast.success('تم حفظ إعدادات العيادة بنجاح');
        this.tenantService.setClinicDetails(res.clinicName, res.hasLogo);
        this.isSubmitting.set(false);
      },
      error: () => this.isSubmitting.set(false)
    });
  }
}

