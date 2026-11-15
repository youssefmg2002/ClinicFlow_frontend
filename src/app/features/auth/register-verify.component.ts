import { Component, OnInit, OnDestroy, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PublicService } from '../../core/services/public.service';
import { AuthService } from '../../core/auth/auth.service';
import { TenantService } from '../../core/tenant/tenant.service';

@Component({
  selector: 'app-register-verify',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans" dir="rtl">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <!-- Logo -->
        <div class="flex justify-center items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
          </div>
          <span class="text-2xl font-black tracking-tight text-slate-900">Clinic<span class="text-blue-600">Flow</span></span>
        </div>

        <h2 class="mt-6 text-center text-2xl font-extrabold text-slate-900 tracking-tight">
          تأكيد رقم الهاتف وتهيئة العيادة
        </h2>
        <p class="mt-2 text-center text-sm text-slate-600">
          تم إرسال رمز التحقق (OTP) المكوّن من 6 أرقام في رسالة نصية SMS إلى الرقم:
          <span class="font-bold text-slate-800 dir-ltr inline-block mr-1">{{ phone() }}</span>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div class="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-100 sm:px-10">

          <!-- Error Alert -->
          @if (errorMessage()) {
            <div class="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
              <svg class="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <!-- Success Banner -->
          @if (successMessage()) {
            <div class="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
              <svg class="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>{{ successMessage() }}</span>
            </div>
          }

          <!-- Digits Input Boxes -->
          <div class="mb-8">
            <label class="block text-sm font-semibold text-slate-700 text-center mb-4">
              أدخل رمز التحقق
            </label>
            <div class="flex justify-center gap-2.5 sm:gap-3 dir-ltr" (paste)="onPaste($event)">
              @for (i of [0, 1, 2, 3, 4, 5]; track i) {
                <input
                  type="text"
                  inputmode="numeric"
                  maxlength="1"
                  [id]="'otp-' + i"
                  [value]="digits()[i]"
                  (input)="onDigitInput($event, i)"
                  (keydown)="onKeyDown($event, i)"
                  class="w-12 h-14 sm:w-13 sm:h-16 text-center text-2xl font-bold rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all shadow-sm bg-slate-50 focus:bg-white"
                  [disabled]="isVerifying() || !!successMessage()"
                />
              }
            </div>
          </div>

          <!-- Expiry Timer & Resend Section -->
          <div class="space-y-4 text-center">
            <div class="text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>ينتهي الرمز خلال: </span>
              <span class="font-bold text-slate-700">{{ formatTimer(expiresInSeconds()) }}</span>
            </div>

            <div class="pt-2 border-t border-slate-100 flex flex-col items-center gap-2">
              <button
                type="button"
                (click)="resendOtp()"
                [disabled]="resendCooldown() > 0 || isResending() || !!successMessage()"
                class="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                @if (isResending()) {
                  جاري الإرسال...
                } @else if (resendCooldown() > 0) {
                  إعادة إرسال الرمز بعد ({{ resendCooldown() }} ثانية)
                } @else {
                  لم يصلك الرمز؟ إعادة الإرسال
                }
              </button>
            </div>
          </div>

          <!-- Verify Action Button -->
          <div class="mt-8">
            <button
              type="button"
              (click)="verifyCode()"
              [disabled]="otpCode().length !== 6 || isVerifying() || !!successMessage()"
              class="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 transition-all"
            >
              @if (isVerifying()) {
                <div class="flex items-center gap-2">
                  <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>جاري التحقق وتجهيز العيادة...</span>
                </div>
              } @else {
                <span>تأكيد والدخول للعيادة</span>
              }
            </button>
          </div>

          <!-- Back Link -->
          <div class="mt-6 text-center">
            <a routerLink="/register" class="text-xs text-slate-500 hover:text-slate-700 transition-colors">
              الرجوع لتعديل بيانات التسجيل
            </a>
          </div>

        </div>
      </div>
    </div>
  `
})
export class RegisterVerifyComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly publicService = inject(PublicService);
  private readonly authService = inject(AuthService);
  private readonly tenantService = inject(TenantService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly draftId = signal<string>('');
  readonly clinicSlug = signal<string>('');
  readonly phone = signal<string>('');

  readonly digits = signal<string[]>(['', '', '', '', '', '']);
  readonly isVerifying = signal<boolean>(false);
  readonly isResending = signal<boolean>(false);
  readonly resendCooldown = signal<number>(60);
  readonly expiresInSeconds = signal<number>(300); // 5 minutes
  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');

  private expiryTimerHandle?: any;
  private cooldownTimerHandle?: any;

  get otpCode(): () => string {
    return () => this.digits().join('');
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.draftId.set(params['draftId'] || '');
      this.clinicSlug.set(params['slug'] || '');
      this.phone.set(params['phone'] || '');

      if (!this.draftId()) {
        this.errorMessage.set('بيانات جلسة التسجيل غير متوفرة. يرجى ملء نموذج التسجيل أولاً.');
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      this.startTimers();
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private startTimers(): void {
    this.clearTimers();

    this.expiryTimerHandle = setInterval(() => {
      const current = this.expiresInSeconds();
      if (current > 0) {
        this.expiresInSeconds.set(current - 1);
      } else {
        clearInterval(this.expiryTimerHandle);
        this.errorMessage.set('انتهت صلاحية رمز التحقق. يرجى طلب إرسال رمز جديد.');
      }
    }, 1000);

    this.cooldownTimerHandle = setInterval(() => {
      const current = this.resendCooldown();
      if (current > 0) {
        this.resendCooldown.set(current - 1);
      } else {
        clearInterval(this.cooldownTimerHandle);
      }
    }, 1000);
  }

  private clearTimers(): void {
    if (this.expiryTimerHandle) clearInterval(this.expiryTimerHandle);
    if (this.cooldownTimerHandle) clearInterval(this.cooldownTimerHandle);
  }

  formatTimer(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  onDigitInput(event: any, index: number): void {
    const val = (event.target.value || '').replace(/\D/g, '');
    const current = [...this.digits()];

    if (val.length > 0) {
      current[index] = val.slice(-1);
      this.digits.set(current);

      // Focus next input
      if (index < 5 && isPlatformBrowser(this.platformId)) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    } else {
      current[index] = '';
      this.digits.set(current);
    }

    if (this.otpCode().length === 6) {
      this.verifyCode();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.digits()[index] && index > 0) {
      if (isPlatformBrowser(this.platformId)) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        prevInput?.focus();
      }
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const cleanNumbers = pastedData.replace(/\D/g, '').slice(0, 6);
    if (!cleanNumbers) return;

    const current = ['', '', '', '', '', ''];
    for (let i = 0; i < cleanNumbers.length; i++) {
      current[i] = cleanNumbers[i];
    }
    this.digits.set(current);

    if (isPlatformBrowser(this.platformId)) {
      const focusIndex = Math.min(cleanNumbers.length, 5);
      const targetInput = document.getElementById(`otp-${focusIndex}`);
      targetInput?.focus();
    }

    if (cleanNumbers.length === 6) {
      this.verifyCode();
    }
  }

  resendOtp(): void {
    if (!this.draftId() || this.resendCooldown() > 0 || this.isResending()) return;

    this.isResending.set(true);
    this.errorMessage.set('');

    this.publicService.resendOtp(this.draftId()).subscribe({
      next: (res) => {
        this.isResending.set(false);
        this.resendCooldown.set(res.resendCooldownSeconds || 60);
        this.expiresInSeconds.set(res.otpExpiresInSeconds || 300);
        this.startTimers();
      },
      error: (err: any) => {
        this.isResending.set(false);
        this.errorMessage.set(err.error?.message || 'تعذر إعادة إرسال الرمز. يرجى المحاولة لاحقاً.');
      }
    });
  }

  verifyCode(): void {
    const code = this.otpCode();
    if (code.length !== 6 || this.isVerifying() || !this.draftId()) return;

    this.isVerifying.set(true);
    this.errorMessage.set('');

    this.publicService.verifyOtp({
      draftId: this.draftId(),
      otpCode: code
    }).subscribe({
      next: (res) => {
        this.isVerifying.set(false);
        this.successMessage.set('تم تأكيد الحساب وتهيئة العيادة وقائمة التخصصات بنجاح! جاري الانتقال...');
        
        // Save Auth Session
        this.tenantService.setClinicSlug(res.clinicSlug);
        this.authService.setSession({
          accessToken: res.accessToken,
          accessTokenExpiresAtUtc: res.trialEndDate,
          refreshToken: '',
          refreshTokenExpiresAtUtc: res.trialEndDate,
          user: {
            userId: res.clinicId,
            clinicId: res.clinicId,
            clinicSlug: res.clinicSlug,
            clinicName: res.clinicName,
            userName: res.adminUserName,
            fullName: res.adminFullName,
            phoneNumber: this.phone(),
            email: null,
            role: 'Admin',
            doctorId: null
          }
        });

        // Redirect to clinic admin dashboard with onboarding flag
        setTimeout(() => {
          this.router.navigate([`/${res.clinicSlug}/admin/dashboard`], {
            queryParams: { onboarding: 'true' }
          });
        }, 1200);
      },
      error: (err: any) => {
        this.isVerifying.set(false);
        this.errorMessage.set(err.error?.message || 'رمز التحقق غير صحيح أو انتهت صلاحيته.');
      }
    });
  }
}
