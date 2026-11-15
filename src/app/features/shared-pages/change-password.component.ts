import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ChangeOwnPasswordRequest } from '../../shared/models';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeaderComponent],
  template: `
    <app-page-header
      title="تغيير كلمة المرور"
      subtitle="تحديث كلمة المرور لتعزيز أمان حسابك في عيادة ClinicFlow"
      [breadcrumbs]="[
        { label: 'الرئيسية', url: authService.getRoleHomeUrl() },
        { label: 'الملف الشخصي', url: '/' + tenantService.clinicSlug() + '/profile' },
        { label: 'تغيير كلمة المرور' }
      ]"
    ></app-page-header>

    <div class="max-w-xl mx-auto">
      <div class="bg-white rounded-3xl border border-border-main p-6 sm:p-8 shadow-xs">
        <form (ngSubmit)="submitChange()" class="space-y-5">
          <!-- Current Password -->
          <div>
            <label class="block text-xs font-bold text-text-main mb-1.5">كلمة المرور الحالية</label>
            <div class="relative">
              <input
                [type]="showCurrentPassword() ? 'text' : 'password'"
                [(ngModel)]="currentPassword"
                name="currentPassword"
                required
                placeholder="أدخل كلمة المرور الحالية"
                class="w-full text-xs font-medium text-text-main bg-slate-50 border border-border-main rounded-xl px-3.5 py-2.5 pl-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
              />
              <button
                type="button"
                (click)="showCurrentPassword.set(!showCurrentPassword())"
                class="absolute left-3 top-2.5 text-text-muted hover:text-text-main"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- New Password -->
          <div>
            <label class="block text-xs font-bold text-text-main mb-1.5">كلمة المرور الجديدة</label>
            <div class="relative">
              <input
                [type]="showNewPassword() ? 'text' : 'password'"
                [(ngModel)]="newPassword"
                name="newPassword"
                required
                minlength="6"
                placeholder="6 أحرف أو أرقام على الأقل"
                class="w-full text-xs font-medium text-text-main bg-slate-50 border border-border-main rounded-xl px-3.5 py-2.5 pl-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
              />
              <button
                type="button"
                (click)="showNewPassword.set(!showNewPassword())"
                class="absolute left-3 top-2.5 text-text-muted hover:text-text-main"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Confirm New Password -->
          <div>
            <label class="block text-xs font-bold text-text-main mb-1.5">تأكيد كلمة المرور الجديدة</label>
            <div class="relative">
              <input
                [type]="showConfirmPassword() ? 'text' : 'password'"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                required
                placeholder="أعد إدخال كلمة المرور الجديدة"
                class="w-full text-xs font-medium text-text-main bg-slate-50 border border-border-main rounded-xl px-3.5 py-2.5 pl-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
              />
              <button
                type="button"
                (click)="showConfirmPassword.set(!showConfirmPassword())"
                class="absolute left-3 top-2.5 text-text-muted hover:text-text-main"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            @if (newPassword && confirmPassword && newPassword !== confirmPassword) {
              <p class="text-[11px] text-rose-600 font-bold mt-1.5">كلمات المرور غير متطابقة</p>
            }
          </div>

          <!-- Actions -->
          <div class="pt-4 border-t border-border-main flex items-center justify-between">
            <a
              [routerLink]="['/' + tenantService.clinicSlug() + '/profile']"
              class="px-4 py-2.5 text-xs font-bold text-text-muted hover:text-text-main hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </a>
            <button
              type="submit"
              [disabled]="isSaving() || !isFormValid()"
              class="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {{ isSaving() ? 'جاري التحديث...' : 'تحديث كلمة المرور' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ChangePasswordComponent {
  readonly authService = inject(AuthService);
  readonly tenantService = inject(TenantService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  showCurrentPassword = signal<boolean>(false);
  showNewPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  isFormValid(): boolean {
    return (
      this.currentPassword.length > 0 &&
      this.newPassword.length >= 6 &&
      this.newPassword === this.confirmPassword
    );
  }

  submitChange(): void {
    if (!this.isFormValid()) return;

    this.isSaving.set(true);
    const req: ChangeOwnPasswordRequest = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    };

    this.authService.changePassword(req).subscribe({
      next: () => {
        this.toast.success('تم تغيير كلمة المرور بنجاح');
        this.isSaving.set(false);
        this.router.navigate([`/${this.tenantService.clinicSlug()}/profile`]);
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'تعذر تغيير كلمة المرور، يرجى التأكد من كلمة المرور الحالية');
        this.isSaving.set(false);
      }
    });
  }
}

