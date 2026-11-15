import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { TenantService } from '../../../core/tenant/tenant.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import {
  AppointmentVisitWorkspaceDto,
  AppointmentDto,
  FollowUpMedicationDto
} from '../../../shared/models';

@Component({
  selector: 'app-doctor-visit',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, LoadingSkeletonComponent],
  template: `
    <app-page-header
      title="شاشة الكشف السريري والتشخيص"
      subtitle="تسجيل التشخيص الطبي، تحديد صلاحية الاستشارة القادمة، وإنهاء الزيارة الطبية"
      [breadcrumbs]="[{ label: 'الرئيسية', url: '/doctor/dashboard' }, { label: 'الكشف السريري' }]"
    >
      <div actions>
        <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
          خصوصية سريرية: رقم الهاتف وبطاقة المتابعة محجوبة عن الطبيب
        </span>
      </div>
    </app-page-header>

    @if (isLoading()) {
      <app-loading-skeleton type="card" [count]="3"></app-loading-skeleton>
    } @else if (isUnpaid()) {
      <!-- Unpaid Warning Banner: Doctor cannot complete or start unpaid visit -->
      <div class="bg-rose-50 border-2 border-rose-200 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-xs">
        <div class="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-black text-rose-900 mb-2">هذا الحجز غير مسدد (Unpaid)</h3>
        <p class="text-xs text-rose-700 leading-relaxed max-w-md mx-auto mb-6">
          قواعد النظام الصارمة تمنع بدء الفحص أو إنهاء الزيارة الطبية قبل إتمام السداد الكامل لرسوم الكشف لدى مكتب الاستقبال.
        </p>
        <button
          type="button"
          (click)="goBack()"
          class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          العودة لطابور اليوم
        </button>
      </div>
    } @else {
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Patient Summary & Diagnosis Form (2 cols) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Patient Header Card -->
          <div class="bg-white rounded-3xl border border-border-main p-6 shadow-xs flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-blue-100 text-primary font-black text-lg flex items-center justify-center">
                {{ workspace()?.patientName?.charAt(0) }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-black text-text-main">{{ workspace()?.patientName }}</h3>
                  @if (workspace()?.patientIsFollowUp) {
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      مريض متابعة
                    </span>
                  }
                </div>
                <p class="text-xs text-text-muted mt-0.5">
                  رقم الدور: <strong class="text-primary font-sans text-sm">#{{ workspace()?.queueNumber }}</strong>
                  | نوع الزيارة: <strong>{{ workspace()?.appointmentType === 'NewExam' ? 'كشف جديد' : 'استشارة' }}</strong>
                </p>
              </div>
            </div>

            <div class="text-left">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                تم السداد (Paid)
              </span>
            </div>
          </div>

          <!-- Diagnosis & Clinical Notes -->
          <div class="bg-white rounded-3xl border border-border-main p-6 sm:p-8 shadow-xs">
            <h3 class="text-base font-bold text-text-main mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>التشخيص والتقييم السريري</span>
            </h3>

            <!-- Auto-prefill indicator for consultations -->
            @if (workspace()?.appointmentType === 'Consultation' && workspace()?.autoPrefilledCycleDiagnosis) {
              <div class="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 mb-4 flex items-center justify-between">
                <span>تم ملء التشخيص تلقائياً من الزيارة السابقة في نفس الدورة، ويمكنك تعديله لهذه الزيارة:</span>
                <span class="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-blue-200">تلقائي للدورة</span>
              </div>
            }

            <div class="space-y-4 text-xs sm:text-sm">
              <div>
                <label class="block font-bold text-text-main mb-1.5">التشخيص الطبي *</label>
                <input
                  type="text"
                  [(ngModel)]="diagnosisInput"
                  placeholder="أدخل التشخيص النهائي للحالة (مثال: التهاب الشعب الهوائية الحاد)..."
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 font-bold"
                />
              </div>

              <div>
                <label class="block font-bold text-text-main mb-1.5">ملاحظات الفحص والتقييم السريري (اختياري)</label>
                <textarea
                  [(ngModel)]="diagnosisNotesInput"
                  rows="4"
                  placeholder="ملاحظات العلامات الحيوية، الفحص البدني، والتوصيات الطبية..."
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 leading-relaxed"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Treatment Section -->
          <div class="bg-white rounded-3xl border border-border-main p-6 shadow-xs">
            <h3 class="text-base font-bold text-text-main mb-2">العلاج والأدوية</h3>

            @if (!workspace()?.patientIsFollowUp) {
              <!-- Regular patient: Paper prescription rule -->
              <div class="p-4 bg-slate-50 rounded-2xl border border-border-subtle flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold shrink-0">
                  ✎
                </div>
                <div>
                  <h4 class="font-bold text-xs text-text-main mb-0.5">الروشتة الورقية للمريض</h4>
                  <p class="text-xs text-text-muted leading-relaxed">
                    يكتب الطبيب العلاج على الروشتة الورقية الرسمية بنفسه؛ لا يوجد إدخال علاج إلكتروني للمرضى العاديين داخل النظام.
                  </p>
                </div>
              </div>
            } @else {
              <!-- Follow-up patient: View medications recorded by secretary -->
              <div class="space-y-3">
                <p class="text-xs text-text-muted">
                  الأدوية المسجلة لمريض المتابعة بواسطة مكتب الاستقبال:
                </p>
                @for (med of followUpMedications(); track med.id) {
                  <div class="p-3 bg-slate-50 rounded-xl border border-border-subtle flex items-center justify-between text-xs">
                    <div>
                      <span class="font-bold text-text-main">{{ med.medicineName }}</span>
                      <span class="text-text-muted mx-2">({{ med.dosage }} - {{ med.frequency }})</span>
                    </div>
                    <span class="text-text-muted">{{ med.duration }}</span>
                  </div>
                }
                @if (followUpMedications().length === 0) {
                  <p class="text-xs text-text-muted italic">لم يتم إدخال أدوية متابعة بعد لهذه الزيارة.</p>
                }
              </div>
            }
          </div>
        </div>

        <!-- Right: Consultation Validity & Exam Completion (1 col) -->
        <div class="space-y-6">
          <!-- Next Consultation Validity Card -->
          <div class="bg-white rounded-3xl border border-border-main p-6 shadow-xs">
            <h3 class="text-base font-bold text-text-main mb-1">صلاحية الاستشارة القادمة</h3>
            <p class="text-xs text-text-muted mb-4">حدد أقصى موعد يسمح فيه للمريض بالاستشارة على هذا الكشف</p>

            <div class="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-3 mb-4 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-text-muted">المتبقي في الدورة:</span>
                <span class="font-bold text-primary font-sans text-sm">
                  {{ workspace()?.isUnlimitedConsultations ? 'غير محدود' : (workspace()?.remainingConsultationsAfterThisVisit + ' استشارة') }}
                </span>
              </div>

              @if (workspace()?.remainingConsultationsAfterThisVisit === 0 && !workspace()?.isUnlimitedConsultations) {
                <div class="p-2.5 rounded-xl bg-amber-100/70 text-amber-800 text-[11px] font-bold">
                  تم بلوغ الحد الأقصى للاستشارات؛ الزيارة القادمة ستكون كشفاً جديداً.
                </div>
              }
            </div>

            @if (workspace()?.canSetNextConsultationValidity) {
              <div>
                <label class="block text-xs font-bold text-text-main mb-1.5">تاريخ انتهاء صلاحية الاستشارة</label>
                <input
                  type="date"
                  [(ngModel)]="nextConsultationValidDate"
                  class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl text-xs font-sans text-text-main focus:bg-white"
                />
                <p class="text-[10px] text-text-muted mt-1.5">
                  تظل الاستشارة صالحة حتى نهاية اليوم المحدد (23:59).
                </p>
              </div>
            } @else {
              <p class="text-xs text-text-muted italic">لا يمكن منح استشارة أخرى على هذه الدورة.</p>
            }
          </div>

          <!-- Complete Exam Action -->
          <div class="bg-gradient-to-br from-navy-sidebar to-navy-deep rounded-3xl p-6 text-white shadow-xl">
            <h4 class="text-base font-bold mb-1">إنهاء وتوثيق الكشف</h4>
            <p class="text-xs text-slate-300 mb-6 leading-relaxed">
              الطبيب وحده يملك صلاحية إنهاء الكشف واعتماد التشخيص كحالة مكتملة (Completed).
            </p>

            <button
              type="button"
              (click)="completeVisit()"
              [disabled]="isSubmitting() || !diagnosisInput.trim()"
              class="w-full py-3.5 px-4 bg-primary hover:bg-primary-hover disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-black text-sm rounded-xl shadow-lg shadow-primary/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              @if (isSubmitting()) {
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              }
              <span>اعتماد وإنهاء الكشف (Completed)</span>
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class DoctorVisitComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  readonly tenantService = inject(TenantService);

  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  isUnpaid = signal<boolean>(false);

  workspace = signal<AppointmentVisitWorkspaceDto | null>(null);
  followUpMedications = signal<FollowUpMedicationDto[]>([]);

  diagnosisInput = '';
  diagnosisNotesInput = '';
  nextConsultationValidDate = '';

  ngOnInit(): void {
    const appointmentId = this.route.snapshot.queryParams['appointmentId'] || 'apt-1';
    this.loadWorkspace(appointmentId);
  }

  loadWorkspace(appointmentId: string): void {
    this.isLoading.set(true);
    this.api.getAppointment(appointmentId).subscribe({
      next: (apt) => {
        if (apt.paidStatus === 'Unpaid') {
          this.isUnpaid.set(true);
          this.isLoading.set(false);
          return;
        }

        this.api.getVisitWorkspace(appointmentId).subscribe({
          next: (ws) => {
            this.workspace.set(ws);
            this.diagnosisInput = ws.autoPrefilledCycleDiagnosis || ws.existingVisit?.diagnosis || 'نزلة معوية حادة مع جفاف خفيف';
            this.diagnosisNotesInput = ws.existingVisit?.diagnosisNotes || 'العلامات الحيوية مستقرة، يوصى بالراحة وشرب السوائل.';

            // Default consultation valid date to 14 days from today
            const validity = new Date();
            validity.setDate(validity.getDate() + 14);
            this.nextConsultationValidDate = validity.toISOString().split('T')[0];

            if (ws.existingVisit) {
              this.followUpMedications.set(ws.existingVisit.followUpMedications);
            }
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: () => this.isLoading.set(false)
    });
  }

  completeVisit(): void {
    const ws = this.workspace();
    if (!ws) return;

    if (!this.diagnosisInput.trim()) {
      this.toast.warning('يرجى كتابة التشخيص الطبي للحالة');
      return;
    }

    this.isSubmitting.set(true);
    this.api.completeMedicalVisit(ws.appointmentId, {
      diagnosis: this.diagnosisInput,
      diagnosisNotes: this.diagnosisNotesInput,
      nextConsultationValidUntilDate: ws.canSetNextConsultationValidity ? this.nextConsultationValidDate : null
    }).subscribe({
      next: () => {
        this.toast.success('تم إنهاء الكشف وتوثيق التشخيص بنجاح');
        this.isSubmitting.set(false);
        this.router.navigate([`/${this.tenantService.clinicSlug()}/doctor/dashboard`]);
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  goBack(): void {
    this.router.navigate([`/${this.tenantService.clinicSlug()}/doctor/dashboard`]);
  }
}

