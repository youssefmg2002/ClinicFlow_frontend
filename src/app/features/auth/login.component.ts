import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-app-bg flex items-center justify-center p-4 sm:p-6 lg:p-8" dir="rtl">
      <div class="max-w-4xl w-full bg-white rounded-3xl border border-border-main shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <!-- Right Column: Login Form -->
        <div class="p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <!-- Header Brand -->
            <div class="flex items-center gap-3 mb-8">
              <div class="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center p-2 shadow-md shadow-primary/20">
                <img src="/assets/brand/clinicflow-mark.png" alt="شعار كلينيك فلو" class="w-full h-full object-contain" />
              </div>
              <div>
                <h2 class="text-2xl font-black text-text-main font-sans tracking-tight">Clinic<span class="text-primary">Flow</span></h2>
                <p class="text-xs text-text-muted font-medium">{{ tenantService.clinicName() }}</p>
              </div>
            </div>

            <div class="mb-6">
              <h1 class="text-xl font-black text-text-main">مرحباً بك في كلينيك فلو</h1>
              <p class="text-xs sm:text-sm text-text-muted mt-1">سجل دخولك للمتابعة على نظام إدارة العيادة</p>
            </div>

            <!-- Error Banner -->
            @if (errorMessage()) {
              <div class="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 text-rose-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
              <!-- Username Field -->
              <div>
                <label for="userName" class="block text-xs font-bold text-text-main mb-1.5">اسم المستخدم</label>
                <div class="relative">
                  <input
                    id="userName"
                    type="text"
                    formControlName="userName"
                    placeholder="أدخل اسم المستخدم"
                    autocomplete="username"
                    class="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-border-main rounded-xl text-sm text-text-main placeholder:text-text-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                @if (form.get('userName')?.touched && form.get('userName')?.errors?.['required']) {
                  <p class="text-rose-600 text-[11px] mt-1 font-medium">اسم المستخدم مطلوب.</p>
                }
              </div>

              <!-- Password Field -->
              <div>
                <label for="password" class="block text-xs font-bold text-text-main mb-1.5">كلمة المرور</label>
                <div class="relative">
                  <input
                    id="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="أدخل كلمة المرور"
                    autocomplete="current-password"
                    class="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-border-main rounded-xl text-sm text-text-main placeholder:text-text-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    (click)="toggleShowPassword()"
                    class="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted hover:text-text-main cursor-pointer"
                    [attr.aria-label]="showPassword() ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'"
                  >
                    @if (showPassword()) {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    }
                  </button>
                </div>
                @if (form.get('password')?.touched && form.get('password')?.errors?.['required']) {
                  <p class="text-rose-600 text-[11px] mt-1 font-medium">كلمة المرور مطلوبة.</p>
                }
              </div>

              <!-- Remember Me & Forgot Password -->
              <div class="flex items-center justify-between text-xs pt-1">
                <label class="flex items-center gap-2 cursor-pointer select-none text-text-muted">
                  <input type="checkbox" formControlName="rememberMe" class="rounded border-border-main text-primary focus:ring-primary/20" />
                  <span>تذكرني على هذا الجهاز</span>
                </label>
                <span class="text-text-muted hover:text-primary transition-colors cursor-pointer">نسيت كلمة المرور؟</span>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="form.invalid || authService.isLoading()"
                class="w-full mt-2 py-3 px-4 bg-primary hover:bg-primary-hover disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-md shadow-primary/25 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
              >
                @if (authService.isLoading()) {
                  <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>جاري تسجيل الدخول...</span>
                } @else {
                  <span>دخول للنظام</span>
                }
              </button>
            </form>

            <!-- Quick Demo Accounts (for effortless testing) -->
            <div class="mt-6 pt-5 border-t border-border-subtle">
              <p class="text-[11px] font-bold text-text-muted mb-2">حسابات تجريبية سريعة:</p>
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  (click)="fillCredentials('admin', 'Admin@123')"
                  class="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-primary text-xs font-semibold border border-blue-200 transition-colors cursor-pointer"
                >
                  المدير (admin)
                </button>
                <button
                  type="button"
                  (click)="fillCredentials('dr_ahmed', 'Doctor@123')"
                  class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
                >
                  الطبيب (dr_ahmed)
                </button>
                <button
                  type="button"
                  (click)="fillCredentials('sec_sarah', 'Sec@123')"
                  class="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200 transition-colors cursor-pointer"
                >
                  الاستقبال (sec_sarah)
                </button>
              </div>
            </div>
          </div>

          <p class="text-center text-[11px] text-text-muted mt-8">
            جميع الحقوق محفوظة © {{ currentYear }} ClinicFlow
          </p>
        </div>

        <!-- Left Column: Visual Brand & Illustration -->
        <div class="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 border-r border-border-subtle relative overflow-hidden">
          <div class="relative z-10">
            <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/80 backdrop-blur-xs text-primary border border-blue-100 shadow-xs mb-4">
              إدارة العيادات الذكية
            </span>
            <h3 class="text-2xl font-black text-navy-sidebar leading-tight font-sans">
              إدارة عيادتك بكل سهولة ومن مكان واحد
            </h3>
            <p class="text-xs text-text-muted mt-2 leading-relaxed">
              حل برمجي متكامل لإدارة الحجوزات، قائمة الانتظار، السجلات الطبية، والتقارير المالية بدقة واحترافية.
            </p>
          </div>

          <!-- Doctor Reception Illustration -->
          <div class="my-6 relative z-10 flex items-center justify-center">
            <img
              src="/assets/illustrations/doctor-reception.png"
              alt="طبيب واستقبال عيادة"
              class="max-h-64 object-contain rounded-2xl drop-shadow-md"
            />
          </div>

          <!-- Feature Bullets -->
          <div class="relative z-10 grid grid-cols-2 gap-3 text-xs">
            <div class="flex items-center gap-2 text-text-main font-semibold">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>تنظيم دور المرضى تلقائياً</span>
            </div>
            <div class="flex items-center gap-2 text-text-main font-semibold">
              <span class="w-2 h-2 rounded-full bg-primary"></span>
              <span>عزل السجلات الطبية والخصوصية</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  readonly tenantService = inject(TenantService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);

  showPassword = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  currentYear = new Date().getFullYear();

  form = this.fb.group({
    userName: ['admin', [Validators.required]],
    password: ['Admin@123', [Validators.required]],
    rememberMe: [true]
  });

  toggleShowPassword(): void {
    this.showPassword.update(v => !v);
  }

  fillCredentials(user: string, pass: string): void {
    this.form.patchValue({
      userName: user,
      password: pass
    });
    this.errorMessage.set(null);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.errorMessage.set(null);
    const { userName, password } = this.form.value;

    this.authService.login({
      userName: userName!,
      password: password!
    }).subscribe({
      next: (response) => {
        this.toastService.success(`مرحباً بك ${response.user.fullName}`, 'تم تسجيل الدخول');
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else {
          const home = this.authService.getRoleHomeUrl(response.user.role);
          this.router.navigateByUrl(home);
        }
      },
      error: (err) => {
        const msg = err.error?.message || 'اسم المستخدم أو كلمة المرور غير صحيحة.';
        this.errorMessage.set(msg);
      }
    });
  }
}
