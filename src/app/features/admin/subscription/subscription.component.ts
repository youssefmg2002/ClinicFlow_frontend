import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { PublicService } from '../../../core/services/public.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import { SubscriptionDto, PlatformPlanDto } from '../../../shared/models';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, LoadingSkeletonComponent],
  template: `
    <app-page-header
      title="حالة اشتراك العيادة والترقية"
      subtitle="تفاصيل الخطة الحالية، الصلاحية الزمنية، تجديد الاشتراك أو الترقية، والسداد عبر InstaPay والمحافظ الإلكترونية"
      [breadcrumbs]="[{ label: 'الرئيسية', url: '/admin/dashboard' }, { label: 'الاشتراك' }]"
    ></app-page-header>

    @if (feedbackMessage()) {
      <div class="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <span>{{ feedbackMessage() }}</span>
        </div>
        <button (click)="feedbackMessage.set('')" class="text-xs font-bold text-emerald-700 hover:text-emerald-900">إغلاق</button>
      </div>
    }

    @if (errorMessage()) {
      <div class="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>{{ errorMessage() }}</span>
        </div>
        <button (click)="errorMessage.set('')" class="text-xs font-bold text-rose-700 hover:text-rose-900">إغلاق</button>
      </div>
    }

    @if (isLoading()) {
      <app-loading-skeleton type="card" [count]="2"></app-loading-skeleton>
    } @else {
      <!-- Current Subscription Status -->
      <div class="bg-white rounded-3xl border border-border-main p-6 sm:p-8 shadow-xs mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border-subtle gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/20">
              ★
            </div>
            <div>
              <span class="text-xs font-bold text-primary uppercase tracking-wider">الباقة الحالية للعيادة</span>
              <h3 class="text-2xl font-black text-text-main mt-0.5">
                {{ sub()?.planName || 'باقة تجريبية (Trial Plan)' }}
              </h3>
            </div>
          </div>

          <div>
            @if (sub()?.isExpired) {
              <span class="inline-flex px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                منتهي الصلاحية (وضع القراءة فقط)
              </span>
            } @else {
              <span class="inline-flex px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                اشتراك ساري (نشط)
              </span>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div class="p-4 rounded-2xl bg-slate-50 border border-border-subtle">
            <span class="text-xs text-text-muted">تاريخ البداية</span>
            <p class="text-sm font-bold text-text-main mt-1 font-sans">
              {{ sub()?.startDate ? (sub()?.startDate | date:'yyyy/MM/dd') : '2026/04/01' }}
            </p>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-border-subtle">
            <span class="text-xs text-text-muted">تاريخ الانتهاء</span>
            <p class="text-sm font-bold text-text-main mt-1 font-sans">
              {{ sub()?.endDate ? (sub()?.endDate | date:'yyyy/MM/dd') : '2026/05/01' }}
            </p>
          </div>

          <div class="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
            <span class="text-xs text-primary font-bold">المتبقي على انتهاء الصلاحية</span>
            <p class="text-xl font-black text-primary mt-0.5 font-sans">
              {{ sub()?.daysRemaining || 30 }} يوماً
            </p>
          </div>
        </div>
      </div>

      <!-- Upgrade & Renew Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Payment Submission Form -->
        <div class="lg:col-span-2 bg-white rounded-3xl border border-border-main p-6 sm:p-8 shadow-xs space-y-6">
          <div class="border-b border-border-subtle pb-4">
            <h3 class="text-lg font-bold text-slate-900">ترقية الخطة أو سداد الاشتراك</h3>
            <p class="text-xs text-slate-500 mt-1">اختر الباقة، طبق كود الخصم، ثم ارفع إيصال التحويل للاعتماد الفوري</p>
          </div>

          <form (submit)="submitPayment($event)" class="space-y-5">
            <!-- Select Plan -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-2">اختر الباقة المراد الاشتراك بها</label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                @for (plan of availablePlans(); track plan.id) {
                  <div
                    (click)="selectedPlanId = plan.id; onPlanOrCycleChanged()"
                    class="p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between"
                    [class]="selectedPlanId === plan.id ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300'"
                  >
                    <div>
                      <div class="font-bold text-sm text-slate-900">{{ plan.nameAr || plan.code }}</div>
                      <div class="text-xs text-slate-500 mt-1">
                        {{ billingCycle === 'Annual' ? plan.annualPrice + ' ج.م / سنوياً' : plan.monthlyPrice + ' ج.م / شهرياً' }}
                      </div>
                    </div>
                    <div class="text-[11px] text-slate-400 mt-3 font-mono">
                      كود: {{ plan.code }}
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Billing Cycle Switch -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-2">دورة الفوترة</label>
              <div class="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  (click)="billingCycle = 'Monthly'; onPlanOrCycleChanged()"
                  [class]="billingCycle === 'Monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'"
                  class="px-4 py-2 rounded-lg transition-all"
                >
                  اشتراك شهري
                </button>
                <button
                  type="button"
                  (click)="billingCycle = 'Annual'; onPlanOrCycleChanged()"
                  [class]="billingCycle === 'Annual' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'"
                  class="px-4 py-2 rounded-lg transition-all"
                >
                  اشتراك سنوي (خصم شهرين مجاناً)
                </button>
              </div>
            </div>

            <!-- Promo Code Section -->
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <label class="block text-xs font-semibold text-slate-700">لديك كود خصم أو كوبون ترويجي؟</label>
              <div class="flex gap-2">
                <input
                  type="text"
                  [(ngModel)]="promoCode"
                  name="promoCode"
                  placeholder="مثال: CLINIC2026"
                  class="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-sm font-mono uppercase bg-white"
                />
                <button
                  type="button"
                  (click)="applyPromo()"
                  [disabled]="!promoCode.trim() || isValidatingPromo()"
                  class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50"
                >
                  {{ isValidatingPromo() ? 'جاري التحقق...' : 'تطبيق الخصم' }}
                </button>
              </div>

              @if (promoDiscountApplied() > 0) {
                <div class="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span>تم تطبيق خصم بقيمة {{ promoDiscountApplied() }} ج.م!</span>
                </div>
              }
            </div>

            <!-- Price Summary -->
            <div class="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
              <div>
                <span class="text-xs font-semibold text-slate-600">المبلغ الإجمالي المستحق للسداد:</span>
                <div class="text-2xl font-black text-blue-700 mt-0.5">
                  {{ calculatedAmount() }} <span class="text-xs font-normal">جنيه مصري</span>
                </div>
              </div>
              @if (promoDiscountApplied() > 0) {
                <div class="text-xs text-slate-500 line-through">
                  {{ originalAmount() }} ج.م
                </div>
              }
            </div>

            <!-- Payment Method & Transfer Details -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">طريقة التحويل المستخدمة</label>
                <select
                  [(ngModel)]="paymentMethod"
                  name="paymentMethod"
                  class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm bg-white"
                >
                  <option value="InstaPay">إنستاباي (InstaPay)</option>
                  <option value="VodafoneCash">محفظة فودافون كاش (Vodafone Cash)</option>
                  <option value="OrangeCash">أورانج كاش (Orange Cash)</option>
                  <option value="EtisalatCash">اتصالات كاش (Etisalat Cash)</option>
                  <option value="BankTransfer">تحويل بنكي مباشر (CIB / الأهلي / مصر)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">رقم المعاملة / المرجع (Ref Number)</label>
                <input
                  type="text"
                  [(ngModel)]="referenceNumber"
                  name="referenceNumber"
                  required
                  placeholder="مثال: TXN-89234823"
                  class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-mono dir-ltr text-right"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">رقم المحفظة / الحساب المُرسل منه</label>
                <input
                  type="text"
                  [(ngModel)]="senderIdentifier"
                  name="senderIdentifier"
                  placeholder="010XXXXXXXX أو اسم الحساب"
                  class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm dir-ltr text-right"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">رابط صورة الإيصال (Receipt URL)</label>
                <input
                  type="text"
                  [(ngModel)]="receiptUrl"
                  name="receiptUrl"
                  placeholder="https://... أو اسم ملف الإيصال"
                  class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm dir-ltr text-right"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                [disabled]="isSubmitting() || !referenceNumber.trim() || !selectedPlanId"
                class="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 transition-all"
              >
                {{ isSubmitting() ? 'جاري إرسال الطلب...' : 'إرسال بيانات التحويل للاعتماد الفوري' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Payment Instructions Card -->
        <div class="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div class="space-y-6">
            <div>
              <span class="text-xs font-bold text-blue-400 uppercase tracking-wider">تعليمات الدفع والتحويل</span>
              <h4 class="text-lg font-bold text-white mt-1">بيانات الحسابات الرسمية</h4>
              <p class="text-xs text-slate-400 mt-1">حول المبلغ المطلوب عبر إحدى القنوات المعتمدة أدناه:</p>
            </div>

            <!-- InstaPay -->
            <div class="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div class="flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>إنستاباي (InstaPay)</span>
                <span class="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full">تحويل فوري</span>
              </div>
              <div class="text-sm font-mono font-bold text-white dir-ltr text-right">clinicflow&#64;instapay</div>
            </div>

            <!-- Vodafone Cash -->
            <div class="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div class="flex items-center justify-between text-xs font-bold text-rose-400">
                <span>فودافون كاش (Vodafone Cash)</span>
                <span class="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded-full">محفظة</span>
              </div>
              <div class="text-sm font-mono font-bold text-white dir-ltr text-right">01099887766</div>
            </div>

            <!-- Bank Transfer -->
            <div class="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div class="text-xs font-bold text-blue-400">تحويل بنكي (البنك التجاري الدولي CIB)</div>
              <div class="text-xs text-slate-300">اسم الحساب: شركة ClinicFlow لإدارة المنظومات الطبية</div>
              <div class="text-xs font-mono text-slate-300 dir-ltr text-right">IBAN: EG45000000000000000000000</div>
            </div>
          </div>

          <div class="pt-6 mt-6 border-t border-slate-800 text-xs text-slate-400 space-y-2">
            <p>يتم التحقق من التحويل وتفعيل الباقة آلياً خلال أقل من 15 دقيقة من استلام الطلب.</p>
            <p class="text-blue-400 font-semibold">للدعم الفني السريع: 01000000000</p>
          </div>
        </div>

      </div>
    }
  `
})
export class SubscriptionComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly publicService = inject(PublicService);

  readonly isLoading = signal<boolean>(true);
  readonly sub = signal<SubscriptionDto | null>(null);
  readonly availablePlans = signal<PlatformPlanDto[]>([]);
  readonly feedbackMessage = signal<string>('');
  readonly errorMessage = signal<string>('');

  selectedPlanId: string = '';
  billingCycle: 'Monthly' | 'Annual' = 'Annual';
  paymentMethod: string = 'InstaPay';
  referenceNumber: string = '';
  senderIdentifier: string = '';
  receiptUrl: string = '';
  promoCode: string = '';

  originalAmount = signal<number>(0);
  calculatedAmount = signal<number>(0);
  promoDiscountApplied = signal<number>(0);
  isValidatingPromo = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    this.api.getSubscription().subscribe({
      next: (data) => {
        this.sub.set(data);
      },
      error: () => {}
    });

    this.publicService.getPublishedPlans().subscribe({
      next: (plans: PlatformPlanDto[]) => {
        this.availablePlans.set(plans);
        if (plans.length > 0) {
          this.selectedPlanId = plans[0].id;
          this.onPlanOrCycleChanged();
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onPlanOrCycleChanged(): void {
    const plan = this.availablePlans().find(p => p.id === this.selectedPlanId);
    if (!plan) return;

    const basePrice = this.billingCycle === 'Annual' ? plan.annualPrice : plan.monthlyPrice;
    this.originalAmount.set(basePrice);
    this.promoDiscountApplied.set(0);
    this.calculatedAmount.set(basePrice);
  }

  applyPromo(): void {
    if (!this.promoCode.trim()) return;

    this.isValidatingPromo.set(true);
    this.errorMessage.set('');

    this.api.validatePromoCode(this.promoCode.trim(), this.originalAmount()).subscribe({
      next: (res: any) => {
        this.isValidatingPromo.set(false);
        if (res.isValid) {
          this.promoDiscountApplied.set(res.discountAmount);
          this.calculatedAmount.set(res.finalAmount);
        } else {
          this.errorMessage.set(res.message || 'كود الخصم غير صالح أو منتهي الصلاحية.');
        }
      },
      error: (err: any) => {
        this.isValidatingPromo.set(false);
        this.errorMessage.set(err.error?.message || 'كود الخصم غير صحيح.');
      }
    });
  }

  submitPayment(event: Event): void {
    event.preventDefault();
    if (!this.selectedPlanId || !this.referenceNumber.trim()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.feedbackMessage.set('');

    this.api.submitManualPayment({
      planId: this.selectedPlanId,
      billingCycle: this.billingCycle,
      method: this.paymentMethod,
      amount: this.calculatedAmount(),
      referenceNumber: this.referenceNumber.trim(),
      receiptImageUrl: this.receiptUrl.trim() || undefined,
      senderIdentifier: this.senderIdentifier.trim() || undefined,
      promoCode: this.promoDiscountApplied() > 0 ? this.promoCode.trim() : undefined
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.feedbackMessage.set('تم إرسال إيصال وبيانات التحويل بنجاح! يقوم فريق المنصة بمراجعته وتفعيل الباقة فورياً.');
        this.referenceNumber = '';
        this.receiptUrl = '';
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'فشل إرسال بيانات التحويل. يرجى المحاولة لاحقاً.');
      }
    });
  }
}
