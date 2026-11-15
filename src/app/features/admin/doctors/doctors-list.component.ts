import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { SearchInputComponent } from '../../../shared/components/search-input.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { DoctorDto, SpecialtyDto, CreateDoctorRequest, UpdateDoctorRequest } from '../../../shared/models';

@Component({
  selector: 'app-doctors-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    ConfirmDialogComponent
  ],
  template: `
    <app-page-header
      title="إدارة الأطباء"
      subtitle="إضافة وتعديل بيانات الأطباء، تخصصاتهم، أسعار الكشف، وجداول العمل"
      [breadcrumbs]="[{ label: 'الرئيسية', url: '/admin/dashboard' }, { label: 'الأطباء' }]"
    >
      <div actions>
        <button
          type="button"
          (click)="openAddDoctorModal()"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-primary/20 transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          إضافة طبيب جديد
        </button>
      </div>
    </app-page-header>

    <!-- Filter & Search Toolbar -->
    <div class="bg-white rounded-2xl border border-border-main p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      <app-search-input
        placeholder="ابحث باسم الطبيب، رقم الهاتف أو التخصص..."
        (search)="onSearch($event)"
      ></app-search-input>

      <div class="flex items-center gap-3 text-xs text-text-muted">
        <span class="font-bold text-text-main">{{ filteredDoctors().length }}</span> طبيب مسجل
      </div>
    </div>

    <!-- Doctors Table / Cards -->
    @if (isLoading()) {
      <app-loading-skeleton type="table" [count]="4"></app-loading-skeleton>
    } @else if (filteredDoctors().length === 0) {
      <app-empty-state
        title="لم يتم العثور على أطباء"
        message="لا يوجد أطباء مسجلون حالياً يطابقون معايير البحث."
        actionLabel="إضافة طبيب الآن"
        (actionClick)="openAddDoctorModal()"
      ></app-empty-state>
    } @else {
      <div class="bg-white rounded-2xl border border-border-main overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr class="bg-slate-50/70 text-text-muted border-b border-border-subtle font-bold">
                <th class="py-3.5 px-4 rounded-r-xl">الطبيب</th>
                <th class="py-3.5 px-4">التخصص الأساسي</th>
                <th class="py-3.5 px-4">رقم الهاتف</th>
                <th class="py-3.5 px-4">سعر الكشف / الاستشارة</th>
                <th class="py-3.5 px-4">الحالة</th>
                <th class="py-3.5 px-4 rounded-l-xl text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              @for (doc of filteredDoctors(); track doc.doctorId) {
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {{ doc.fullName.charAt(0) }}
                      </div>
                      <div>
                        <p class="font-bold text-text-main">{{ doc.fullName }}</p>
                        <p class="text-[11px] text-text-muted">{{ doc.userName }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="font-semibold text-text-main">
                      {{ getPrimarySpecialtyName(doc) }}
                    </span>
                    @if (doc.specialties.length > 1) {
                      <span class="mr-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-text-muted">
                        +{{ doc.specialties.length - 1 }}
                      </span>
                    }
                  </td>
                  <td class="py-3.5 px-4 font-mono text-text-muted" dir="ltr">
                    {{ doc.phoneNumber }}
                  </td>
                  <td class="py-3.5 px-4 font-bold font-sans">
                    <span class="text-emerald-700">{{ doc.newExamPrice || 0 }} ج.م</span>
                    <span class="text-text-muted mx-1">/</span>
                    <span class="text-blue-700">{{ doc.consultationPrice || 0 }} ج.م</span>
                  </td>
                  <td class="py-3.5 px-4">
                    <app-status-badge [status]="doc.isActive ? 'نشط' : 'معطل'"></app-status-badge>
                  </td>
                  <td class="py-3.5 px-4 text-left">
                    <div class="flex items-center justify-end gap-1.5">
                      <!-- Edit button -->
                      <button
                        type="button"
                        (click)="openEditDoctorModal(doc)"
                        class="p-1.5 text-text-muted hover:text-primary hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="تعديل الطبيب"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <!-- Reset Password -->
                      <button
                        type="button"
                        (click)="openResetPasswordModal(doc)"
                        class="p-1.5 text-text-muted hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        title="إعادة تعيين كلمة المرور"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </button>

                      <!-- Toggle Active State -->
                      @if (doc.isActive) {
                        <button
                          type="button"
                          (click)="promptDeactivateDoctor(doc)"
                          class="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="إيقاف حساب الطبيب"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                      } @else {
                        <button
                          type="button"
                          (click)="reactivateDoctor(doc)"
                          class="p-1.5 text-text-muted hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="إعادة تفعيل الطبيب"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }

    <!-- Modal: Add / Edit Doctor -->
    @if (isModalOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" (click)="closeModal()"></div>

        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-border-main text-right" dir="rtl">
            <div class="flex items-center justify-between pb-4 mb-5 border-b border-border-subtle">
              <h3 class="text-lg font-black text-text-main">
                {{ selectedDoctor() ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد' }}
              </h3>
              <button type="button" (click)="closeModal()" class="text-text-muted hover:text-text-main">✕</button>
            </div>

            <form [formGroup]="doctorForm" (ngSubmit)="saveDoctor()" class="space-y-4 text-xs sm:text-sm">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-bold text-text-main mb-1.5">اسم الطبيب بالكامل *</label>
                  <input type="text" formControlName="fullName" placeholder="د. محمد أحمد" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
                </div>

                @if (!selectedDoctor()) {
                  <div>
                    <label class="block font-bold text-text-main mb-1.5">اسم المستخدم للدخول *</label>
                    <input type="text" formControlName="userName" placeholder="dr_mohamed" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
                  </div>
                }

                <div>
                  <label class="block font-bold text-text-main mb-1.5">رقم الهاتف *</label>
                  <input type="text" formControlName="phoneNumber" placeholder="01012345678" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
                </div>

                <div>
                  <label class="block font-bold text-text-main mb-1.5">البريد الإلكتروني (اختياري)</label>
                  <input type="email" formControlName="email" placeholder="doctor@clinic.com" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
                </div>

                @if (!selectedDoctor()) {
                  <div class="sm:col-span-2">
                    <label class="block font-bold text-text-main mb-1.5">كلمة المرور الأولية *</label>
                    <input type="password" formControlName="password" placeholder="••••••••" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
                  </div>
                }

                <div>
                  <label class="block font-bold text-text-main mb-1.5">سعر الكشف الجديد (ج.م)</label>
                  <input type="number" formControlName="newExamPrice" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
                </div>

                <div>
                  <label class="block font-bold text-text-main mb-1.5">سعر الاستشارة (ج.م)</label>
                  <input type="number" formControlName="consultationPrice" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
                </div>

                <div>
                  <label class="block font-bold text-text-main mb-1.5">حد الاستشارات لكل دورة</label>
                  <input type="number" formControlName="maxConsultationsPerCycle" placeholder="اتركه فارغاً لغير محدود" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
                </div>

                <div>
                  <label class="block font-bold text-text-main mb-1.5">التخصص الأساسي *</label>
                  <select formControlName="primarySpecialtyId" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20">
                    <option value="" disabled>اختر التخصص الأساسي</option>
                    @for (sp of specialties(); track sp.id) {
                      <option [value]="sp.id">{{ sp.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle mt-6">
                <button type="button" (click)="closeModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-text-muted rounded-xl font-bold cursor-pointer">
                  إلغاء
                </button>
                <button type="submit" [disabled]="doctorForm.invalid || isSubmitting()" class="px-5 py-2 bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-white rounded-xl font-bold shadow-md shadow-primary/20 cursor-pointer">
                  {{ selectedDoctor() ? 'حفظ التعديلات' : 'إضافة الطبيب' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- Modal: Reset Password -->
    @if (isResetPasswordModalOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" (click)="isResetPasswordModalOpen.set(false)"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-border-main text-right" dir="rtl">
            <h3 class="text-base font-black text-text-main mb-2">إعادة تعيين كلمة مرور الطبيب</h3>
            <p class="text-xs text-text-muted mb-4">أدخل كلمة المرور الجديدة للطبيب: {{ selectedDoctor()?.fullName }}</p>

            <div class="space-y-4">
              <div>
                <label class="block font-bold text-xs text-text-main mb-1">كلمة المرور الجديدة</label>
                <input type="password" [(ngModel)]="newPasswordInput" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl text-sm" placeholder="••••••••" />
              </div>

              <div class="flex items-center justify-end gap-2 pt-2">
                <button type="button" (click)="isResetPasswordModalOpen.set(false)" class="px-3 py-1.5 text-xs text-text-muted bg-slate-100 rounded-lg">إلغاء</button>
                <button type="button" (click)="confirmResetPassword()" class="px-4 py-1.5 text-xs font-bold text-white bg-primary rounded-lg shadow-sm">حفظ</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Confirmation Dialog: Deactivate Doctor with Conflict Guard -->
    <app-confirm-dialog
      [isOpen]="isDeactivateDialogOpen()"
      title="تأكيد إيقاف حساب الطبيب"
      [message]="deactivateWarningMessage()"
      confirmLabel="تأكيد الإيقاف"
      [isDestructive]="true"
      (confirm)="confirmDeactivateDoctor()"
      (cancel)="isDeactivateDialogOpen.set(false)"
    ></app-confirm-dialog>
  `
})
export class DoctorsListComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  doctors = signal<DoctorDto[]>([]);
  specialties = signal<SpecialtyDto[]>([]);
  searchQuery = signal<string>('');

  isModalOpen = signal<boolean>(false);
  isResetPasswordModalOpen = signal<boolean>(false);
  isDeactivateDialogOpen = signal<boolean>(false);

  selectedDoctor = signal<DoctorDto | null>(null);
  newPasswordInput = '';
  deactivateWarningMessage = signal<string>('هل أنت متأكد من رغبتك في إيقاف حساب هذا الطبيب؟ لن يتمكن من تسجيل الدخول أو استقبال حجوزات جديدة.');

  doctorForm = this.fb.group({
    fullName: ['', [Validators.required]],
    userName: [''],
    password: [''],
    phoneNumber: ['', [Validators.required]],
    email: [''],
    primarySpecialtyId: ['', [Validators.required]],
    maxConsultationsPerCycle: [null as number | null],
    newExamPrice: [300],
    consultationPrice: [150]
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.api.getSpecialties().subscribe({
      next: (sps) => this.specialties.set(sps)
    });

    this.api.getDoctors().subscribe({
      next: (docs) => {
        this.doctors.set(docs);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  filteredDoctors(): DoctorDto[] {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.doctors();
    return this.doctors().filter(d =>
      d.fullName.toLowerCase().includes(q) ||
      d.phoneNumber.includes(q) ||
      d.specialties.some(s => s.specialtyName.toLowerCase().includes(q))
    );
  }

  getPrimarySpecialtyName(doc: DoctorDto): string {
    const primary = doc.specialties.find(s => s.isPrimary) || doc.specialties[0];
    return primary ? primary.specialtyName : 'طبيب عام';
  }

  onSearch(val: string): void {
    this.searchQuery.set(val);
  }

  openAddDoctorModal(): void {
    this.selectedDoctor.set(null);
    this.doctorForm.reset({
      fullName: '',
      userName: '',
      password: '',
      phoneNumber: '',
      email: '',
      primarySpecialtyId: this.specialties()[0]?.id || '',
      maxConsultationsPerCycle: 2,
      newExamPrice: 300,
      consultationPrice: 150
    });
    this.doctorForm.get('userName')?.setValidators([Validators.required]);
    this.doctorForm.get('password')?.setValidators([Validators.required]);
    this.isModalOpen.set(true);
  }

  openEditDoctorModal(doc: DoctorDto): void {
    this.selectedDoctor.set(doc);
    const primary = doc.specialties.find(s => s.isPrimary) || doc.specialties[0];
    this.doctorForm.reset({
      fullName: doc.fullName,
      userName: doc.userName,
      password: '',
      phoneNumber: doc.phoneNumber,
      email: doc.email || '',
      primarySpecialtyId: primary?.specialtyId || '',
      maxConsultationsPerCycle: doc.maxConsultationsPerCycle,
      newExamPrice: doc.newExamPrice || 300,
      consultationPrice: doc.consultationPrice || 150
    });
    this.doctorForm.get('userName')?.clearValidators();
    this.doctorForm.get('password')?.clearValidators();
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveDoctor(): void {
    if (this.doctorForm.invalid) return;
    this.isSubmitting.set(true);

    const val = this.doctorForm.value;
    const doc = this.selectedDoctor();

    if (doc) {
      // Edit
      const req: UpdateDoctorRequest = {
        fullName: val.fullName!,
        phoneNumber: val.phoneNumber!,
        email: val.email || null,
        specialtyIds: [val.primarySpecialtyId!],
        primarySpecialtyId: val.primarySpecialtyId!,
        maxConsultationsPerCycle: val.maxConsultationsPerCycle || null
      };
      this.api.updateDoctor(doc.doctorId, req).subscribe({
        next: (updated) => {
          this.doctors.update(list => list.map(d => d.doctorId === updated.doctorId ? updated : d));
          this.toast.success('تم تحديث بيانات الطبيب بنجاح');
          this.isSubmitting.set(false);
          this.closeModal();
        },
        error: () => this.isSubmitting.set(false)
      });
    } else {
      // Add
      const req: CreateDoctorRequest = {
        fullName: val.fullName!,
        userName: val.userName!,
        password: val.password!,
        phoneNumber: val.phoneNumber!,
        email: val.email || null,
        specialtyIds: [val.primarySpecialtyId!],
        primarySpecialtyId: val.primarySpecialtyId!,
        maxConsultationsPerCycle: val.maxConsultationsPerCycle || null,
        newExamPrice: val.newExamPrice || 300,
        consultationPrice: val.consultationPrice || 150
      };
      this.api.createDoctor(req).subscribe({
        next: (created) => {
          this.doctors.update(list => [...list, created]);
          this.toast.success('تمت إضافة الطبيب بنجاح');
          this.isSubmitting.set(false);
          this.closeModal();
        },
        error: () => this.isSubmitting.set(false)
      });
    }
  }

  openResetPasswordModal(doc: DoctorDto): void {
    this.selectedDoctor.set(doc);
    this.newPasswordInput = '';
    this.isResetPasswordModalOpen.set(true);
  }

  confirmResetPassword(): void {
    if (!this.newPasswordInput.trim()) {
      this.toast.warning('يرجى كتابة كلمة مرور جديدة');
      return;
    }
    const doc = this.selectedDoctor();
    if (!doc) return;

    this.api.resetDoctorPassword(doc.doctorId, { newPassword: this.newPasswordInput }).subscribe({
      next: () => {
        this.toast.success('تمت إعادة تعيين كلمة المرور بنجاح');
        this.isResetPasswordModalOpen.set(false);
      }
    });
  }

  promptDeactivateDoctor(doc: DoctorDto): void {
    this.selectedDoctor.set(doc);
    this.deactivateWarningMessage.set(`هل أنت متأكد من إيقاف حساب ${doc.fullName}؟ سيتم التحقق من عدم وجود حجوزات مستقبلية متأثرة.`);
    this.isDeactivateDialogOpen.set(true);
  }

  confirmDeactivateDoctor(): void {
    const doc = this.selectedDoctor();
    if (!doc) return;

    this.api.deactivateDoctor(doc.doctorId).subscribe({
      next: () => {
        this.doctors.update(list =>
          list.map(d => d.doctorId === doc.doctorId ? { ...d, isActive: false } : d)
        );
        this.toast.success('تم إيقاف حساب الطبيب بنجاح');
        this.isDeactivateDialogOpen.set(false);
      }
    });
  }

  reactivateDoctor(doc: DoctorDto): void {
    this.api.reactivateDoctor(doc.doctorId).subscribe({
      next: () => {
        this.doctors.update(list =>
          list.map(d => d.doctorId === doc.doctorId ? { ...d, isActive: true } : d)
        );
        this.toast.success('تمت إعادة تفعيل حساب الطبيب بنجاح');
      }
    });
  }
}

