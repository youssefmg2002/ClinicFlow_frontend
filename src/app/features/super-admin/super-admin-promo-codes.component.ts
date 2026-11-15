import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuperAdminApiService } from '../../core/services/super-admin-api.service';
import { PlatformPromoCodeDto } from '../../shared/models';

@Component({
  selector: 'app-super-admin-promo-codes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 lg:p-8 space-y-6 font-sans max-w-7xl mx-auto" dir="rtl">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">كوبونات الخصم والعروض الترويجية</h1>
          <p class="text-sm text-slate-500 mt-1">
            إنشاء وإدارة أكواد التخفيض، نسبة الخصم، عدد مرات الاستخدام، وتواريخ الصلاحية
          </p>
        </div>

        <button
          type="button"
          (click)="showCreateModal.set(true)"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>إنشاء كود خصم جديد</span>
        </button>
      </div>

      <!-- Feedback Banner -->
      @if (feedbackMessage()) {
        <div class="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm flex items-center justify-between">
          <span>{{ feedbackMessage() }}</span>
          <button (click)="feedbackMessage.set('')" class="text-blue-500 hover:text-blue-700 text-xs font-bold">إغلاق</button>
        </div>
      }

      <!-- Promo Codes Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        @if (isLoading()) {
          <div class="p-12 text-center text-slate-400">جاري تحميل أكواد الخصم...</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-right text-sm">
              <thead class="bg-slate-50 text-slate-500 text-xs font-semibold uppercase">
                <tr>
                  <th class="px-6 py-3.5">الكود الترويجي</th>
                  <th class="px-6 py-3.5">نوع وقيمة الخصم</th>
                  <th class="px-6 py-3.5">مرات الاستخدام</th>
                  <th class="px-6 py-3.5">الفترة الزمنية للصلاحية</th>
                  <th class="px-6 py-3.5">الحالة</th>
                  <th class="px-6 py-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                @if (promoCodes().length === 0) {
                  <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-slate-400 text-sm">
                      لا توجد أكواد خصم منشأة حالياً.
                    </td>
                  </tr>
                }
                @for (promo of promoCodes(); track promo.id) {
                  <tr class="hover:bg-slate-50/60 transition-colors">
                    <td class="px-6 py-4">
                      <span class="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        {{ promo.code }}
                      </span>
                    </td>
                    <td class="px-6 py-4 font-bold text-blue-600">
                      @if (promo.discountType === 'Percentage') {
                        {{ promo.discountValue }}% خصم
                      } @else {
                        {{ promo.discountValue }} ج.م خصم ثابت
                      }
                    </td>
                    <td class="px-6 py-4 text-xs">
                      <span class="font-bold text-slate-800">{{ promo.currentUses }}</span>
                      <span class="text-slate-400"> / {{ promo.maxTotalUses ? promo.maxTotalUses : 'بلا حد' }}</span>
                    </td>
                    <td class="px-6 py-4 text-xs font-mono">
                      {{ promo.validFrom | date:'yyyy/MM/dd' }} &larr; {{ promo.validTo | date:'yyyy/MM/dd' }}
                    </td>
                    <td class="px-6 py-4">
                      @if (promo.isActive) {
                        <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          مفعل
                        </span>
                      } @else {
                        <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                          معطل
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4 text-center">
                      <button
                        type="button"
                        (click)="toggleActive(promo)"
                        class="text-xs font-bold px-2.5 py-1 rounded-lg transition-colors"
                        [class]="promo.isActive ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'"
                      >
                        {{ promo.isActive ? 'تعطيل' : 'تفعيل' }}
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Create Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 class="text-lg font-bold text-slate-900">إنشاء كود خصم جديد</h3>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">الكود (مثال: WELCOME20)</label>
                <input
                  type="text"
                  [(ngModel)]="newPromo.code"
                  class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm font-mono uppercase"
                  placeholder="EID2026"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">نوع الخصم</label>
                  <select
                    [(ngModel)]="newPromo.discountType"
                    class="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  >
                    <option value="Percentage">نسبة مئوية (%)</option>
                    <option value="FixedAmount">مبلغ ثابت (ج.م)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">قيمة الخصم</label>
                  <input
                    type="number"
                    [(ngModel)]="newPromo.discountValue"
                    class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm"
                    placeholder="20"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">أقصى عدد مرات استخدام إجمالية</label>
                <input
                  type="number"
                  [(ngModel)]="newPromo.maxTotalUses"
                  class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm"
                  placeholder="100"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">صالح من تاريخ</label>
                  <input
                    type="date"
                    [(ngModel)]="newPromo.validFrom"
                    class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">صالح حتى تاريخ</label>
                  <input
                    type="date"
                    [(ngModel)]="newPromo.validTo"
                    class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                (click)="showCreateModal.set(false)"
                class="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 font-semibold"
              >
                إلغاء
              </button>
              <button
                type="button"
                (click)="savePromo()"
                class="px-5 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
              >
                إنشاء الكود
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class SuperAdminPromoCodesComponent implements OnInit {
  private readonly superAdminApi = inject(SuperAdminApiService);

  readonly promoCodes = signal<PlatformPromoCodeDto[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly feedbackMessage = signal<string>('');
  readonly showCreateModal = signal<boolean>(false);

  newPromo = {
    code: '',
    discountType: 'Percentage' as 'Percentage' | 'FixedAmount',
    discountValue: 20,
    maxTotalUses: 100,
    maxUsesPerClinic: 1,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0]
  };

  ngOnInit(): void {
    this.loadPromoCodes();
  }

  loadPromoCodes(): void {
    this.isLoading.set(true);
    this.superAdminApi.getPromoCodes().subscribe({
      next: (data) => {
        this.promoCodes.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  savePromo(): void {
    if (!this.newPromo.code.trim() || this.newPromo.discountValue <= 0) {
      alert('يرجى إدخال كود خصم صالح وقيمة الخصم.');
      return;
    }

    this.newPromo.code = this.newPromo.code.trim().toUpperCase();

    this.superAdminApi.createPromoCode(this.newPromo).subscribe({
      next: () => {
        this.feedbackMessage.set(`تم إنشاء كود الخصم "${this.newPromo.code}" بنجاح.`);
        this.showCreateModal.set(false);
        this.loadPromoCodes();
      },
      error: (err: any) => {
        this.feedbackMessage.set(err.error?.message || 'فشل إنشاء كود الخصم.');
      }
    });
  }

  toggleActive(promo: PlatformPromoCodeDto): void {
    this.superAdminApi.togglePromoCodeActive(promo.id, !promo.isActive).subscribe({
      next: () => {
        this.feedbackMessage.set('تم تحديث حالة كود الخصم.');
        this.loadPromoCodes();
      },
      error: (err: any) => {
        this.feedbackMessage.set(err.error?.message || 'فشل تحديث حالة كود الخصم.');
      }
    });
  }
}
