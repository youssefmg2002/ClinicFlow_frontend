import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import {
  HealthProfileItemDto,
  UpsertHealthProfileItemRequest,
  HealthInfoCategory,
  HealthInfoSource,
  HealthInfoVerificationStatus,
  PatientDto
} from '../../../shared/models';

interface CategoryConfig {
  key: HealthInfoCategory;
  title: string;
  badgeColor: string;
  borderColor: string;
  iconSvg: string;
}

@Component({
  selector: 'app-doctor-health-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    LoadingSkeletonComponent,
    ConfirmDialogComponent
  ],
  template: `
    <app-page-header
      title="الملف الصحي العام للمريض"
      subtitle="إدارة الأمراض المزمنة، حساسيات الأدوية والأطعمة، والملاحظات الطبية الوقائية"
      [breadcrumbs]="[{ label: 'الرئيسية', url: '/doctor/dashboard' }, { label: 'الملف الصحي' }]"
    >
      <div actions class="flex items-center gap-3">
        <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          حماية الخصوصية: رقم الهاتف وبطاقة المتابعة محجوبة عن الطبيب
        </span>
      </div>
    </app-page-header>

    <!-- Patient Selection Bar -->
    <div class="bg-white rounded-2xl border border-border-main p-4 mb-6 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      <div class="flex items-center gap-3 flex-1 max-w-md">
        <label class="text-xs font-bold text-text-muted shrink-0">المريض المحدد:</label>
        <select
          [ngModel]="selectedPatientId()"
          (ngModelChange)="onSelectPatient($event)"
          class="w-full text-xs font-bold text-text-main bg-slate-50 border border-border-main rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
        >
          @for (p of patients(); track p.patientId) {
            <option [value]="p.patientId">
              {{ p.fullName }} {{ p.age ? '(' + p.age + ' سنة)' : '' }} {{ p.isFollowUp ? '• مريض متابعة' : '' }}
            </option>
          }
        </select>
      </div>

      @if (currentPatient(); as p) {
        <div class="flex items-center gap-4 text-xs font-medium text-text-muted">
          <div>
            الاسم: <strong class="text-text-main">{{ p.fullName }}</strong>
          </div>
          @if (p.age) {
            <div>
              العمر: <strong class="text-text-main font-sans">{{ p.age }}</strong> سنة
            </div>
          }
          <div>
            النوع: <strong class="text-primary">{{ p.isFollowUp ? 'متابع بالعيادة' : 'مريض كشف جديد' }}</strong>
          </div>
        </div>
      }
    </div>

    @if (isLoading()) {
      <app-loading-skeleton type="card" [count]="4"></app-loading-skeleton>
    } @else {
      <!-- Category Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @for (cat of categories; track cat.key) {
          <div class="bg-white rounded-3xl border border-border-main shadow-xs overflow-hidden flex flex-col">
            <!-- Card Header -->
            <div class="p-5 border-b border-border-main flex items-center justify-between bg-slate-50/60">
              <div class="flex items-center gap-3">
                <span class="p-2 rounded-xl" [ngClass]="cat.badgeColor" [innerHTML]="cat.iconSvg"></span>
                <div>
                  <h3 class="text-sm font-black text-text-main">{{ cat.title }}</h3>
                  <span class="text-[11px] text-text-muted font-sans font-bold">
                    {{ getItemsByCategory(cat.key).length }} بند مسجل
                  </span>
                </div>
              </div>

              <button
                type="button"
                (click)="openAddModal(cat.key)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>إضافة</span>
              </button>
            </div>

            <!-- Items List -->
            <div class="p-5 flex-1 divide-y divide-border-main/60">
              @if (getItemsByCategory(cat.key).length === 0) {
                <div class="py-8 text-center">
                  <p class="text-xs text-text-muted">لا توجد بنود مسجلة في هذا القسم</p>
                  <button
                    type="button"
                    (click)="openAddModal(cat.key)"
                    class="mt-2 text-xs text-primary font-bold hover:underline cursor-pointer"
                  >
                    + إضافة تشخيص أو تنبيه
                  </button>
                </div>
              } @else {
                @for (item of getItemsByCategory(cat.key); track item.id) {
                  <div class="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-text-main">{{ item.content }}</span>
                        <span
                          class="px-2 py-0.5 rounded-md text-[10px] font-bold"
                          [ngClass]="getVerificationBadgeClass(item.verificationStatus)"
                        >
                          {{ formatVerification(item.verificationStatus) }}
                        </span>
                      </div>
                      <div class="flex items-center gap-2 text-[10px] text-text-muted">
                        <span>المصدر: {{ formatSource(item.source) }}</span>
                        <span>•</span>
                        <span>بواسطة: {{ item.addedByName || 'الطبيب' }}</span>
                        @if (item.createdAtUtc) {
                          <span>•</span>
                          <span class="font-sans">{{ item.createdAtUtc | date: 'yyyy/MM/dd' }}</span>
                        }
                      </div>
                    </div>

                    <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        (click)="openEditModal(item)"
                        class="p-1.5 text-text-muted hover:text-primary rounded-lg hover:bg-slate-100 transition-colors"
                        title="تعديل"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        (click)="confirmDelete(item)"
                        class="p-1.5 text-text-muted hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="حذف"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        }
      </div>
    }

    <!-- Add/Edit Health Item Modal -->
    @if (isModalOpen()) {
      <div class="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
        <div class="bg-white rounded-3xl border border-border-main max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between mb-5 pb-3 border-b border-border-main">
            <h3 class="text-base font-black text-text-main">
              {{ editingItemId() ? 'تعديل بند في الملف الصحي' : 'إضافة بند جديد للملف الصحي' }}
            </h3>
            <button
              type="button"
              (click)="isModalOpen.set(false)"
              class="text-text-muted hover:text-text-main p-1 rounded-lg hover:bg-slate-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form (ngSubmit)="saveItem()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-text-main mb-1.5">التصنيف الصحي</label>
              <select
                [(ngModel)]="formData.category"
                name="category"
                required
                class="w-full text-xs font-bold text-text-main bg-slate-50 border border-border-main rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
              >
                @for (c of categories; track c.key) {
                  <option [value]="c.key">{{ c.title }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-text-main mb-1.5">نص البند الطبي / التشخيص / الحساسية</label>
              <input
                type="text"
                [(ngModel)]="formData.content"
                name="content"
                required
                placeholder="مثال: ضغط الدم المرتفع، حساسية بنسلين، حساسية الفول السوداني..."
                class="w-full text-xs font-medium text-text-main bg-slate-50 border border-border-main rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-text-main mb-1.5">مصدر المعلومة</label>
                <select
                  [(ngModel)]="formData.source"
                  name="source"
                  class="w-full text-xs font-bold text-text-main bg-slate-50 border border-border-main rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                >
                  <option value="RecordedByDoctor">طبيب فاحص</option>
                  <option value="ConfirmedByPatient">إقرار المريض</option>
                  <option value="EnteredDuringRegistration">الاستقبال / تسجيل</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-text-main mb-1.5">حالة التحقق</label>
                <select
                  [(ngModel)]="formData.verificationStatus"
                  name="verificationStatus"
                  class="w-full text-xs font-bold text-text-main bg-slate-50 border border-border-main rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                >
                  <option value="Confirmed">مؤكدة سريريًا (Confirmed)</option>
                  <option value="Unconfirmed">غير مؤكدة (Unconfirmed)</option>
                  <option value="NeedsReview">تحتاج مراجعة (NeedsReview)</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-border-main mt-6">
              <button
                type="button"
                (click)="isModalOpen.set(false)"
                class="px-4 py-2.5 text-xs font-bold text-text-muted hover:text-text-main hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                [disabled]="isSaving() || !formData.content.trim()"
                class="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {{ isSaving() ? 'جاري الحفظ...' : 'حفظ البند الطبي' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirm Dialog -->
    <app-confirm-dialog
      [isOpen]="showDeleteConfirm()"
      title="حذف بند من الملف الصحي"
      message="هل أنت متأكد من رغبتك في حذف هذا البند من الملف الصحي للمريض؟"
      confirmText="نعم، حذف"
      cancelText="إلغاء"
      [isDestructive]="true"
      (confirmed)="executeDelete()"
      (cancelled)="showDeleteConfirm.set(false)"
    ></app-confirm-dialog>
  `
})
export class DoctorHealthProfileComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  readonly categories: CategoryConfig[] = [
    {
      key: 'ChronicDisease',
      title: 'الأمراض المزمنة',
      badgeColor: 'bg-rose-50 text-rose-600',
      borderColor: 'border-rose-100',
      iconSvg: '<svg class="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>'
    },
    {
      key: 'FoodAllergy',
      title: 'حساسية الأطعمة',
      badgeColor: 'bg-amber-50 text-amber-600',
      borderColor: 'border-amber-100',
      iconSvg: '<svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>'
    },
    {
      key: 'DrugAllergy',
      title: 'حساسية الأدوية',
      badgeColor: 'bg-indigo-50 text-indigo-600',
      borderColor: 'border-indigo-100',
      iconSvg: '<svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>'
    },
    {
      key: 'ActiveIngredientAllergy',
      title: 'حساسية المواد الفعالة',
      badgeColor: 'bg-purple-50 text-purple-600',
      borderColor: 'border-purple-100',
      iconSvg: '<svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>'
    },
    {
      key: 'GeneralMedicalNote',
      title: 'ملاحظات صحية عامة',
      badgeColor: 'bg-emerald-50 text-emerald-600',
      borderColor: 'border-emerald-100',
      iconSvg: '<svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>'
    }
  ];

  patients = signal<PatientDto[]>([]);
  selectedPatientId = signal<string>('');
  currentPatient = signal<PatientDto | null>(null);
  items = signal<HealthProfileItemDto[]>([]);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  // Modal State
  isModalOpen = signal<boolean>(false);
  editingItemId = signal<string | null>(null);
  formData: UpsertHealthProfileItemRequest = {
    category: 'ChronicDisease',
    content: '',
    source: 'RecordedByDoctor',
    verificationStatus: 'Confirmed'
  };

  // Delete Dialog
  showDeleteConfirm = signal<boolean>(false);
  itemToDelete = signal<HealthProfileItemDto | null>(null);

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.apiService.getPatients({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: res => {
        this.patients.set(res.items);
        const queryPatientId = this.route.snapshot.queryParamMap.get('patientId');
        if (queryPatientId && res.items.some(p => p.patientId === queryPatientId)) {
          this.onSelectPatient(queryPatientId);
        } else if (res.items.length > 0) {
          this.onSelectPatient(res.items[0].patientId);
        }
      },
      error: () => this.toast.error('تعذر تحميل قائمة المرضى')
    });
  }

  onSelectPatient(patientId: string): void {
    this.selectedPatientId.set(patientId);
    const p = this.patients().find(item => item.patientId === patientId) || null;
    this.currentPatient.set(p);
    this.loadHealthProfile(patientId);
  }

  loadHealthProfile(patientId: string): void {
    this.isLoading.set(true);
    this.apiService.getHealthProfile(patientId).subscribe({
      next: data => {
        this.items.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('تعذر تحميل الملف الصحي للمريض');
        this.isLoading.set(false);
      }
    });
  }

  getItemsByCategory(category: HealthInfoCategory): HealthProfileItemDto[] {
    return this.items().filter(item => item.category === category);
  }

  openAddModal(category: HealthInfoCategory): void {
    this.editingItemId.set(null);
    this.formData = {
      category,
      content: '',
      source: 'RecordedByDoctor',
      verificationStatus: 'Confirmed'
    };
    this.isModalOpen.set(true);
  }

  openEditModal(item: HealthProfileItemDto): void {
    this.editingItemId.set(item.id);
    this.formData = {
      category: item.category,
      content: item.content,
      source: item.source,
      verificationStatus: item.verificationStatus
    };
    this.isModalOpen.set(true);
  }

  saveItem(): void {
    const patientId = this.selectedPatientId();
    if (!patientId || !this.formData.content.trim()) return;

    this.isSaving.set(true);
    const id = this.editingItemId();

    if (id) {
      this.apiService.updateHealthProfileItem(patientId, id, this.formData).subscribe({
        next: updated => {
          this.items.update(list => list.map(x => x.id === id ? updated : x));
          this.toast.success('تم تحديث البند الطبي بنجاح');
          this.isSaving.set(false);
          this.isModalOpen.set(false);
        },
        error: () => {
          this.toast.error('حدث خطأ أثناء تحديث البند الطبي');
          this.isSaving.set(false);
        }
      });
    } else {
      this.apiService.addHealthProfileItem(patientId, this.formData).subscribe({
        next: created => {
          this.items.update(list => [...list, created]);
          this.toast.success('تمت إضافة البند الطبي للملف الصحي');
          this.isSaving.set(false);
          this.isModalOpen.set(false);
        },
        error: () => {
          this.toast.error('حدث خطأ أثناء إضافة البند الطبي');
          this.isSaving.set(false);
        }
      });
    }
  }

  confirmDelete(item: HealthProfileItemDto): void {
    this.itemToDelete.set(item);
    this.showDeleteConfirm.set(true);
  }

  executeDelete(): void {
    const item = this.itemToDelete();
    const patientId = this.selectedPatientId();
    if (!item || !patientId) return;

    this.apiService.deleteHealthProfileItem(patientId, item.id).subscribe({
      next: () => {
        this.items.update(list => list.filter(x => x.id !== item.id));
        this.toast.success('تم حذف البند الطبي من الملف الصحي');
        this.showDeleteConfirm.set(false);
        this.itemToDelete.set(null);
      },
      error: () => {
        this.toast.error('تعذر حذف البند الطبي');
        this.showDeleteConfirm.set(false);
      }
    });
  }

  formatSource(source: HealthInfoSource): string {
    switch (source) {
      case 'RecordedByDoctor': return 'طبيب فاحص';
      case 'ConfirmedByPatient': return 'إقرار المريض';
      case 'EnteredDuringRegistration': return 'الاستقبال';
      default: return source;
    }
  }

  formatVerification(status: HealthInfoVerificationStatus): string {
    switch (status) {
      case 'Confirmed': return 'مؤكدة سريريًا';
      case 'Unconfirmed': return 'تحت التحقق';
      case 'NeedsReview': return 'تحتاج مراجعة';
      default: return status;
    }
  }

  getVerificationBadgeClass(status: HealthInfoVerificationStatus): string {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Unconfirmed': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'NeedsReview': return 'bg-blue-50 text-blue-700 border border-blue-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
