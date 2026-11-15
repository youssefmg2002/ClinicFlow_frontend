import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicService } from '../../core/services/public.service';
import { PlatformPlanDto } from '../../shared/models';

@Component({
  selector: 'app-pricing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" dir="rtl">
      
      <!-- Top Navigation -->
      <header class="bg-white border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl">CF</div>
            <span class="text-xl font-black text-slate-900">ClinicFlow</span>
          </a>
          <div class="flex items-center gap-3">
            <a routerLink="/" class="text-sm font-bold text-slate-600 hover:text-blue-600 px-3 py-2">الرئيسية</a>
            <a routerLink="/login" class="text-sm font-bold text-slate-700 hover:text-blue-600 px-3 py-2">تسجيل الدخول</a>
            <a routerLink="/register" class="px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all">ابدأ التجربة المجانية</a>
          </div>
        </div>
      </header>

      <!-- Main Pricing Section -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <div class="text-center max-w-3xl mx-auto mb-12">
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">خطط واشتراكات ClinicFlow</span>
          <h1 class="text-3xl sm:text-5xl font-black text-slate-900 mt-3">اختر الباقة الأنسب لعيادتك الطبية</h1>
          <p class="text-slate-600 text-sm sm:text-base mt-3">كل الباقات تشمل 30 يوماً تجربة مجانية كاملة بدون أي التزام مالي مسبق.</p>

          <!-- Toggle Monthly / Annual -->
          <div class="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
            <button 
              type="button" 
              (click)="isAnnual.set(false)"
              [class.bg-white]="!isAnnual()"
              [class.shadow-xs]="!isAnnual()"
              [class.text-blue-600]="!isAnnual()"
              class="px-5 py-2 rounded-xl text-xs font-bold transition-all text-slate-600">
              الدفع الشهري
            </button>
            <button 
              type="button" 
              (click)="isAnnual.set(true)"
              [class.bg-white]="isAnnual()"
              [class.shadow-xs]="isAnnual()"
              [class.text-blue-600]="isAnnual()"
              class="px-5 py-2 rounded-xl text-xs font-bold transition-all text-slate-600 flex items-center gap-1.5">
              <span>الدفع السنوي</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">توفير شهرين</span>
            </button>
          </div>
        </div>

        <!-- Plans Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          @for (plan of plans(); track plan.id) {
            <div 
              [class.ring-2]="plan.code === 'PRO'"
              [class.ring-blue-600]="plan.code === 'PRO'"
              class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative">
              
              @if (plan.code === 'PRO') {
                <span class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-black bg-blue-600 text-white shadow-xs">
                  الخيار الموصى به
                </span>
              }

              <div>
                <h3 class="text-xl font-bold text-slate-900">{{ plan.nameAr }}</h3>
                <p class="text-xs text-slate-500 mt-1 min-h-[36px]">{{ plan.description }}</p>

                <div class="my-6 pb-6 border-b border-slate-100">
                  <div class="flex items-baseline gap-1">
                    <span class="text-4xl font-black text-slate-950 font-mono">
                      {{ isAnnual() ? plan.annualPrice : plan.monthlyPrice }}
                    </span>
                    <span class="text-sm font-bold text-slate-600">{{ plan.currency }}</span>
                    <span class="text-xs text-slate-400">/ {{ isAnnual() ? 'سنوياً' : 'شهرياً' }}</span>
                  </div>
                </div>

                <ul class="space-y-3.5 text-xs text-slate-600">
                  @for (feature of parseFeatures(plan.featuresJson); track feature) {
                    <li class="flex items-center gap-2.5">
                      <span class="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">✓</span>
                      <span>{{ feature }}</span>
                    </li>
                  }
                </ul>
              </div>

              <div class="mt-8 pt-6 border-t border-slate-100">
                <a routerLink="/register" class="w-full block py-3 rounded-xl text-center font-bold text-sm transition-all"
                   [class.bg-blue-600]="plan.code === 'PRO'"
                   [class.text-white]="plan.code === 'PRO'"
                   [class.hover:bg-blue-700]="plan.code === 'PRO'"
                   [class.bg-slate-100]="plan.code !== 'PRO'"
                   [class.text-slate-800]="plan.code !== 'PRO'"
                   [class.hover:bg-slate-200]="plan.code !== 'PRO'">
                  ابدأ 30 يوماً مجاناً
                </a>
              </div>
            </div>
          }
        </div>

        <!-- 30-Day Guarantee Banner -->
        <div class="max-w-4xl mx-auto mt-16 p-6 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
          <div>
            <h4 class="font-bold text-blue-950 text-base">شروط التجربة المجانية (30 يوماً):</h4>
            <p class="text-xs text-blue-800 mt-1">لا يلزم إدخال بطاقة بنكية • لا يتم تحصيل أي مبالغ تلقائياً • عند انتهاء الشهر يتحول الحساب لوضع القراءة فقط دون فقدان أي بيانات.</p>
          </div>
          <a routerLink="/register" class="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs whitespace-nowrap">
            سجل الآن
          </a>
        </div>
      </main>

      <!-- Footer -->
      <footer class="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-xs text-center">
        <p>© 2026 ClinicFlow. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  `
})
export class PricingPageComponent implements OnInit {
  private readonly publicService = inject(PublicService);

  readonly plans = signal<PlatformPlanDto[]>([]);
  readonly isAnnual = signal<boolean>(false);

  ngOnInit(): void {
    this.publicService.getPublishedPlans().subscribe({
      next: (plans) => this.plans.set(plans),
      error: () => {}
    });
  }

  parseFeatures(json?: string): string[] {
    if (!json) return ['إدارة العيادة', 'طابور الانتظار اللحظي', 'الملف الطبي العام'];
    try {
      return JSON.parse(json);
    } catch {
      return ['إدارة العيادة', 'طابور الانتظار اللحظي', 'الملف الطبي العام'];
    }
  }
}

