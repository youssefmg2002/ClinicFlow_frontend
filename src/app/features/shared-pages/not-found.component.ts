import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TenantService } from '../../core/tenant/tenant.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-app-bg flex items-center justify-center p-6 text-center" dir="rtl">
      <div class="max-w-md w-full bg-white rounded-3xl border border-border-main p-8 sm:p-10 shadow-xs">
        <div class="w-20 h-20 rounded-3xl bg-blue-50 text-primary mx-auto flex items-center justify-center font-black text-3xl font-sans mb-5">
          404
        </div>
        <h1 class="text-xl font-black text-text-main mb-2">الصفحة غير موجودة</h1>
        <p class="text-xs text-text-muted leading-relaxed mb-6">
          عذرًا، لم نتمكن من العثور على الصفحة التي تبحث عنها. قد يكون الرابط غير صحيح أو تم نقل الصفحة.
        </p>

        <a
          [routerLink]="homeUrl"
          class="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors shadow-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>العودة للرئيسية</span>
        </a>
      </div>
    </div>
  `
})
export class NotFoundComponent {
  private readonly tenantService = inject(TenantService);
  private readonly authService = inject(AuthService);

  get homeUrl(): string {
    return this.authService.getRoleHomeUrl();
  }
}

