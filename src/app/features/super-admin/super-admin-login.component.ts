import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SuperAdminAuthService } from '../../core/auth/super-admin-auth.service';

@Component({
  selector: 'app-super-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans" dir="rtl">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <!-- Logo -->
        <div class="inline-flex items-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <span class="text-2xl font-black tracking-tight text-white">ClinicFlow <span class="text-blue-500 text-lg font-bold">Platform</span></span>
        </div>

        <h2 class="text-2xl font-bold text-white tracking-tight">
          تسجيل دخول المشرف العام
        </h2>
        <p class="mt-2 text-sm text-slate-400">
          بوابة الإدارة المركزية لمنصة ClinicFlow SaaS
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div class="bg-slate-900 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">

          @if (errorMessage()) {
            <div class="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-start gap-3">
              <svg class="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form (submit)="onSubmit($event)" class="space-y-5">
            <div>
              <label for="username" class="block text-sm font-medium text-slate-300 mb-1.5">
                اسم المستخدم (Username)
              </label>
              <input
                type="text"
                id="username"
                name="username"
                [(ngModel)]="username"
                required
                autocomplete="username"
                class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-500 text-sm transition-all dir-ltr text-left"
                placeholder="superadmin"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-slate-300 mb-1.5">
                كلمة المرور (Password)
              </label>
              <input
                type="password"
                id="password"
                name="password"
                [(ngModel)]="password"
                required
                autocomplete="current-password"
                class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-500 text-sm transition-all dir-ltr text-left"
                placeholder="••••••••"
              />
            </div>

            <div class="pt-2">
              <button
                type="submit"
                [disabled]="isLoading() || !username.trim() || !password"
                class="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 transition-all"
              >
                @if (isLoading()) {
                  <div class="flex items-center gap-2">
                    <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>جاري التحقق...</span>
                  </div>
                } @else {
                  <span>دخول إلى لوحة التحكم المركزية</span>
                }
              </button>
            </div>
          </form>

          <div class="mt-6 pt-6 border-t border-slate-800 text-center">
            <a routerLink="/" class="text-xs text-slate-500 hover:text-slate-400 transition-colors">
              العودة إلى الصفحة الرئيسية
            </a>
          </div>

        </div>
      </div>
    </div>
  `
})
export class SuperAdminLoginComponent {
  private readonly superAdminAuth = inject(SuperAdminAuthService);
  private readonly router = inject(Router);

  username = '';
  password = '';
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.username.trim() || !this.password) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.superAdminAuth.login(
      this.username.trim(),
      this.password
    ).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/super-admin/dashboard']);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'اسم المستخدم أو كلمة المرور غير صحيحة.');
      }
    });
  }
}
