import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import { SpecialtyDto, CreateSpecialtyRequest, UpdateSpecialtyRequest } from '../../../shared/models';

@Component({
  selector: 'app-specialties-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent
  ],
  template: `
    <app-page-header
      title="إدارة التخصصات الطبية"
      subtitle="قائمة التخصصات المعتمدة داخل العيادة والتي يتم ربط الأطباء وجداول العمل بها"
      [breadcrumbs]="[{ label: 'الرئيسية', url: '/admin/dashboard' }, { label: 'التخصصات' }]"
    >
      <div actions class="flex items-center gap-2">
        <button
          type="button"
          (click)="seedDefaultSpecialties()"
          [disabled]="isSeeding()"
          class="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-primary border border-blue-200 text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-60"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {{ isSeeding() ? 'جاري الاستيراد...' : 'استيراد التخصصات الأساسية' }}
        </button>
        <button
          type="button"
          (click)="openAddModal()"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-primary/20 transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          إضافة تخصص جديد
        </button>
      </div>
    </app-page-header>

    @if (isLoading()) {
      <app-loading-skeleton type="table" [count]="4"></app-loading-skeleton>
    } @else if (specialties().length === 0) {
      <app-empty-state
        title="لا توجد تخصصات مسجلة"
        message="ابدأ بإضافة التخصصات الطبية المتاحة في عيادتك."
        actionLabel="إضافة تخصص"
        (actionClick)="openAddModal()"
      ></app-empty-state>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (sp of specialties(); track sp.id) {
          <div class="bg-white rounded-2xl border border-border-main p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between gap-3 mb-2">
                <div class="flex items-center gap-2.5">
                  <div class="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold text-base shrink-0 border border-blue-100">
                    {{ sp.name.charAt(0) }}
                  </div>
                  <div>
                    <h3 class="font-bold text-text-main text-sm sm:text-base">{{ sp.name }}</h3>
                    <p class="text-[11px] text-text-muted mt-0.5">
                      مرتبط بـ {{ sp.linkedDoctorsCount }} أطباء
                    </p>
                  </div>
                </div>

                <app-status-badge [status]="sp.isActive ? 'نشط' : 'معطل'"></app-status-badge>
              </div>

              <p class="text-xs text-text-muted mt-3 line-clamp-2 leading-relaxed">
                {{ sp.description || 'لا يوجد وصف تفصيلي لهذا التخصص.' }}
              </p>
            </div>

            <div class="flex items-center justify-between pt-4 mt-4 border-t border-border-subtle">
              <button
                type="button"
                (click)="openEditModal(sp)"
                class="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                تعديل البيانات
              </button>

              @if (sp.isActive) {
                <button
                  type="button"
                  (click)="deactivateSpecialty(sp)"
                  class="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                >
                  تعطيل التخصص
                </button>
              } @else {
                <button
                  type="button"
                  (click)="reactivateSpecialty(sp)"
                  class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  إعادة تفعيل
                </button>
              }
            </div>
          </div>
        }
      </div>
    }

    <!-- Modal: Add / Edit Specialty -->
    @if (isModalOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" (click)="closeModal()"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-border-main text-right" dir="rtl">
            <h3 class="text-base font-black text-text-main mb-4">
              {{ selectedSpecialty() ? 'تعديل التخصص الطبي' : 'إضافة تخصص طبي جديد' }}
            </h3>

            <form [formGroup]="form" (ngSubmit)="saveSpecialty()" class="space-y-4 text-xs sm:text-sm">
              <div>
                <label class="block font-bold text-text-main mb-1.5">اسم التخصص *</label>
                <input
                  type="text"
                  formControlName="name"
                  placeholder="مثال: طب الأطفال وحديثي الولادة"
                  class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label class="block font-bold text-text-main mb-1.5">وصف التخصص (اختياري)</label>
                <textarea
                  formControlName="description"
                  rows="3"
                  placeholder="وصف مختصر للحالات المشمولة في هذا التخصص..."
                  class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20"
                ></textarea>
              </div>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle mt-6">
                <button type="button" (click)="closeModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-text-muted rounded-xl text-xs font-bold">
                  إلغاء
                </button>
                <button type="submit" [disabled]="form.invalid" class="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20">
                  {{ selectedSpecialty() ? 'حفظ التعديل' : 'إضافة التخصص' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `
})
export class SpecialtiesListComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  isLoading = signal<boolean>(true);
  isSeeding = signal<boolean>(false);
  specialties = signal<SpecialtyDto[]>([]);
  isModalOpen = signal<boolean>(false);
  selectedSpecialty = signal<SpecialtyDto | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required]],
    description: ['']
  });

  ngOnInit(): void {
    this.loadData();
  }

  seedDefaultSpecialties(): void {
    if (this.isSeeding()) return;
    this.isSeeding.set(true);
    this.api.seedDefaultSpecialties().subscribe({
      next: (list) => {
        this.specialties.set(list);
        this.toast.success('تم استيراد التخصصات الطبية الأساسية بنجاح.');
        this.isSeeding.set(false);
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'تعذر استيراد التخصصات.');
        this.isSeeding.set(false);
      }
    });
  }

  loadData(): void {
    this.isLoading.set(true);
    this.api.getSpecialties(true).subscribe({
      next: (data) => {
        this.specialties.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openAddModal(): void {
    this.selectedSpecialty.set(null);
    this.form.reset({ name: '', description: '' });
    this.isModalOpen.set(true);
  }

  openEditModal(sp: SpecialtyDto): void {
    this.selectedSpecialty.set(sp);
    this.form.reset({ name: sp.name, description: sp.description || '' });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveSpecialty(): void {
    if (this.form.invalid) return;
    const { name, description } = this.form.value;
    const sp = this.selectedSpecialty();

    if (sp) {
      this.api.updateSpecialty(sp.id, { name: name!, description }).subscribe({
        next: (updated) => {
          this.specialties.update(list => list.map(s => s.id === updated.id ? updated : s));
          this.toast.success('تم تحديث التخصص بنجاح');
          this.closeModal();
        }
      });
    } else {
      this.api.createSpecialty({ name: name!, description }).subscribe({
        next: (created) => {
          this.specialties.update(list => [...list, created]);
          this.toast.success('تمت إضافة التخصص بنجاح');
          this.closeModal();
        }
      });
    }
  }

  deactivateSpecialty(sp: SpecialtyDto): void {
    this.api.deactivateSpecialty(sp.id).subscribe({
      next: () => {
        this.specialties.update(list =>
          list.map(s => s.id === sp.id ? { ...s, isActive: false } : s)
        );
        this.toast.success('تم تعطيل التخصص. لن يظهر في الاختيارات الجديدة وسيبقى في السجلات القديمة.');
      }
    });
  }

  reactivateSpecialty(sp: SpecialtyDto): void {
    this.api.reactivateSpecialty(sp.id).subscribe({
      next: () => {
        this.specialties.update(list =>
          list.map(s => s.id === sp.id ? { ...s, isActive: true } : s)
        );
        this.toast.success('تمت إعادة تفعيل التخصص بنجاح');
      }
    });
  }
}

