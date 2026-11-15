import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PublicService } from '../../core/services/public.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans" dir="rtl">
      
      <!-- Brand Header -->
      <div class="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <a routerLink="/" class="inline-flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-blue-600/30">
            CF
          </div>
          <span class="text-3xl font-black text-slate-900 font-sans tracking-tight">ClinicFlow</span>
        </a>
        <h2 class="mt-4 text-2xl sm:text-3xl font-black text-slate-900">
          تسجيل عيادة جديدة وبدء التجربة المجانية
        </h2>
        <p class="mt-2 text-xs sm:text-sm text-slate-600">
          أدخل بيانات عيادتك لبدء تجربة كاملة لمدة 30 يوماً. لا يلزم إدخال بطاقة بنكية.
        </p>
      </div>

      <!-- Registration Form Card -->
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div class="bg-white py-8 px-6 sm:px-10 shadow-sm rounded-3xl border border-slate-200">
          
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
            
            <!-- Section 1: Clinic Data -->
            <div class="border-b border-slate-100 pb-5 space-y-4">
              <h3 class="text-sm font-bold text-blue-600 flex items-center gap-2">
                <span>🏥</span>
                <span>بيانات العيادة أو المركز الطبي</span>
              </h3>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">اسم العيادة *</label>
                <input 
                  type="text" 
                  formControlName="clinicName"
                  (input)="onClinicNameInput()"
                  placeholder="مثال: عيادة النور التخصصية"
                  class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all">
                @if (form.get('clinicName')?.touched && form.get('clinicName')?.errors?.['required']) {
                  <p class="text-rose-600 text-xs mt-1">اسم العيادة مطلوب.</p>
                }
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">المدينة *</label>
                  <input 
                    type="text" 
                    formControlName="city"
                    placeholder="مثال: القاهرة"
                    class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all">
                  @if (form.get('city')?.touched && form.get('city')?.errors?.['required']) {
                    <p class="text-rose-600 text-xs mt-1">المدينة مطلوبة.</p>
                  }
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">العنوان بالتفصيل (اختياري)</label>
                  <input 
                    type="text" 
                    formControlName="address"
                    placeholder="مثال: شارع التسعين، التجمع الخامس"
                    class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all">
                </div>
              </div>

              <!-- Slug Input with availability indicator -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  رابط العيادة (Clinic Slug) *
                </label>
                <div class="relative flex items-center">
                  <span class="absolute left-3 text-xs font-mono text-slate-400 select-none ltr">clinicflow.com/</span>
                  <input 
                    type="text" 
                    formControlName="clinicSlug"
                    (input)="onSlugInput()"
                    placeholder="alnoor"
                    class="w-full pl-32 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-mono ltr text-left focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all">
                </div>
                
                <!-- Slug status message -->
                @if (isCheckingSlug()) {
                  <p class="text-slate-500 text-xs mt-1">جارٍ التحقق من توفر الرابط...</p>
                } @else if (slugMessage()) {
                  <p [class.text-emerald-600]="slugAvailable()" [class.text-rose-600]="!slugAvailable()" class="text-xs mt-1 font-bold">
                    {{ slugMessage() }}
                  </p>
                }
              </div>
            </div>

            <!-- Section 2: Owner / Admin Data -->
            <div class="border-b border-slate-100 pb-5 space-y-4">
              <h3 class="text-sm font-bold text-blue-600 flex items-center gap-2">
                <span>👤</span>
                <span>بيانات صاحب العيادة / المدير الأول</span>
              </h3>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">الاسم بالكامل *</label>
                <input 
                  type="text" 
                  formControlName="adminFullName"
                  placeholder="د. أحمد الشناوي"
                  class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all">
                @if (form.get('adminFullName')?.touched && form.get('adminFullName')?.errors?.['required']) {
                  <p class="text-rose-600 text-xs mt-1">الاسم بالكامل مطلوب.</p>
                }
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف (لتلقي رمز التحقق) *</label>
                  <input 
                    type="tel" 
                    formControlName="adminPhoneNumber"
                    placeholder="01012345678"
                    class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all">
                  @if (form.get('adminPhoneNumber')?.touched && form.get('adminPhoneNumber')?.errors?.['required']) {
                    <p class="text-rose-600 text-xs mt-1">رقم الهاتف إلزامي.</p>
                  }
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني (اختياري)</label>
                  <input 
                    type="email" 
                    formControlName="adminEmail"
                    placeholder="doctor@example.com"
                    class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">اسم المستخدم لتسجيل الدخول *</label>
                <input 
                  type="text" 
                  formControlName="adminUserName"
                  placeholder="admin"
                  class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all">
                @if (form.get('adminUserName')?.touched && form.get('adminUserName')?.errors?.['required']) {
                  <p class="text-rose-600 text-xs mt-1">اسم المستخدم مطلوب.</p>
                }
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">كلمة المرور *</label>
                  <input 
                    type="password" 
                    formControlName="adminPassword"
                    placeholder="••••••••"
                    class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all">
                  @if (form.get('adminPassword')?.touched && form.get('adminPassword')?.errors?.['minlength']) {
                    <p class="text-rose-600 text-xs mt-1">يجب ألا تقل عن 8 أحرف.</p>
                  }
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">تأكيد كلمة المرور *</label>
                  <input 
                    type="password" 
                    formControlName="confirmPassword"
                    placeholder="••••••••"
                    class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all">
                  @if (form.hasError('mismatch') && form.get('confirmPassword')?.touched) {
                    <p class="text-rose-600 text-xs mt-1">كلمتا المرور غير متطابقتين.</p>
                  }
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div>
              <button 
                type="submit" 
                [disabled]="isSubmitting() || form.invalid || (slugMessage() && !slugAvailable())"
                class="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                @if (isSubmitting()) {
                  <span>جارٍ إنشاء الحساب وإرسال رمز التحقق...</span>
                } @else {
                  <span>إنشاء الحساب والمتابعة لتأكيد الهاتف ←</span>
                }
              </button>
            </div>

            <div class="text-center text-xs text-slate-500">
              بالتسجيل في ClinicFlow، أنت توافق على شروط الخدمة وسياسة الخصوصية.
            </div>

          </form>

        </div>

        <div class="text-center mt-6 text-sm text-slate-600">
          لديك حساب عيادة بالفعل؟
          <a routerLink="/login" class="font-bold text-blue-600 hover:text-blue-700">تسجيل الدخول هنا</a>
        </div>
      </div>

    </div>
  `
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly publicService = inject(PublicService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly isSubmitting = signal<boolean>(false);
  readonly isCheckingSlug = signal<boolean>(false);
  readonly slugAvailable = signal<boolean>(false);
  readonly slugMessage = signal<string>('');

  private slugDebounceTimer?: any;

  readonly form: FormGroup = this.fb.group({
    clinicName: ['', [Validators.required, Validators.maxLength(200)]],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    address: [''],
    clinicSlug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
    adminFullName: ['', [Validators.required, Validators.maxLength(200)]],
    adminPhoneNumber: ['', [Validators.required, Validators.maxLength(32)]],
    adminEmail: ['', [Validators.email]],
    adminUserName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    adminPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(g: FormGroup) {
    return g.get('adminPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onClinicNameInput(): void {
    const name = this.form.get('clinicName')?.value || '';
    if (!this.form.get('clinicSlug')?.dirty && name) {
      // Suggest slug from name (transliteration / ascii or simple fallback)
      const suggested = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      const slugVal = suggested || 'clinic-' + Math.floor(1000 + Math.random() * 9000);
      this.form.patchValue({ clinicSlug: slugVal }, { emitEvent: false });
      this.checkSlug(slugVal);
    }
  }

  onSlugInput(): void {
    const slug = this.form.get('clinicSlug')?.value || '';
    clearTimeout(this.slugDebounceTimer);
    this.slugDebounceTimer = setTimeout(() => {
      this.checkSlug(slug);
    }, 400);
  }

  private checkSlug(slug: string): void {
    if (!slug || slug.length < 3) {
      this.slugMessage.set('');
      this.slugAvailable.set(false);
      return;
    }

    this.isCheckingSlug.set(true);
    this.publicService.checkSlugAvailability(slug).subscribe({
      next: (res) => {
        this.isCheckingSlug.set(false);
        this.slugAvailable.set(res.isAvailable);
        this.slugMessage.set(res.message);
      },
      error: () => {
        this.isCheckingSlug.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const val = this.form.value;

    this.publicService.createRegistrationDraft({
      clinicName: val.clinicName,
      city: val.city,
      address: val.address || undefined,
      clinicSlug: val.clinicSlug,
      adminFullName: val.adminFullName,
      adminPhoneNumber: val.adminPhoneNumber,
      adminEmail: val.adminEmail || undefined,
      adminUserName: val.adminUserName,
      adminPassword: val.adminPassword
    }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.toast.success('تم إنشاء طلب التسجيل وإرسال رمز التحقق (OTP) إلى هاتفك.', 'تأكيد الحساب');
        this.router.navigate(['/register/verify'], {
          queryParams: {
            draftId: res.draftId,
            slug: res.clinicSlug,
            phone: res.maskedPhone
          }
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || 'تعذر إنشاء الحساب، يرجى مراجعة البيانات.';
        this.toast.error(msg, 'فشل التسجيل');
      }
    });
  }
}

