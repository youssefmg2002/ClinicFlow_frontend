import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuperAdminApiService } from '../../core/services/super-admin-api.service';
import { PlatformLandingContentDto, PlatformFaqDto } from '../../shared/models';

@Component({
  selector: 'app-super-admin-cms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 lg:p-8 space-y-8 font-sans max-w-7xl mx-auto" dir="rtl">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">إدارة محتوى الموقع والصفحة الرئيسية (CMS)</h1>
          <p class="text-sm text-slate-500 mt-1">
            التحكم في العناوين التسويقية، نصوص الأزرار، أرقام التواصل والدعم الفني عبر واتساب، والأسئلة الشائعة
          </p>
        </div>

        <button
          type="button"
          (click)="saveGeneralContent()"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <span>حفظ التعديلات العامة</span>
        </button>
      </div>

      <!-- Feedback Banner -->
      @if (feedbackMessage()) {
        <div class="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm flex items-center justify-between">
          <span>{{ feedbackMessage() }}</span>
          <button (click)="feedbackMessage.set('')" class="text-blue-500 hover:text-blue-700 text-xs font-bold">إغلاق</button>
        </div>
      }

      @if (isLoading()) {
        <div class="p-12 text-center text-slate-400">جاري تحميل بيانات المحتوى...</div>
      } @else {
        <!-- General Website Settings Section -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 class="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <span>النصوص الرئيسية للصفحة الترويجية (Hero & Meta)</span>
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">عنوان الواجهة الرئيسي (Hero Title)</label>
              <input
                type="text"
                [(ngModel)]="cmsContent.heroTitle"
                class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">العنوان الفرعي المساعد (Hero Subtitle)</label>
              <textarea
                [(ngModel)]="cmsContent.heroSubtitle"
                rows="2"
                class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm"
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">نص زر الإجراء الأساسي (CTA Text)</label>
              <input
                type="text"
                [(ngModel)]="cmsContent.heroCtaText"
                class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">رقم الدعم الفني عبر واتساب (WhatsApp)</label>
              <input
                type="text"
                [(ngModel)]="cmsContent.whatsAppNumber"
                placeholder="+201000000000"
                class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm dir-ltr text-right font-mono"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">هاتف خدمة المبيعات والاستفسارات</label>
              <input
                type="text"
                [(ngModel)]="cmsContent.contactPhone"
                placeholder="01000000000"
                class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm dir-ltr text-right font-mono"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">البريد الإلكتروني الرسمي للتواصل</label>
              <input
                type="email"
                [(ngModel)]="cmsContent.contactEmail"
                placeholder="contact@clinicflow.com"
                class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm dir-ltr text-right font-mono"
              />
            </div>
          </div>
        </div>

        <!-- FAQs Management Section -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div class="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>الأسئلة الشائعة والأجوبة (Landing Page FAQs)</span>
            </h2>

            <button
              type="button"
              (click)="openAddFaqModal()"
              class="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
            >
              + إضافة سؤال جديد
            </button>
          </div>

          <div class="divide-y divide-slate-100">
            @for (faq of faqs(); track faq.id) {
              <div class="py-4 flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-mono text-xs flex items-center justify-center font-bold shrink-0">
                      {{ faq.displayOrder }}
                    </span>
                    <h4 class="font-bold text-slate-900 text-sm">{{ faq.question }}</h4>
                  </div>
                  <p class="text-xs text-slate-600 mt-2 pr-8 leading-relaxed">{{ faq.answer }}</p>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    (click)="openEditFaqModal(faq)"
                    class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    تعديل
                  </button>
                  <button
                    type="button"
                    (click)="deleteFaq(faq)"
                    class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold"
                  >
                    حذف
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- FAQ Modal -->
      @if (activeFaq()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 class="text-lg font-bold text-slate-900">
              {{ isEditingExistingFaq() ? 'تعديل السؤال الشائع' : 'إضافة سؤال شائع جديد' }}
            </h3>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">السؤال</label>
                <input
                  type="text"
                  [(ngModel)]="formFaq.question"
                  class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm"
                  placeholder="هل يدعم النظام الدفع عند الاستقبال؟"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">الإجابة التفصيلية</label>
                <textarea
                  [(ngModel)]="formFaq.answer"
                  rows="3"
                  class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm"
                  placeholder="نعم، بالتأكيد يدعم النظام تسجيل المدفوعات النقدية..."
                ></textarea>
              </div>

              <div class="flex items-center gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">ترتيب العرض</label>
                  <input
                    type="number"
                    [(ngModel)]="formFaq.displayOrder"
                    class="w-24 px-3 py-1.5 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <label class="flex items-center gap-2 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="formFaq.isPublished"
                    class="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span class="text-xs font-semibold text-slate-700">نشط ومعروض</span>
                </label>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-3">
              <button
                type="button"
                (click)="activeFaq.set(null)"
                class="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 font-semibold"
              >
                إلغاء
              </button>
              <button
                type="button"
                (click)="saveFaq()"
                class="px-5 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class SuperAdminCmsComponent implements OnInit {
  private readonly superAdminApi = inject(SuperAdminApiService);

  readonly isLoading = signal<boolean>(true);
  readonly feedbackMessage = signal<string>('');
  readonly faqs = signal<PlatformFaqDto[]>([]);
  readonly activeFaq = signal<PlatformFaqDto | null>(null);
  readonly isEditingExistingFaq = signal<boolean>(false);

  cmsContent: PlatformLandingContentDto = {
    heroTitle: 'المنظومة السحابية المتكاملة لإدارة العيادات والمراكز الطبية',
    heroSubtitle: 'سجل عيادتك الآن واحصل على تجربة مجانية كاملة المزايا لمدة 30 يوماً.',
    heroCtaText: 'ابدأ تجربتك المجانية (30 يوماً)',
    heroCtaUrl: '/register',
    whatsAppNumber: '+201000000000',
    contactPhone: '01000000000',
    contactEmail: 'contact@clinicflow.com',
    seoTitle: 'ClinicFlow - SaaS Medical Clinic System',
    seoDescription: 'إدارة العيادات الطبية السحابية وحجز المواعيد',
    featureSectionsJson: '[]',
    faqs: []
  };

  formFaq = {
    id: undefined as string | undefined,
    question: '',
    answer: '',
    displayOrder: 1,
    isPublished: true
  };

  ngOnInit(): void {
    this.loadContent();
  }

  loadContent(): void {
    this.isLoading.set(true);
    this.superAdminApi.getCmsContent().subscribe({
      next: (data) => {
        this.cmsContent = { ...data };
        this.faqs.set(data.faqs || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  saveGeneralContent(): void {
    this.superAdminApi.updateCmsContent(this.cmsContent).subscribe({
      next: () => {
        this.feedbackMessage.set('تم حفظ نصوص وبيانات الموقع بنجاح.');
      },
      error: (err: any) => {
        this.feedbackMessage.set(err.error?.message || 'فشل حفظ محتوى الموقع.');
      }
    });
  }

  openAddFaqModal(): void {
    this.isEditingExistingFaq.set(false);
    this.formFaq = {
      id: undefined,
      question: '',
      answer: '',
      displayOrder: this.faqs().length + 1,
      isPublished: true
    };
    this.activeFaq.set({} as any);
  }

  openEditFaqModal(faq: PlatformFaqDto): void {
    this.isEditingExistingFaq.set(true);
    this.activeFaq.set(faq);
    this.formFaq = {
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      displayOrder: faq.displayOrder,
      isPublished: faq.isPublished
    };
  }

  saveFaq(): void {
    if (!this.formFaq.question.trim() || !this.formFaq.answer.trim()) {
      alert('يرجى إدخال السؤال والإجابة.');
      return;
    }

    this.superAdminApi.upsertFaq(this.formFaq).subscribe({
      next: () => {
        this.feedbackMessage.set('تم حفظ السؤال الشائع بنجاح.');
        this.activeFaq.set(null);
        this.loadContent();
      },
      error: (err: any) => {
        this.feedbackMessage.set(err.error?.message || 'فشل حفظ السؤال.');
      }
    });
  }

  deleteFaq(faq: PlatformFaqDto): void {
    if (!confirm(`هل أنت متأكد من حذف سؤال "${faq.question}"؟`)) return;

    this.superAdminApi.deleteFaq(faq.id).subscribe({
      next: () => {
        this.feedbackMessage.set('تم حذف السؤال الشائع.');
        this.loadContent();
      },
      error: (err: any) => {
        this.feedbackMessage.set(err.error?.message || 'فشل حذف السؤال.');
      }
    });
  }
}
