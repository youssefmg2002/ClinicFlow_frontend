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
import { SecretaryDto, DoctorDto, CreateSecretaryRequest, UpdateSecretaryRequest } from '../../../shared/models';

@Component({
  selector: 'app-secretaries-list',
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
      title="إدارة السكرتارية وموظفي الاستقبال"
      subtitle="إضافة وتعديل بيانات موظفي الاستقبال، وضبط صلاحيات الأطباء المسموح بالحجز عندهم"
      [breadcrumbs]="[{ label: 'الرئيسية', url: '/admin/dashboard' }, { label: 'السكرتارية' }]"
    >
      <div actions>
        <button
          type="button"
          (click)="openAddSecretaryModal()"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-primary/20 transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          إضافة سكرتير جديد
        </button>
      </div>
    </app-page-header>

    <!-- Filter & Search Toolbar -->
    <div class="bg-white rounded-2xl border border-border-main p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      <app-search-input
        placeholder="ابحث باسم الموظف أو رقم الهاتف..."
        (search)="onSearch($event)"
      ></app-search-input>

      <div class="text-xs text-text-muted">
        <span class="font-bold text-text-main">{{ filteredSecretaries().length }}</span> موظف استقبال مسجل
      </div>
    </div>

    @if (isLoading()) {
      <app-loading-skeleton type="table" [count]="3"></app-loading-skeleton>
    } @else if (filteredSecretaries().length === 0) {
      <app-empty-state
        title="لا يوجد سكرتارية مسجلون"
        message="لم يتم العثور على أي موظف استقبال يطابق خيارات البحث."
        actionLabel="إضافة موظف استقبال"
        (actionClick)="openAddSecretaryModal()"
      ></app-empty-state>
    } @else {
      <div class="bg-white rounded-2xl border border-border-main overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr class="bg-slate-50/70 text-text-muted border-b border-border-subtle font-bold">
                <th class="py-3.5 px-4 rounded-r-xl">الاسم / اسم المستخدم</th>
                <th class="py-3.5 px-4">رقم الهاتف</th>
                <th class="py-3.5 px-4">صلاحيات الأطباء المصرح بهم</th>
                <th class="py-3.5 px-4">الحالة</th>
                <th class="py-3.5 px-4 rounded-l-xl text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              @for (sec of filteredSecretaries(); track sec.userId) {
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {{ sec.fullName.charAt(0) }}
                      </div>
                      <div>
                        <p class="font-bold text-text-main">{{ sec.fullName }}</p>
                        <p class="text-[11px] text-text-muted">{{ sec.userName }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 font-mono text-text-muted" dir="ltr">
                    {{ sec.phoneNumber }}
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex flex-wrap items-center gap-1.5">
                      @for (pDoc of sec.permittedDoctors; track pDoc.doctorId) {
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-primary border border-blue-100">
                          <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                          {{ pDoc.doctorName }}
                        </span>
                      }
                      @if (sec.permittedDoctors.length === 0) {
                        <span class="text-xs text-rose-500 font-medium">لم يتم تحديد أطباء (لا يمكنه الحجز)</span>
                      }
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <app-status-badge [status]="sec.isActive ? 'نشط' : 'معطل'"></app-status-badge>
                  </td>
                  <td class="py-3.5 px-4 text-left">
                    <div class="flex items-center justify-end gap-1.5">
                      <!-- Assign Doctors Permissions -->
                      <button
                        type="button"
                        (click)="openDoctorPermissionsModal(sec)"
                        class="px-2.5 py-1 text-xs font-semibold text-primary bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                        title="تعديل صلاحيات الأطباء"
                      >
                        صلاحيات الأطباء
                      </button>

                      <!-- Edit Button -->
                      <button
                        type="button"
                        (click)="openEditSecretaryModal(sec)"
                        class="p-1.5 text-text-muted hover:text-primary hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="تعديل البيانات"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <!-- Reset Password -->
                      <button
                        type="button"
                        (click)="openResetPasswordModal(sec)"
                        class="p-1.5 text-text-muted hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        title="إعادة تعيين كلمة المرور"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </button>

                      <!-- Toggle Active -->
                      @if (sec.isActive) {
                        <button
                          type="button"
                          (click)="promptDeactivateSecretary(sec)"
                          class="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="إيقاف حساب السكرتير"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                      } @else {
                        <button
                          type="button"
                          (click)="reactivateSecretary(sec)"
                          class="p-1.5 text-text-muted hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="إعادة تفعيل السكرتير"
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

    <!-- Modal: Add / Edit Secretary -->
    @if (isModalOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" (click)="closeModal()"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-border-main text-right" dir="rtl">
            <div class="flex items-center justify-between pb-4 mb-5 border-b border-border-subtle">
              <h3 class="text-lg font-black text-text-main">
                {{ selectedSecretary() ? 'تعديل بيانات السكرتير' : 'إضافة سكرتير جديد' }}
              </h3>
              <button type="button" (click)="closeModal()" class="text-text-muted hover:text-text-main">✕</button>
            </div>

            <form [formGroup]="secForm" (ngSubmit)="saveSecretary()" class="space-y-4 text-xs sm:text-sm">
              <div>
                <label class="block font-bold text-text-main mb-1.5">الاسم بالكامل *</label>
                <input type="text" formControlName="fullName" placeholder="سارة أحمد" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
              </div>

              @if (!selectedSecretary()) {
                <div>
                  <label class="block font-bold text-text-main mb-1.5">اسم المستخدم للدخول *</label>
                  <input type="text" formControlName="userName" placeholder="sec_sarah" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
                </div>

                <div>
                  <label class="block font-bold text-text-main mb-1.5">كلمة المرور الأولية *</label>
                  <input type="password" formControlName="password" placeholder="••••••••" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
                </div>
              }

              <div>
                <label class="block font-bold text-text-main mb-1.5">رقم الهاتف *</label>
                <input type="text" formControlName="phoneNumber" placeholder="01122334455" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
              </div>

              <div>
                <label class="block font-bold text-text-main mb-1.5">البريد الإلكتروني (اختياري)</label>
                <input type="email" formControlName="email" placeholder="secretary@clinic.com" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
              </div>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle mt-6">
                <button type="button" (click)="closeModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-text-muted rounded-xl font-bold cursor-pointer">
                  إلغاء
                </button>
                <button type="submit" [disabled]="secForm.invalid" class="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-md shadow-primary/20 cursor-pointer">
                  {{ selectedSecretary() ? 'حفظ التعديلات' : 'إضافة الموظف' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- Modal: Doctor Permissions Assignment -->
    @if (isPermissionsModalOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" (click)="isPermissionsModalOpen.set(false)"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-border-main text-right" dir="rtl">
            <h3 class="text-base font-black text-text-main mb-1">تحديد صلاحيات الأطباء للسكرتير</h3>
            <p class="text-xs text-text-muted mb-4">
              الموظف: <span class="font-bold text-text-main">{{ selectedSecretary()?.fullName }}</span>.
              اختر الأطباء المسموح له بمشاهدة حجوزاتهم وتسجيل الحضور وإدخال الكشوفات عندهم.
            </p>

            <div class="space-y-2.5 max-h-64 overflow-y-auto p-1">
              @for (doc of allDoctors(); track doc.doctorId) {
                <label class="flex items-center justify-between p-3 rounded-xl border border-border-main hover:bg-slate-50 cursor-pointer transition-colors">
                  <div class="flex items-center gap-3">
                    <input
                      type="checkbox"
                      [checked]="isDoctorSelected(doc.doctorId)"
                      (change)="toggleDoctorSelection(doc.doctorId)"
                      class="rounded border-border-main text-primary focus:ring-primary/20 w-4 h-4"
                    />
                    <div>
                      <p class="text-xs font-bold text-text-main">{{ doc.fullName }}</p>
                      <p class="text-[10px] text-text-muted">{{ doc.specialties[0]?.specialtyName || 'طبيب' }}</p>
                    </div>
                  </div>
                  <span class="text-[10px] px-2 py-0.5 rounded-full" [ngClass]="doc.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'">
                    {{ doc.isActive ? 'نشط' : 'معطل' }}
                  </span>
                </label>
              }
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle mt-6">
              <button type="button" (click)="isPermissionsModalOpen.set(false)" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-text-muted rounded-xl text-xs font-bold">
                إلغاء
              </button>
              <button type="button" (click)="saveDoctorPermissions()" class="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20">
                حفظ الصلاحيات
              </button>
            </div>
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
            <h3 class="text-base font-black text-text-main mb-2">إعادة تعيين كلمة مرور السكرتير</h3>
            <p class="text-xs text-text-muted mb-4">أدخل كلمة المرور الجديدة للموظف: {{ selectedSecretary()?.fullName }}</p>

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

    <!-- Deactivate Dialog -->
    <app-confirm-dialog
      [isOpen]="isDeactivateDialogOpen()"
      title="تأكيد إيقاف حساب السكرتير"
      message="هل أنت متأكد من رغبتك في إيقاف حساب هذا السكرتير؟ لن يتمكن من تسجيل الدخول، وعند إعادة التفعيل ستستعاد كافة صلاحياته السابقة تلقائياً."
      confirmLabel="تأكيد الإيقاف"
      [isDestructive]="true"
      (confirm)="confirmDeactivateSecretary()"
      (cancel)="isDeactivateDialogOpen.set(false)"
    ></app-confirm-dialog>
  `
})
export class SecretariesListComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  isLoading = signal<boolean>(true);
  secretaries = signal<SecretaryDto[]>([]);
  allDoctors = signal<DoctorDto[]>([]);
  searchQuery = signal<string>('');

  isModalOpen = signal<boolean>(false);
  isPermissionsModalOpen = signal<boolean>(false);
  isResetPasswordModalOpen = signal<boolean>(false);
  isDeactivateDialogOpen = signal<boolean>(false);

  selectedSecretary = signal<SecretaryDto | null>(null);
  selectedDoctorIds = signal<string[]>([]);
  newPasswordInput = '';

  secForm = this.fb.group({
    fullName: ['', [Validators.required]],
    userName: [''],
    password: [''],
    phoneNumber: ['', [Validators.required]],
    email: ['']
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.api.getDoctors().subscribe({
      next: (docs) => this.allDoctors.set(docs)
    });

    this.api.getSecretaries().subscribe({
      next: (secs) => {
        this.secretaries.set(secs);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  filteredSecretaries(): SecretaryDto[] {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.secretaries();
    return this.secretaries().filter(s =>
      s.fullName.toLowerCase().includes(q) ||
      s.userName.toLowerCase().includes(q) ||
      s.phoneNumber.includes(q)
    );
  }

  onSearch(val: string): void {
    this.searchQuery.set(val);
  }

  openAddSecretaryModal(): void {
    this.selectedSecretary.set(null);
    this.secForm.reset({
      fullName: '',
      userName: '',
      password: '',
      phoneNumber: '',
      email: ''
    });
    this.secForm.get('userName')?.setValidators([Validators.required]);
    this.secForm.get('password')?.setValidators([Validators.required]);
    this.isModalOpen.set(true);
  }

  openEditSecretaryModal(sec: SecretaryDto): void {
    this.selectedSecretary.set(sec);
    this.secForm.reset({
      fullName: sec.fullName,
      userName: sec.userName,
      password: '',
      phoneNumber: sec.phoneNumber,
      email: sec.email || ''
    });
    this.secForm.get('userName')?.clearValidators();
    this.secForm.get('password')?.clearValidators();
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveSecretary(): void {
    if (this.secForm.invalid) return;
    const val = this.secForm.value;
    const sec = this.selectedSecretary();

    if (sec) {
      const req: UpdateSecretaryRequest = {
        fullName: val.fullName!,
        phoneNumber: val.phoneNumber!,
        email: val.email || null
      };
      this.api.updateSecretary(sec.userId, req).subscribe({
        next: (updated) => {
          this.secretaries.update(list => list.map(s => s.userId === updated.userId ? updated : s));
          this.toast.success('تم تعديل بيانات السكرتير بنجاح');
          this.closeModal();
        }
      });
    } else {
      const req: CreateSecretaryRequest = {
        fullName: val.fullName!,
        userName: val.userName!,
        password: val.password!,
        phoneNumber: val.phoneNumber!,
        email: val.email || null,
        allowedDoctorIds: this.allDoctors().map(d => d.doctorId) // default allowed
      };
      this.api.createSecretary(req).subscribe({
        next: (created) => {
          this.secretaries.update(list => [...list, created]);
          this.toast.success('تمت إضافة السكرتير بنجاح');
          this.closeModal();
        }
      });
    }
  }

  openDoctorPermissionsModal(sec: SecretaryDto): void {
    this.selectedSecretary.set(sec);
    this.selectedDoctorIds.set(sec.permittedDoctors.map(d => d.doctorId));
    this.isPermissionsModalOpen.set(true);
  }

  isDoctorSelected(docId: string): boolean {
    return this.selectedDoctorIds().includes(docId);
  }

  toggleDoctorSelection(docId: string): void {
    this.selectedDoctorIds.update(ids =>
      ids.includes(docId) ? ids.filter(id => id !== docId) : [...ids, docId]
    );
  }

  saveDoctorPermissions(): void {
    const sec = this.selectedSecretary();
    if (!sec) return;

    const ids = this.selectedDoctorIds();
    this.api.updateSecretaryDoctorPermissions(sec.userId, { doctorIds: ids }).subscribe({
      next: () => {
        const newPermitted = this.allDoctors()
          .filter(d => ids.includes(d.doctorId))
          .map(d => ({ doctorId: d.doctorId, doctorName: d.fullName, doctorIsActive: d.isActive }));

        this.secretaries.update(list =>
          list.map(s => s.userId === sec.userId ? { ...s, permittedDoctors: newPermitted } : s)
        );
        this.toast.success('تم تحديث صلاحيات الأطباء للسكرتير بنجاح');
        this.isPermissionsModalOpen.set(false);
      }
    });
  }

  openResetPasswordModal(sec: SecretaryDto): void {
    this.selectedSecretary.set(sec);
    this.newPasswordInput = '';
    this.isResetPasswordModalOpen.set(true);
  }

  confirmResetPassword(): void {
    if (!this.newPasswordInput.trim()) return;
    const sec = this.selectedSecretary();
    if (!sec) return;

    this.api.resetSecretaryPassword(sec.userId, { newPassword: this.newPasswordInput }).subscribe({
      next: () => {
        this.toast.success('تمت إعادة تعيين كلمة المرور بنجاح');
        this.isResetPasswordModalOpen.set(false);
      }
    });
  }

  promptDeactivateSecretary(sec: SecretaryDto): void {
    this.selectedSecretary.set(sec);
    this.isDeactivateDialogOpen.set(true);
  }

  confirmDeactivateSecretary(): void {
    const sec = this.selectedSecretary();
    if (!sec) return;

    this.api.deactivateSecretary(sec.userId).subscribe({
      next: () => {
        this.secretaries.update(list =>
          list.map(s => s.userId === sec.userId ? { ...s, isActive: false } : s)
        );
        this.toast.success('تم إيقاف حساب السكرتير بنجاح');
        this.isDeactivateDialogOpen.set(false);
      }
    });
  }

  reactivateSecretary(sec: SecretaryDto): void {
    this.api.reactivateSecretary(sec.userId).subscribe({
      next: () => {
        this.secretaries.update(list =>
          list.map(s => s.userId === sec.userId ? { ...s, isActive: true } : s)
        );
        this.toast.success('تمت إعادة تفعيل حساب السكرتير واستعادة صلاحياته السابقة بنجاح');
      }
    });
  }
}

