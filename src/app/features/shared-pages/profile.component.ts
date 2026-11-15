import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { UpdateOwnProfileRequest } from '../../shared/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeaderComponent],
  template: `
    <app-page-header
      title="الملف الشخصي والحساب"
      subtitle="إدارة بياناتك الشخصية ومعلومات الاتصال الخاصة بحسابك في النظام"
      [breadcrumbs]="[
        { label: 'الرئيسية', url: authService.getRoleHomeUrl() },
        { label: 'الملف الشخصي' }
      ]"
    >
      <div actions>
        <a
          [routerLink]="['/' + tenantService.clinicSlug() + '/change-password']"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-text-main text-xs font-bold transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <span>تغيير كلمة المرور</span>
        </a>
      </div>
    </app-page-header>

    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Profile Card -->
      <div class="bg-white rounded-3xl border border-border-main p-6 sm:p-8 shadow-xs">
        <!-- User Avatar & Role Badge -->
        <div class="flex items-center gap-4 pb-6 mb-6 border-b border-border-main">
          <div class="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl font-sans shrink-0">
            {{ user()?.fullName?.charAt(0) || 'U' }}
          </div>
          <div class="space-y-1">
            <h3 class="text-lg font-black text-text-main">{{ user()?.fullName }}</h3>
            <div class="flex items-center gap-2">
              <span
                class="px-2.5 py-0.5 rounded-full text-xs font-bold"
                [ngClass]="getRoleBadgeClass(user()?.role)"
              >
                {{ formatRole(user()?.role) }}
              </span>
              <span class="text-xs text-text-muted font-sans font-medium">@{{ user()?.userName }}</span>
            </div>
          </div>
        </div>

        <form (ngSubmit)="saveProfile()" class="space-y-5">
          <!-- Username (Read-Only) -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-bold text-text-main">اسم المستخدم (UserName)</label>
              <span class="text-[11px] text-text-muted font-medium">معرف حساب ثابت لا يمكن تعديله</span>
            </div>
            <input
              type="text"
              [value]="user()?.userName"
              disabled
              class="w-full text-xs font-sans font-bold text-text-muted bg-slate-100 border border-border-main rounded-xl px-3.5 py-2.5 cursor-not-allowed select-none"
            />
          </div>

          <!-- Full Name -->
          <div>
            <label class="block text-xs font-bold text-text-main mb-1.5">الاسم الكامل</label>
            <input
              type="text"
              [(ngModel)]="formData.fullName"
              name="fullName"
              required
              class="w-full text-xs font-bold text-text-main bg-slate-50 border border-border-main rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
            />
          </div>

          <!-- Phone Number -->
          <div>
            <label class="block text-xs font-bold text-text-main mb-1.5">رقم الهاتف الجوال</label>
            <input
              type="tel"
              [(ngModel)]="formData.phoneNumber"
              name="phoneNumber"
              required
              class="w-full text-xs font-sans font-bold text-text-main bg-slate-50 border border-border-main rounded-xl px-3.5 py-2.5 text-left focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
              dir="ltr"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-xs font-bold text-text-main mb-1.5">البريد الإلكتروني (اختياري)</label>
            <input
              type="email"
              [(ngModel)]="formData.email"
              name="email"
              placeholder="name@clinic.com"
              class="w-full text-xs font-sans font-medium text-text-main bg-slate-50 border border-border-main rounded-xl px-3.5 py-2.5 text-left focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
              dir="ltr"
            />
          </div>

          <!-- Actions -->
          <div class="pt-4 border-t border-border-main flex items-center justify-end gap-3">
            <button
              type="submit"
              [disabled]="isSaving() || !formData.fullName.trim() || !formData.phoneNumber.trim()"
              class="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {{ isSaving() ? 'جاري حفظ التعديلات...' : 'حفظ بيانات الملف الشخصي' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly tenantService = inject(TenantService);
  private readonly toast = inject(ToastService);

  readonly user = this.authService.currentUser;
  isSaving = signal<boolean>(false);

  formData: UpdateOwnProfileRequest = {
    fullName: '',
    phoneNumber: '',
    email: null
  };

  ngOnInit(): void {
    const u = this.user();
    if (u) {
      this.formData = {
        fullName: u.fullName,
        phoneNumber: u.phoneNumber,
        email: u.email
      };
    }
  }

  saveProfile(): void {
    if (!this.formData.fullName?.trim() || !this.formData.phoneNumber?.trim()) return;

    this.isSaving.set(true);
    this.authService.updateProfile(this.formData).subscribe({
      next: updated => {
        this.toast.success('تم حفظ وتحديث بيانات الملف الشخصي بنجاح');
        this.isSaving.set(false);
      },
      error: () => {
        this.toast.error('حدث خطأ أثناء حفظ الملف الشخصي');
        this.isSaving.set(false);
      }
    });
  }

  formatRole(role?: string | null): string {
    switch (role) {
      case 'Admin': return 'مدير النظام (Admin)';
      case 'Doctor': return 'طبيب معالج (Doctor)';
      case 'Secretary': return 'سكرتارية واستقبال (Secretary)';
      default: return role || '';
    }
  }

  getRoleBadgeClass(role?: string | null): string {
    switch (role) {
      case 'Admin': return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'Doctor': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Secretary': return 'bg-blue-50 text-blue-700 border border-blue-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
