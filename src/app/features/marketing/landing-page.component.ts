import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicService } from '../../core/services/public.service';
import { PlatformLandingContentDto, PlatformPlanDto, PlatformFaqDto } from '../../shared/models';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white" dir="rtl">
      
      <!-- TOP NAVIGATION BAR -->
      <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <!-- Logo & Brand -->
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-blue-500/25">
              CF
            </div>
            <div>
              <span class="text-2xl font-black tracking-tight text-slate-900 font-sans">ClinicFlow</span>
              <span class="block text-[11px] font-bold text-blue-600 tracking-wider uppercase -mt-1">منظومة إدارة العيادات</span>
            </div>
          </div>

          <!-- Navigation Links -->
          <nav class="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#features" class="hover:text-blue-600 transition-colors">المميزات</a>
            <a href="#how-it-works" class="hover:text-blue-600 transition-colors">طريقة العمل</a>
            <a href="#pricing" class="hover:text-blue-600 transition-colors">الأسعار والباقات</a>
            <a href="#faq" class="hover:text-blue-600 transition-colors">الأسئلة الشائعة</a>
          </nav>

          <!-- CTAs -->
          <div class="flex items-center gap-3">
            <a routerLink="/login" class="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-all">
              تسجيل الدخول
            </a>
            <a routerLink="/register" class="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 hover:shadow-lg transition-all active:scale-95">
              ابدأ تجربتك المجانية
            </a>
          </div>
        </div>
      </header>

      <!-- HERO SECTION -->
      <section class="relative pt-12 pb-20 md:py-24 overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-slate-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div class="lg:col-span-7 text-center lg:text-right space-y-6">
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-bold">
                <span class="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span>شهر تجريبي مجاني بالكامل - بدون بطاقة ائتمان</span>
              </div>

              <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.2]">
                {{ content()?.heroTitle || 'نظام سحابي ذكي لإدارة العيادات الطبية بكفاءة وهدوء' }}
              </h1>

              <p class="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                {{ content()?.heroSubtitle || 'ClinicFlow ينظم الحجوزات، طابور الانتظار اللحظي، الملف الطبي، والمدفوعات لعيادتك باحترافية وسهولة تامة، بدون تعقيدات أو بطء.' }}
              </p>

              <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a routerLink="/register" class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/30 hover:shadow-xl transition-all text-center">
                  {{ content()?.heroCtaText || 'ابدأ تجربتك المجانية لمدة 30 يومًا' }}
                </a>
                <a href="#pricing" class="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-base border border-slate-300 shadow-xs transition-all text-center">
                  استكشف الباقات الشهرية والسنوية
                </a>
              </div>

              <!-- Quick benefits row -->
              <div class="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200 text-xs text-slate-600">
                <div class="flex items-center gap-2 justify-center lg:justify-start">
                  <span class="text-emerald-600 font-bold">✓</span>
                  <span>تفعيل فوري خلال دقيقة</span>
                </div>
                <div class="flex items-center gap-2 justify-center lg:justify-start">
                  <span class="text-emerald-600 font-bold">✓</span>
                  <span>عزل بيانات طبي كامل</span>
                </div>
                <div class="flex items-center gap-2 justify-center lg:justify-start">
                  <span class="text-emerald-600 font-bold">✓</span>
                  <span>دعم كامل للجوال والتابلت</span>
                </div>
              </div>
            </div>

            <!-- UI Mockup Preview -->
            <div class="lg:col-span-5 relative">
              <div class="relative mx-auto rounded-3xl bg-slate-900 p-3 shadow-2xl border border-slate-800 text-slate-100">
                <div class="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-4">
                  <!-- Header bar -->
                  <div class="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full bg-rose-500"></div>
                      <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                      <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span class="mr-2 text-slate-400 font-mono">clinicflow.com/alnoor</span>
                    </div>
                    <span class="px-2 py-0.5 rounded-md bg-blue-900/60 text-blue-300 text-[10px] font-bold">طابور اليوم الحي</span>
                  </div>

                  <!-- Mock Queue items -->
                  <div class="space-y-2.5">
                    <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 font-mono font-bold flex items-center justify-center text-sm">#1</span>
                        <div>
                          <p class="text-xs font-bold text-white">محمد أحمد عبد الله</p>
                          <p class="text-[10px] text-slate-400">كشف جديد • د. أحمد الشناوي</p>
                        </div>
                      </div>
                      <span class="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">في غرفة الكشف</span>
                    </div>

                    <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 font-mono font-bold flex items-center justify-center text-sm">#2</span>
                        <div>
                          <p class="text-xs font-bold text-white">سارة إبراهيم فتحي</p>
                          <p class="text-[10px] text-slate-400">استشارة مجانية • تم الحضور</p>
                        </div>
                      </div>
                      <span class="px-2 py-1 rounded-md text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">التالي بالدور</span>
                    </div>

                    <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-slate-800/60 text-slate-400 font-mono font-bold flex items-center justify-center text-sm">#3</span>
                        <div>
                          <p class="text-xs font-bold text-slate-300">يوسف كريم حسني</p>
                          <p class="text-[10px] text-slate-500">كشف جديد • مسدد 400 ج.م</p>
                        </div>
                      </div>
                      <span class="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">في الانتظار</span>
                    </div>
                  </div>

                  <!-- Quick Stats Bar -->
                  <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                    <div class="p-2 rounded-lg bg-slate-900/40">
                      <span class="block text-[10px] text-slate-400">كشوفات اليوم</span>
                      <span class="text-sm font-black text-white font-mono">18</span>
                    </div>
                    <div class="p-2 rounded-lg bg-slate-900/40">
                      <span class="block text-[10px] text-slate-400">المنتظرون</span>
                      <span class="text-sm font-black text-amber-400 font-mono">5</span>
                    </div>
                    <div class="p-2 rounded-lg bg-slate-900/40">
                      <span class="block text-[10px] text-slate-400">المحصل اليوم</span>
                      <span class="text-sm font-black text-emerald-400 font-mono">6,400</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- PROBLEMS WE SOLVE -->
      <section class="py-16 bg-white border-y border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-12">
            <h2 class="text-2xl sm:text-4xl font-black text-slate-900">وداعاً لمشاكل العيادة اليومية الشائعة</h2>
            <p class="mt-3 text-slate-600 text-sm sm:text-base">تم تصميم ClinicFlow بعد معايشة حقيقية لتحديات الأطباء والسكرتارية في العيادات والمراكز الطبية.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all">
              <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg mb-4">✕</div>
              <h3 class="font-bold text-slate-900 mb-2">فوضى أرقام الدور والانتظار</h3>
              <p class="text-xs text-slate-600 leading-relaxed">نظام ذكي يوزع أرقام الأدوار اليومية تلقائياً لكل طبيب، ويسجل الحضور والتأخير دون أي تضارب أو اختلاط.</p>
            </div>

            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all">
              <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg mb-4">⚡</div>
              <h3 class="font-bold text-slate-900 mb-2">خلافات مواعيد الاستشارة</h3>
              <p class="text-xs text-slate-600 leading-relaxed">تحديد دقيق لصلاحية الاستشارة المجانية وتتبع دورة الكشف لمنع أي نزاع بين المريض والاستقبال.</p>
            </div>

            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all">
              <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">🔒</div>
              <h3 class="font-bold text-slate-900 mb-2">فصل الصلاحيات والخصوصية</h3>
              <p class="text-xs text-slate-600 leading-relaxed">السكرتير لا يقرر طبياً، المدير لا يطّلع على التشخيصات الطبية للمرضى، والطبيب يدير زياراته بحرية تامة.</p>
            </div>

            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4">💰</div>
              <h3 class="font-bold text-slate-900 mb-2">ضبط الحسابات ومنع الفقد</h3>
              <p class="text-xs text-slate-600 leading-relaxed">تسجيل فوري للمدفوعات قبل الدخول للطبيب، وتتبع استخدام الأسعار الخاصة مع تقارير مالية شفافة.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- HOW IT WORKS -->
      <section id="how-it-works" class="py-16 bg-slate-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-14">
            <h2 class="text-2xl sm:text-4xl font-black text-slate-900">كيف تبدأ استخدام ClinicFlow؟</h2>
            <p class="mt-3 text-slate-600 text-sm sm:text-base">أربع خطوات بسيطة تفصلك عن تشغيل عيادتك بمنظومة سحابية متكاملة.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
              <span class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold font-mono text-base flex items-center justify-center mx-auto border border-blue-200">1</span>
              <h3 class="font-bold text-slate-900">سجل عيادتك في دقيقة</h3>
              <p class="text-xs text-slate-600">أدخل اسم العيادة والمدينة ورقم هاتفك، وأكد الحساب عبر رمز SMS سريع.</p>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
              <span class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold font-mono text-base flex items-center justify-center mx-auto border border-blue-200">2</span>
              <h3 class="font-bold text-slate-900">تجهيز البيانات تلقائياً</h3>
              <p class="text-xs text-slate-600">يقوم النظام تلقائياً بتجهيز 25 تخصصاً طبياً وإعدادات المواعيد دون الحاجة لإدخال يدوي مجهد.</p>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
              <span class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold font-mono text-base flex items-center justify-center mx-auto border border-blue-200">3</span>
              <h3 class="font-bold text-slate-900">أضف الأطباء والسكرتارية</h3>
              <p class="text-xs text-slate-600">حدد مواعيد وأسعار الكشف والاستشارة، واربط كل سكرتير بالأطباء المصرح له بإدارتهم.</p>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
              <span class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold font-mono text-base flex items-center justify-center mx-auto border border-blue-200">4</span>
              <h3 class="font-bold text-slate-900">ابدأ العمل واستمتع بالهدوء</h3>
              <p class="text-xs text-slate-600">استقبل الحجوزات، وأدر طابور المرضى، واكتب التشخيصات وتابع الحسابات من أي جهاز.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- PRICING SECTION -->
      <section id="pricing" class="py-20 bg-white border-t border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-10">
            <h2 class="text-3xl sm:text-4xl font-black text-slate-900">باقات شفافة تناسب حجم عيادتك</h2>
            <p class="mt-3 text-slate-600 text-sm sm:text-base">ابدأ الآن بتجربة مجانية كاملة لمدة 30 يوماً، ثم اختر الخطة الأنسب لنمو عيادتك.</p>
            
            <!-- Monthly / Annual Toggle -->
            <div class="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
              <button 
                type="button" 
                (click)="isAnnual.set(false)"
                [class.bg-white]="!isAnnual()"
                [class.shadow-xs]="!isAnnual()"
                [class.text-blue-600]="!isAnnual()"
                class="px-5 py-2 rounded-xl text-xs font-bold transition-all text-slate-600">
                اشتراك شهري
              </button>
              <button 
                type="button" 
                (click)="isAnnual.set(true)"
                [class.bg-white]="isAnnual()"
                [class.shadow-xs]="isAnnual()"
                [class.text-blue-600]="isAnnual()"
                class="px-5 py-2 rounded-xl text-xs font-bold transition-all text-slate-600 flex items-center gap-1.5">
                <span>اشتراك سنوي</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">خصم شهرين</span>
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
                    الأكثر طلباً للعيادات
                  </span>
                }

                <div>
                  <h3 class="text-xl font-bold text-slate-900">{{ plan.nameAr }}</h3>
                  <p class="text-xs text-slate-500 mt-1 min-h-[32px]">{{ plan.description }}</p>

                  <div class="my-6 pb-6 border-b border-slate-100">
                    <div class="flex items-baseline gap-1">
                      <span class="text-4xl font-black text-slate-950 font-mono">
                        {{ isAnnual() ? plan.annualPrice : plan.monthlyPrice }}
                      </span>
                      <span class="text-sm font-bold text-slate-600">{{ plan.currency }}</span>
                      <span class="text-xs text-slate-400">/ {{ isAnnual() ? 'سنوياً' : 'شهرياً' }}</span>
                    </div>
                  </div>

                  <ul class="space-y-3 text-xs text-slate-600">
                    @for (feature of parseFeatures(plan.featuresJson); track feature) {
                      <li class="flex items-center gap-2.5">
                        <span class="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">✓</span>
                        <span>{{ feature }}</span>
                      </li>
                    }
                  </ul>
                </div>

                <div class="mt-8 pt-6 border-t border-slate-100">
                  <a routerLink="/register" class="w-full block py-3 rounded-xl text-center font-bold text-sm transition-all shadow-xs"
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
        </div>
      </section>

      <!-- FAQ SECTION -->
      <section id="faq" class="py-16 bg-slate-50 border-t border-slate-200">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <h2 class="text-2xl sm:text-4xl font-black text-slate-900">الأسئلة الشائعة</h2>
            <p class="mt-2 text-slate-600 text-sm">كل ما تود معرفته عن منصة ClinicFlow وكيفية التشغيل.</p>
          </div>

          <div class="space-y-4">
            @for (faq of faqs(); track faq.id; let i = $index) {
              <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all">
                <button 
                  type="button"
                  (click)="toggleFaq(i)"
                  class="w-full p-5 text-right flex items-center justify-between font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors">
                  <span>{{ faq.question }}</span>
                  <span class="text-lg font-mono text-slate-400 mr-2">{{ activeFaqIndex() === i ? '−' : '+' }}</span>
                </button>
                @if (activeFaqIndex() === i) {
                  <div class="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {{ faq.answer }}
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </section>

      <!-- FLOATING WHATSAPP CTA -->
      @if (content()?.whatsAppNumber) {
        <a 
          [href]="'https://wa.me/' + content()?.whatsAppNumber" 
          target="_blank" 
          rel="noopener"
          class="fixed bottom-6 left-6 z-40 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-transform hover:scale-105">
          <span class="text-base">💬</span>
          <span>تواصل واتساب</span>
        </a>
      }

      <!-- FOOTER -->
      <footer class="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">CF</div>
            <span class="font-bold text-white text-sm">ClinicFlow Egypt</span>
          </div>

          <div class="flex items-center gap-6 text-slate-400">
            <a routerLink="/pricing" class="hover:text-white transition-colors">الأسعار</a>
            <a routerLink="/login" class="hover:text-white transition-colors">دخول العيادات</a>
            <a routerLink="/super-admin/login" class="hover:text-white transition-colors text-slate-500">بوابة الإدارة</a>
          </div>

          <p class="text-slate-500">© 2026 ClinicFlow. جميع الحقوق محفوظة لجمهورية مصر العربية.</p>
        </div>
      </footer>

    </div>
  `
})
export class LandingPageComponent implements OnInit {
  private readonly publicService = inject(PublicService);

  readonly content = signal<PlatformLandingContentDto | null>(null);
  readonly plans = signal<PlatformPlanDto[]>([]);
  readonly faqs = signal<PlatformFaqDto[]>([]);
  readonly isAnnual = signal<boolean>(false);
  readonly activeFaqIndex = signal<number | null>(0);

  ngOnInit(): void {
    this.publicService.getLandingContent().subscribe({
      next: (data) => {
        this.content.set(data);
        this.faqs.set(data.faqs || []);
      },
      error: () => {}
    });

    this.publicService.getPublishedPlans().subscribe({
      next: (plans) => this.plans.set(plans),
      error: () => {}
    });
  }

  toggleFaq(index: number): void {
    this.activeFaqIndex.set(this.activeFaqIndex() === index ? null : index);
  }

  parseFeatures(json?: string): string[] {
    if (!json) return ['إدارة كاملة للعيادة', 'طابور الانتظار اللحظي', 'الملف الطبي العام'];
    try {
      return JSON.parse(json);
    } catch {
      return ['إدارة كاملة للعيادة', 'طابور الانتظار اللحظي', 'الملف الطبي العام'];
    }
  }
}

