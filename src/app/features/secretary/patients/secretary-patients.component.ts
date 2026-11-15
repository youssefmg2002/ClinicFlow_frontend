import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { SearchInputComponent } from '../../../shared/components/search-input.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import { PatientDto, CreatePatientRequest, UpdatePatientRequest } from '../../../shared/models';

@Component({
  selector: 'app-secretary-patients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    SearchInputComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent
  ],
  template: `
    <app-page-header
      title="إدارة بيانات المرضى"
      subtitle="تسجيل المرضى الجدد، تحديث البيانات الأساسية، وتعيين فئة المتابعة الدورية"
      [breadcrumbs]="[{ label: 'الرئيسية', url: '/secretary/dashboard' }, { label: 'المرضى' }]"
    >
      <div actions>
        <button
          type="button"
          (click)="openAddPatientModal()"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-primary/20 transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          تسجيل مريض جديد
        </button>
      </div>
    </app-page-header>

    <!-- Toolbar -->
    <div class="bg-white rounded-2xl border border-border-main p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      <app-search-input
        placeholder="ابحث بالاسم الثلاثي أو رقم الهاتف..."
        (search)="onSearch($event)"
      ></app-search-input>

      <div class="flex items-center gap-3 text-xs text-text-muted">
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            [(ngModel)]="onlyFollowUp"
            (change)="loadPatients()"
            class="rounded border-border-main text-primary focus:ring-primary/20"
          />
          <span>مرضى المتابعة فقط</span>
        </label>
        <span class="text-slate-300">|</span>
        <span>المسجلون: <strong class="text-text-main font-sans">{{ totalCount() }}</strong></span>
      </div>
    </div>

    @if (isLoading()) {
      <app-loading-skeleton type="table" [count]="4"></app-loading-skeleton>
    } @else if (patients().length === 0) {
      <app-empty-state
        title="لا يوجد مرضى مسجلون"
        message="ابدأ بتسجيل أول مريض للعيادة."
        actionLabel="تسجيل مريض جديد"
        (actionClick)="openAddPatientModal()"
      ></app-empty-state>
    } @else {
      <div class="bg-white rounded-3xl border border-border-main overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr class="bg-slate-50/70 text-text-muted border-b border-border-subtle font-bold">
                <th class="py-3.5 px-4 rounded-r-xl">اسم المريض</th>
                <th class="py-3.5 px-4">رقم الهاتف</th>
                <th class="py-3.5 px-4">العمر</th>
                <th class="py-3.5 px-4">فئة المتابعة</th>
                <th class="py-3.5 px-4">بطاقة المتابعة</th>
                <th class="py-3.5 px-4">السعر الخاص</th>
                <th class="py-3.5 px-4 rounded-l-xl text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              @for (pat of patients(); track pat.patientId) {
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="py-3.5 px-4 font-bold text-text-main">
                    {{ pat.fullName }}
                  </td>
                  <td class="py-3.5 px-4 font-mono text-text-muted" dir="ltr">
                    {{ pat.phoneNumber }}
                  </td>
                  <td class="py-3.5 px-4 font-semibold text-text-main">
                    {{ pat.age ? pat.age + ' سنة' : '---' }}
                  </td>
                  <td class="py-3.5 px-4">
                    @if (pat.isFollowUp) {
                      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        متابعة دورية
                      </span>
                    } @else {
                      <span class="text-xs text-text-muted">عادي</span>
                    }
                  </td>
                  <td class="py-3.5 px-4 font-mono text-xs text-text-muted">
                    {{ pat.followUpCardNumber || '---' }}
                  </td>
                  <td class="py-3.5 px-4">
                    @if (pat.hasUsedSpecialPrice) {
                      <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        مستفيد سابق
                      </span>
                    } @else {
                      <span class="text-[11px] text-text-muted">لم يُستخدم</span>
                    }
                  </td>
                  <td class="py-3.5 px-4 text-left">
                    <button
                      type="button"
                      (click)="openEditPatientModal(pat)"
                      class="px-2.5 py-1 text-xs font-semibold text-primary hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      تعديل البيانات
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }

    <!-- Modal: Add / Edit Patient -->
    @if (isModalOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" (click)="isModalOpen.set(false)"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-border-main text-right" dir="rtl">
            <h3 class="text-base font-black text-text-main mb-1">
              {{ selectedPatient() ? 'تعديل بيانات المريض' : 'تسجيل مريض جديد' }}
            </h3>
            <p class="text-xs text-text-muted mb-4">
              {{ selectedPatient() ? 'تعديل البيانات الإدارية الأساسية للمريض' : 'نافذة الإدخال الأولي للبيانات ومعلومات الملف الصحي المؤكدة' }}
            </p>

            <form [formGroup]="patientForm" (ngSubmit)="savePatient()" class="space-y-4 text-xs sm:text-sm">
              <div>
                <label class="block font-bold text-text-main mb-1.5">الاسم الثلاثي على الأقل *</label>
                <input type="text" formControlName="fullName" placeholder="أحمد محمد علي" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-bold text-text-main mb-1.5">رقم الهاتف *</label>
                  <input type="text" formControlName="phoneNumber" placeholder="01012345678" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
                </div>

                <div>
                  <label class="block font-bold text-text-main mb-1.5">رقم WhatsApp (اختياري)</label>
                  <input type="text" formControlName="whatsAppNumber" placeholder="01012345678" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-bold text-text-main mb-1.5">العمر (بالسنوات)</label>
                  <input type="number" formControlName="age" placeholder="35" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
                </div>

                <div class="flex items-center pt-6">
                  <label class="flex items-center gap-2 cursor-pointer select-none font-bold text-text-main">
                    <input type="checkbox" formControlName="isFollowUp" class="rounded text-primary w-4 h-4" />
                    <span>مريض متابعة دورية (IsFollowUp)</span>
                  </label>
                </div>
              </div>

              @if (patientForm.get('isFollowUp')?.value) {
                <div>
                  <label class="block font-bold text-text-main mb-1.5">رقم بطاقة المتابعة (اختياري)</label>
                  <input type="text" formControlName="followUpCardNumber" placeholder="FOL-2026-089" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl" />
                </div>
              }

              <!-- Initial Health Profile note only on FIRST registration -->
              @if (!selectedPatient()) {
                <div class="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-text-muted">
                  <p class="font-bold text-primary mb-1">الملف الصحي الأولي (عند التسجيل الأول فقط):</p>
                  <p class="text-[11px] leading-relaxed">
                    يمكن إدخال المعلومات الصحية المؤكدة شفهياً من المريض عند تسجيله لأول مرة. بعد الحفظ يُقفل تعديل الملف الصحي على الطبيب المعالج فقط لضمان سلامة السجلات الطبية.
                  </p>
                </div>
              }

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle mt-6">
                <button type="button" (click)="isModalOpen.set(false)" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-text-muted rounded-xl text-xs font-bold">إلغاء</button>
                <button type="submit" [disabled]="patientForm.invalid" class="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20">
                  {{ selectedPatient() ? 'حفظ التعديل' : 'تسجيل المريض' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `
})
export class SecretaryPatientsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  isLoading = signal<boolean>(true);
  patients = signal<PatientDto[]>([]);
  totalCount = signal<number>(0);
  searchQuery = '';
  onlyFollowUp = false;

  isModalOpen = signal<boolean>(false);
  selectedPatient = signal<PatientDto | null>(null);

  patientForm = this.fb.group({
    fullName: ['', [Validators.required]],
    phoneNumber: ['', [Validators.required]],
    age: [null as number | null],
    isFollowUp: [false],
    followUpCardNumber: [''],
    whatsAppNumber: ['']
  });

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading.set(true);
    this.api.getPatients({
      search: this.searchQuery || undefined,
      isFollowUp: this.onlyFollowUp ? true : undefined,
      pageSize: 50
    }).subscribe({
      next: (res) => {
        this.patients.set(res.items);
        this.totalCount.set(res.totalCount);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearch(val: string): void {
    this.searchQuery = val;
    this.loadPatients();
  }

  openAddPatientModal(): void {
    this.selectedPatient.set(null);
    this.patientForm.reset({
      fullName: '',
      phoneNumber: '',
      age: null,
      isFollowUp: false,
      followUpCardNumber: '',
      whatsAppNumber: ''
    });
    this.isModalOpen.set(true);
  }

  openEditPatientModal(pat: PatientDto): void {
    this.selectedPatient.set(pat);
    this.patientForm.reset({
      fullName: pat.fullName,
      phoneNumber: pat.phoneNumber,
      age: pat.age,
      isFollowUp: pat.isFollowUp,
      followUpCardNumber: pat.followUpCardNumber || '',
      whatsAppNumber: pat.whatsAppNumber || ''
    });
    this.isModalOpen.set(true);
  }

  savePatient(): void {
    if (this.patientForm.invalid) return;
    const val = this.patientForm.value;
    const pat = this.selectedPatient();

    if (pat) {
      const req: UpdatePatientRequest = {
        fullName: val.fullName!,
        phoneNumber: val.phoneNumber!,
        age: val.age,
        isFollowUp: !!val.isFollowUp,
        followUpCardNumber: val.followUpCardNumber || null,
        whatsAppNumber: val.whatsAppNumber || null
      };
      this.api.updatePatient(pat.patientId, req).subscribe({
        next: (updated) => {
          this.patients.update(list => list.map(p => p.patientId === updated.patientId ? updated : p));
          this.toast.success('تم تعديل بيانات المريض بنجاح');
          this.isModalOpen.set(false);
        }
      });
    } else {
      const req: CreatePatientRequest = {
        fullName: val.fullName!,
        phoneNumber: val.phoneNumber!,
        age: val.age,
        isFollowUp: !!val.isFollowUp,
        followUpCardNumber: val.followUpCardNumber || null,
        whatsAppNumber: val.whatsAppNumber || null
      };
      this.api.createPatient(req).subscribe({
        next: (created) => {
          this.patients.update(list => [...list, created]);
          this.toast.success('تم تسجيل المريض بنجاح');
          this.isModalOpen.set(false);
        }
      });
    }
  }
}

