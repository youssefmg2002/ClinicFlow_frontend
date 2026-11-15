import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-general-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans" dir="rtl">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <!-- Logo -->
        <a routerLink="/" class="inline-flex items-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
          </div>
          <span class="text-2xl font-black tracking-tight text-slate-900">Clinic<span class="text-blue-600">Flow</span></span>
        </a>

        <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">
          تسجيل الدخول إلى عيادتك
        </h2>
        <p class="mt-2 text-sm text-slate-600">
          أدخل المعرّف الخاص بعيادتك للانتقال إلى بوابة الدخول
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div class="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-100 sm:px-10">
          
          <form (submit)="onSubmit($event)" class="space-y-6">
            <div>
              <label for="clinicSlug" class="block text-sm font-semibold text-slate-700 mb-1.5">
                معرّف العيادة (Clinic Identifier / Slug)
              </label>
              <div class="relative rounded-xl shadow-sm">
                <input
                  type="text"
                  id="clinicSlug"
                  name="clinicSlug"
                  [(ngModel)]="clinicSlug"
                  (input)="onSlugInput()"
                  placeholder="مثال: alnoor أو dar-alshifa"
                  class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900 placeholder-slate-400 text-sm transition-all text-left dir-ltr"
                  required
                />
              </div>
              <p class="mt-2 text-xs text-slate-500">
                الرابط المباشر سيكون:
                <span class="font-mono text-blue-600 dir-ltr inline-block">clinicflow.com/{{ clinicSlug || 'your-clinic' }}/login</span>
              </p>
            </div>

            @if (errorMessage()) {
              <div class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {{ errorMessage() }}
              </div>
            }

            <div>
              <button
                type="submit"
                [disabled]="!clinicSlug.trim()"
                class="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 transition-all"
              >
                الانتقال إلى بوابة العيادة
              </button>
            </div>
          </form>

          <div class="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-4 text-center">
            <p class="text-xs text-slate-600">
              عيادتك غير مسجلة بعد في ClinicFlow؟
              <a routerLink="/register" class="font-bold text-blue-600 hover:text-blue-700 mr-1">
                سجل عيادتك الآن مجاناً (30 يوماً تجربة)
              </a>
            </p>

            <a routerLink="/super-admin/login" class="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <span>بوابة الإدارة المركزية (Super Admin)</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  `
})
export class GeneralLoginComponent {
  private readonly router = inject(Router);

  clinicSlug = '';
  readonly errorMessage = signal<string>('');

  onSlugInput(): void {
    this.clinicSlug = this.clinicSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    this.errorMessage.set('');
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    const clean = this.clinicSlug.trim().toLowerCase();
    if (!clean) {
      this.errorMessage.set('يرجى إدخال معرّف العيادة.');
      return;
    }

    this.router.navigate([`/${clean}/login`]);
  }
}

