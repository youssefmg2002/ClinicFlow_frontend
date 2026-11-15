import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TenantService } from '../../../core/tenant/tenant.service';

@Component({
  selector: 'app-onboarding-checklist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (isVisible()) {
      <div class="mb-8 rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-blue-500/20 relative overflow-hidden">
        <!-- Background decorative medical icon -->
        <div class="absolute -left-10 -bottom-10 opacity-5 pointer-events-none">
          <svg class="w-64 h-64 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4"/>
          </svg>
        </div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/20 mb-3">
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
              </svg>
              <span>تم تفعيل فترة التجربة المجانية لمدة 30 يوماً</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-white">
              مرحباً بك في منصة ClinicFlow! دليل إعداد عيادتك في دقائق
            </h2>
            <p class="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              قمنا بتهيئة عيادتك وإضافة 25 تخصصاً طبياً معتمداً وقوائم أسباب الزيارات تلقائياً. اتبع الخطوات التالية لبدء العمل واستقبال المرضى:
            </p>
          </div>

          <button
            type="button"
            (click)="dismiss()"
            class="self-start md:self-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors shrink-0"
          >
            إخفاء الدليل مؤقتاً
          </button>
        </div>

        <!-- Checklist Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 relative z-10">
          <!-- Step 1: Provisioned Specialties -->
          <div class="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div>
              <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm mb-3">
                ✓
              </div>
              <h4 class="font-bold text-sm text-white">1. التخصصات الطبية</h4>
              <p class="text-xs text-slate-400 mt-1">تمت تهيئة 25 تخصصاً طبياً قياسياً جاهزاً للاستخدام.</p>
            </div>
            <a
              [routerLink]="['/' + tenant.clinicSlug() + '/admin/specialties']"
              class="mt-4 text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
            >
              <span>مراجعة وضبط الأسعار</span>
              <span>&larr;</span>
            </a>
          </div>

          <!-- Step 2: Add Doctor -->
          <div class="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div>
              <div class="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm mb-3">
                2
              </div>
              <h4 class="font-bold text-sm text-white">2. تسجيل أول طبيب</h4>
              <p class="text-xs text-slate-400 mt-1">سجل حسابات أطباء العيادة وجداول مواعيد الكشف.</p>
            </div>
            <a
              [routerLink]="['/' + tenant.clinicSlug() + '/admin/doctors']"
              class="mt-4 text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
            >
              <span>إضافة طبيب الآن</span>
              <span>&larr;</span>
            </a>
          </div>

          <!-- Step 3: Add Receptionist -->
          <div class="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div>
              <div class="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm mb-3">
                3
              </div>
              <h4 class="font-bold text-sm text-white">3. موظف الاستقبال</h4>
              <p class="text-xs text-slate-400 mt-1">أنشئ حساب سكرتارية لإدارة الاستقبال وقائمة الانتظار.</p>
            </div>
            <a
              [routerLink]="['/' + tenant.clinicSlug() + '/admin/secretaries']"
              class="mt-4 text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
            >
              <span>إضافة سكرتير</span>
              <span>&larr;</span>
            </a>
          </div>

          <!-- Step 4: First Appointment -->
          <div class="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div>
              <div class="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm mb-3">
                4
              </div>
              <h4 class="font-bold text-sm text-white">4. حجز تجريبي</h4>
              <p class="text-xs text-slate-400 mt-1">سجل مريضاً واحجز كشفاً لاختبار تدفق الدور والروشتات.</p>
            </div>
            <a
              [routerLink]="['/' + tenant.clinicSlug() + '/admin/appointments']"
              class="mt-4 text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
            >
              <span>إنشاء حجز جديد</span>
              <span>&larr;</span>
            </a>
          </div>
        </div>
      </div>
    }
  `
})
export class OnboardingChecklistComponent {
  readonly tenant = inject(TenantService);
  readonly isVisible = signal<boolean>(true);

  dismiss(): void {
    this.isVisible.set(false);
  }
}

