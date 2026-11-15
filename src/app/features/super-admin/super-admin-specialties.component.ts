import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuperAdminApiService } from '../../core/services/super-admin-api.service';
import { PlatformMasterSpecialtyDto } from '../../shared/models';

@Component({
  selector: 'app-super-admin-specialties',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 lg:p-8 space-y-6 font-sans max-w-7xl mx-auto" dir="rtl">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">التخصصات الطبية المرجعية القياسية (25)</h1>
          <p class="text-sm text-slate-500 mt-1">
            القائمة المعتمدة للتخصصات الطبية التي تُجهّز تلقائياً لكل عيادة جديدة عند التسجيل الذاتي
          </p>
        </div>

        <button
          type="button"
          (click)="openCreateModal()"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>إضافة تخصص مرجعي</span>
        </button>
      </div>

      <!-- Feedback Banner -->
      @if (feedbackMessage()) {
        <div class="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm flex items-center justify-between">
          <span>{{ feedbackMessage() }}</span>
          <button (click)="feedbackMessage.set('')" class="text-blue-500 hover:text-blue-700 text-xs font-bold">إغلاق</button>
        </div>
      }

      <!-- Specialties Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        @if (isLoading()) {
          <div class="p-12 text-center text-slate-400">جاري تحميل التخصصات المرجعية...</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-right text-sm">
              <thead class="bg-slate-50 text-slate-500 text-xs font-semibold uppercase">
                <tr>
                  <th class="px-6 py-3.5">الترتيب</th>
                  <th class="px-6 py-3.5">التخصص الطبي</th>
                  <th class="px-6 py-3.5">الكود المرجعي</th>
                  <th class="px-6 py-3.5">الوصف العام</th>
                  <th class="px-6 py-3.5">الحالة</th>
                  <th class="px-6 py-3.5 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                @for (spec of specialties(); track spec.id) {
                  <tr class="hover:bg-slate-50/60 transition-colors">
                    <td class="px-6 py-4 font-mono text-xs text-slate-400">
                      {{ spec.displayOrder }}
                    </td>
                    <td class="px-6 py-4">
                      <div class="font-bold text-slate-900">{{ spec.nameAr }}</div>
                    </td>
                    <td class="px-6 py-4 font-mono text-xs text-blue-600 font-bold">
                      {{ spec.code }}
                    </td>
                    <td class="px-6 py-4 text-xs text-slate-500 max-w-sm">
                      {{ spec.descriptionAr || '-' }}
                    </td>
                    <td class="px-6 py-4">
                      @if (spec.isActive) {
                        <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          نشط
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
                        (click)="openEditModal(spec)"
                        class="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-colors"
                      >
                        تعديل
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Edit / Create Modal -->
      @if (activeSpecialty()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 class="text-lg font-bold text-slate-900">
              {{ isEditingExisting() ? 'تعديل التخصص: ' + formSpecialty.nameAr : 'إضافة تخصص مرجعي جديد' }}
            </h3>

            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">اسم التخصص (عربي)</label>
                  <input
                    type="text"
                    [(ngModel)]="formSpecialty.nameAr"
                    class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm"
                    placeholder="مثال: طب الأطفال وحديثي الولادة"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">الكود الإنجليزي الفريد</label>
                  <input
                    type="text"
                    [(ngModel)]="formSpecialty.code"
                    class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm font-mono uppercase"
                    placeholder="PEDIATRICS"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">الوصف العام ونطاق الكشف</label>
                <textarea
                  [(ngModel)]="formSpecialty.descriptionAr"
                  rows="3"
                  class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm"
                  placeholder="وصف مختصر للتشخيصات ونطاق التخصص..."
                ></textarea>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">ترتيب العرض</label>
                  <input
                    type="number"
                    [(ngModel)]="formSpecialty.displayOrder"
                    class="w-24 px-3 py-1.5 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <label class="flex items-center gap-2 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="formSpecialty.isActive"
                    class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span class="text-xs font-semibold text-slate-700">تفعيل التخصص</span>
                </label>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                (click)="activeSpecialty.set(null)"
                class="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 font-semibold"
              >
                إلغاء
              </button>
              <button
                type="button"
                (click)="saveSpecialty()"
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
export class SuperAdminSpecialtiesComponent implements OnInit {
  private readonly superAdminApi = inject(SuperAdminApiService);

  readonly specialties = signal<PlatformMasterSpecialtyDto[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly feedbackMessage = signal<string>('');
  readonly activeSpecialty = signal<PlatformMasterSpecialtyDto | null>(null);
  readonly isEditingExisting = signal<boolean>(false);

  formSpecialty = {
    id: undefined as string | undefined,
    code: '',
    nameAr: '',
    descriptionAr: '',
    displayOrder: 1,
    isActive: true
  };

  ngOnInit(): void {
    this.loadSpecialties();
  }

  loadSpecialties(): void {
    this.isLoading.set(true);
    this.superAdminApi.getMasterSpecialties().subscribe({
      next: (data) => {
        this.specialties.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.isEditingExisting.set(false);
    this.formSpecialty = {
      id: undefined,
      code: '',
      nameAr: '',
      descriptionAr: '',
      displayOrder: this.specialties().length + 1,
      isActive: true
    };
    this.activeSpecialty.set({} as any);
  }

  openEditModal(spec: PlatformMasterSpecialtyDto): void {
    this.isEditingExisting.set(true);
    this.activeSpecialty.set(spec);
    this.formSpecialty = {
      id: spec.id,
      code: spec.code,
      nameAr: spec.nameAr,
      descriptionAr: spec.descriptionAr || '',
      displayOrder: spec.displayOrder,
      isActive: spec.isActive
    };
  }

  saveSpecialty(): void {
    if (!this.formSpecialty.nameAr.trim() || !this.formSpecialty.code.trim()) {
      alert('يرجى إدخال اسم التخصص والكود.');
      return;
    }

    this.superAdminApi.upsertMasterSpecialty(this.formSpecialty).subscribe({
      next: () => {
        this.feedbackMessage.set('تم حفظ التخصص الطبي المرجعي بنجاح.');
        this.activeSpecialty.set(null);
        this.loadSpecialties();
      },
      error: (err: any) => {
        this.feedbackMessage.set(err.error?.message || 'فشل حفظ التخصص.');
      }
    });
  }
}
