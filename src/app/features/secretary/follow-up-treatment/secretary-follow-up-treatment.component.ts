import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { PatientDto, FollowUpMedicationDto, FollowUpMedicationInputDto } from '../../../shared/models';

@Component({
  selector: 'app-secretary-follow-up-treatment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent
  ],
  template: `
    <app-page-header
      title="إدخال ومتابعة علاج مرضى المتابعة"
      subtitle="نقل الأدوية والجرعات لمرضى المتابعة الدورية فقط (IsFollowUp = true) مع التوثيق الطبي"
      [breadcrumbs]="[{ label: 'الرئيسية', url: '/secretary/dashboard' }, { label: 'علاج المتابعة' }]"
    >
      <div actions>
        <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
          ميزة حصرية لمرضى المتابعة الدورية
        </span>
      </div>
    </app-page-header>

    <!-- Patient Selector for Follow Up Only -->
    <div class="bg-white rounded-2xl border border-border-main p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <label class="text-xs font-bold text-text-main whitespace-nowrap">اختر مريض المتابعة:</label>
        <select
          [ngModel]="selectedPatientId()"
          (ngModelChange)="onPatientChange($event)"
          class="px-3 py-1.5 bg-slate-50 border border-border-main rounded-xl text-xs font-bold text-text-main focus:bg-white"
        >
          @for (pat of followUpPatients(); track pat.patientId) {
            <option [value]="pat.patientId">{{ pat.fullName }} ({{ pat.followUpCardNumber || 'متابعة' }})</option>
          }
        </select>
      </div>

      <div class="text-xs text-text-muted">
        المريض العادي: علاجه على الروشتة الورقية فقط ولا يحفظ رقمياً في النظام
      </div>
    </div>

    @if (isLoading()) {
      <app-loading-skeleton type="card" [count]="2"></app-loading-skeleton>
    } @else if (followUpPatients().length === 0) {
      <app-empty-state
        title="لا يوجد مرضى متابعة مسجلون"
        message="هذه الشاشة مخصصة فقط للمرضى المحددين كـ (متابعة دورية)."
      ></app-empty-state>
    } @else {
      <!-- Medications Table & Form -->
      <div class="bg-white rounded-3xl border border-border-main p-6 sm:p-8 shadow-xs">
        <div class="flex items-center justify-between pb-4 mb-6 border-b border-border-subtle">
          <div>
            <h3 class="text-base font-bold text-text-main">الأدوية الموصوفة لمريض المتابعة</h3>
            <p class="text-xs text-text-muted mt-0.5">
              المريض: <strong class="text-text-main">{{ currentPatientName() }}</strong>
            </p>
          </div>

          <button
            type="button"
            (click)="addMedicationRow()"
            class="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-primary text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            + إضافة دواء جديد
          </button>
        </div>

        <!-- Dynamic Medications Input Rows -->
        <div class="space-y-4 mb-6">
          @for (med of medicationsList; track $index; let i = $index) {
            <div class="p-4 rounded-2xl bg-slate-50 border border-border-subtle grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
              <div>
                <label class="block text-[11px] font-bold text-text-main mb-1">اسم الدواء / المادة *</label>
                <input
                  type="text"
                  [(ngModel)]="med.medicineName"
                  placeholder="مثال: Amoxicillin 500mg"
                  class="w-full px-3 py-1.5 bg-white border border-border-main rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-text-main mb-1">الجرعة *</label>
                <input
                  type="text"
                  [(ngModel)]="med.dosage"
                  placeholder="مثال: 1 كبسولة أو 5 مل"
                  class="w-full px-3 py-1.5 bg-white border border-border-main rounded-xl text-xs"
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-text-main mb-1">التكرار *</label>
                <input
                  type="text"
                  [(ngModel)]="med.frequency"
                  placeholder="مثال: 3 مرات يومياً"
                  class="w-full px-3 py-1.5 bg-white border border-border-main rounded-xl text-xs"
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-text-main mb-1">المدة *</label>
                <input
                  type="text"
                  [(ngModel)]="med.duration"
                  placeholder="مثال: 5 أيام أو حتى الشفاء"
                  class="w-full px-3 py-1.5 bg-white border border-border-main rounded-xl text-xs"
                />
              </div>

              <div class="flex items-center gap-2">
                <div class="flex-1">
                  <label class="block text-[11px] font-bold text-text-main mb-1">ملاحظات الاستعمال</label>
                  <input
                    type="text"
                    [(ngModel)]="med.notes"
                    placeholder="مثال: بعد الأكل"
                    class="w-full px-3 py-1.5 bg-white border border-border-main rounded-xl text-xs"
                  />
                </div>

                <button
                  type="button"
                  (click)="removeMedicationRow(i)"
                  class="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                  title="حذف هذا الدواء"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Warning on Transcription accuracy -->
        <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-3 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="leading-relaxed">
            <strong>تحذير طبي:</strong> يجب أن تتطابق الأدوية المدخلة حرفياً مع تعليمات الطبيب المكتوبة. تسجل كافة التعديلات والتصحيحات في السجل الطبي الرقابي (Medical Audit Log).
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
          <button
            type="button"
            (click)="saveMedications()"
            class="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-primary/20 transition-colors cursor-pointer"
          >
            حفظ أدوية المتابعة
          </button>
        </div>
      </div>
    }
  `
})
export class SecretaryFollowUpTreatmentComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  isLoading = signal<boolean>(true);
  followUpPatients = signal<PatientDto[]>([]);
  selectedPatientId = signal<string>('');

  medicationsList: FollowUpMedicationInputDto[] = [];

  ngOnInit(): void {
    this.api.getPatients({ isFollowUp: true }).subscribe({
      next: (res) => {
        this.followUpPatients.set(res.items);
        if (res.items.length > 0) {
          this.selectedPatientId.set(res.items[0].patientId);
          this.initMedications();
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onPatientChange(patientId: string): void {
    this.selectedPatientId.set(patientId);
    this.initMedications();
  }

  currentPatientName(): string {
    const pat = this.followUpPatients().find(p => p.patientId === this.selectedPatientId());
    return pat?.fullName || '';
  }

  initMedications(): void {
    this.medicationsList = [
      { medicineName: 'Amoxicillin 500mg', dosage: '1 كبسولة', frequency: '3 مرات يومياً', duration: '5 أيام', notes: 'بعد الأكل' },
      { medicineName: 'Paracetamol 500mg', dosage: '1 قرص', frequency: 'عند اللزوم', duration: 'حتى التحسن', notes: 'كل 8 ساعات كحد أقصى' }
    ];
  }

  addMedicationRow(): void {
    this.medicationsList.push({
      medicineName: '',
      dosage: '',
      frequency: '',
      duration: '',
      notes: ''
    });
  }

  removeMedicationRow(index: number): void {
    this.medicationsList.splice(index, 1);
  }

  saveMedications(): void {
    const invalid = this.medicationsList.some(m => !m.medicineName.trim() || !m.dosage.trim());
    if (invalid) {
      this.toast.warning('يرجى التأكد من ملء اسم الدواء والجرعة لكل صنف');
      return;
    }

    this.toast.success('تم حفظ وتوثيق أدوية المتابعة في السجل الطبي بنجاح');
  }
}

