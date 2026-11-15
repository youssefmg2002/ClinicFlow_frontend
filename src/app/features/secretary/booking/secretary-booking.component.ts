import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { TenantService } from '../../../core/tenant/tenant.service';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import {
  DoctorDto,
  PatientDto,
  AppointmentType,
  ConsultationEligibilityResultDto,
  PricingPreviewDto
} from '../../../shared/models';

@Component({
  selector: 'app-secretary-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageHeaderComponent],
  template: `
    <app-page-header
      title="إنشاء حجز جديد وتخصيص الدور"
      subtitle="البحث عن المريض أو تسجيل مريض جديد، واختيار الطبيب وتاريخ الكشف مع احتساب استحقاق الاستشارة والسعر الخاص"
      [breadcrumbs]="[{ label: 'الرئيسية', url: '/secretary/dashboard' }, { label: 'إنشاء حجز' }]"
    ></app-page-header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left/Main: Booking Form (2 cols) -->
      <div class="lg:col-span-2 bg-white rounded-3xl border border-border-main p-6 sm:p-8 shadow-xs">
        <form [formGroup]="bookingForm" (ngSubmit)="onSubmitBooking()" class="space-y-6 text-xs sm:text-sm">
          <!-- Step 1: Patient Selection / Search -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-extrabold text-text-main flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</span>
                <span>بيانات المريض</span>
              </h3>

              <button
                type="button"
                (click)="isNewPatientModalOpen.set(true)"
                class="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                + مريض جديد غير مسجل
              </button>
            </div>

            <!-- Patient search box -->
            <div class="relative mb-2">
              <input
                type="text"
                [(ngModel)]="patientSearchTerm"
                [ngModelOptions]="{standalone: true}"
                (input)="onPatientSearchInput()"
                placeholder="ابحث باسم المريض أو رقم هاتفه..."
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
              @if (patientSearchResults().length > 0) {
                <div class="absolute z-20 w-full mt-1 bg-white border border-border-main rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-border-subtle">
                  @for (p of patientSearchResults(); track p.patientId) {
                    <div
                      (click)="selectPatient(p)"
                      class="p-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <p class="font-bold text-text-main text-xs sm:text-sm">{{ p.fullName }}</p>
                        <p class="text-[11px] text-text-muted font-mono" dir="ltr">{{ p.phoneNumber }}</p>
                      </div>
                      @if (p.isFollowUp) {
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">متابعة</span>
                      }
                    </div>
                  }
                </div>
              }
            </div>

            @if (selectedPatient()) {
              <div class="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-primary text-white font-bold flex items-center justify-center text-sm">
                    {{ selectedPatient()?.fullName?.charAt(0) }}
                  </div>
                  <div>
                    <p class="font-bold text-text-main text-sm">{{ selectedPatient()?.fullName }}</p>
                    <p class="text-xs text-text-muted font-mono" dir="ltr">{{ selectedPatient()?.phoneNumber }}</p>
                  </div>
                </div>
                <button
                  type="button"
                  (click)="clearSelectedPatient()"
                  class="text-xs text-rose-600 hover:underline cursor-pointer"
                >
                  تغيير المريض
                </button>
              </div>
            } @else {
              <p class="text-[11px] text-text-muted">اختر المريض من نتائج البحث أو انقر "مريض جديد" لتسجيله فوراً.</p>
            }
          </div>

          <!-- Step 2: Doctor & Date Selection -->
          <div class="pt-4 border-t border-border-subtle">
            <h3 class="text-sm font-extrabold text-text-main flex items-center gap-2 mb-4">
              <span class="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>اختيار الطبيب وتاريخ الحجز</span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Doctor ONLY (Allowed doctors only, no specialty prompt) -->
              <div>
                <label class="block font-bold text-text-main mb-1.5">الطبيب المعالج *</label>
                <select
                  formControlName="doctorId"
                  (change)="onDoctorChanged()"
                  class="w-full px-3 py-2.5 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 font-semibold"
                >
                  <option value="" disabled>اختر الطبيب المصرح به</option>
                  @for (doc of doctors(); track doc.doctorId) {
                    <option [value]="doc.doctorId">{{ doc.fullName }} ({{ doc.specialties[0]?.specialtyName || 'طبيب' }})</option>
                  }
                </select>
              </div>

              <!-- Date Picker (No time slot!) -->
              <div>
                <label class="block font-bold text-text-main mb-1.5">تاريخ الحجز *</label>
                <input
                  type="date"
                  formControlName="appointmentDate"
                  class="w-full px-3 py-2.5 bg-slate-50 border border-border-main rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 font-sans"
                />
              </div>
            </div>
          </div>

          <!-- Step 3: Appointment Type & Consultation Eligibility -->
          <div class="pt-4 border-t border-border-subtle">
            <h3 class="text-sm font-extrabold text-text-main flex items-center gap-2 mb-4">
              <span class="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>نوع الحجز وصلاحية الاستشارة</span>
            </h3>

            <div class="grid grid-cols-2 gap-3 mb-4">
              <label
                class="p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3"
                [ngClass]="bookingForm.get('appointmentType')?.value === 'NewExam' ? 'border-primary bg-blue-50/40 text-primary font-bold' : 'border-border-main bg-white text-text-muted'"
              >
                <input type="radio" formControlName="appointmentType" value="NewExam" (change)="onAppointmentTypeChanged()" class="sr-only" />
                <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center" [ngClass]="bookingForm.get('appointmentType')?.value === 'NewExam' ? 'border-primary' : 'border-slate-300'">
                  @if (bookingForm.get('appointmentType')?.value === 'NewExam') {
                    <div class="w-2 h-2 rounded-full bg-primary"></div>
                  }
                </div>
                <div>
                  <span class="block text-sm">كشف جديد (NewExam)</span>
                  <span class="text-[10px] text-text-muted font-normal">يبدأ دورة استشارات جديدة</span>
                </div>
              </label>

              <label
                class="p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3"
                [ngClass]="bookingForm.get('appointmentType')?.value === 'Consultation' ? 'border-primary bg-blue-50/40 text-primary font-bold' : 'border-border-main bg-white text-text-muted'"
              >
                <input type="radio" formControlName="appointmentType" value="Consultation" (change)="onAppointmentTypeChanged()" class="sr-only" />
                <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center" [ngClass]="bookingForm.get('appointmentType')?.value === 'Consultation' ? 'border-primary' : 'border-slate-300'">
                  @if (bookingForm.get('appointmentType')?.value === 'Consultation') {
                    <div class="w-2 h-2 rounded-full bg-primary"></div>
                  }
                </div>
                <div>
                  <span class="block text-sm">استشارة (Consultation)</span>
                  <span class="text-[10px] text-text-muted font-normal">مرتبطة بكشف سابق عند نفس الطبيب</span>
                </div>
              </label>
            </div>

            <!-- Consultation Eligibility Banner -->
            @if (bookingForm.get('appointmentType')?.value === 'Consultation') {
              @if (eligibility()) {
                @if (eligibility()?.isEligible) {
                  <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1 mb-4">
                    <p class="font-bold flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
                      الاستشارة صالحة وسارية المفعول
                    </p>
                    <p class="text-[11px] text-emerald-700">
                      رقم الاستشارة في الدورة: <strong>{{ eligibility()?.nextConsultationNumber }}</strong>
                      | صالحة حتى: <strong>{{ eligibility()?.validUntilDate }}</strong>
                    </p>
                  </div>
                } @else if (eligibility()?.requiresLateExceptionConfirmation) {
                  <!-- Expired Consultation with Exception Confirmation Option -->
                  <div class="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-2 mb-4">
                    <div class="flex items-center gap-2 font-bold text-amber-800">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>انتهت فترة صلاحية الاستشارة (تأخير {{ eligibility()?.delayDays }} يوم)</span>
                    </div>
                    <p class="text-[11px] text-amber-700 leading-relaxed">
                      {{ eligibility()?.message }}
                    </p>
                    <label class="flex items-center gap-2 pt-2 border-t border-amber-200 cursor-pointer font-bold text-amber-900">
                      <input
                        type="checkbox"
                        formControlName="allowLateConsultationException"
                        class="rounded border-amber-400 text-amber-600 focus:ring-amber-500 w-4 h-4"
                      />
                      <span>تأكيد استثناء قبول الاستشارة المتأخرة (يُسجل في سجل المراجعة باسمك)</span>
                    </label>
                  </div>
                } @else {
                  <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 mb-4">
                    <p class="font-bold">غير مؤهل للاستشارة:</p>
                    <p class="mt-0.5">{{ eligibility()?.message || 'تم استنفاد الحد الأقصى للاستشارات، يجب حجز كشف جديد.' }}</p>
                  </div>
                }
              }
            }
          </div>

          <!-- Step 4: Special Price Option -->
          <div class="pt-4 border-t border-border-subtle">
            <div class="p-4 rounded-2xl bg-slate-50 border border-border-main">
              <label class="flex items-center justify-between cursor-pointer select-none">
                <div class="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    formControlName="applySpecialPrice"
                    (change)="onSpecialPriceToggle()"
                    class="rounded border-border-main text-primary focus:ring-primary/20 w-4 h-4"
                  />
                  <div>
                    <span class="text-xs font-bold text-text-main">تطبيق السعر الخاص لهذا الحجز</span>
                    <p class="text-[10px] text-text-muted">متاح للسكرتير تطبيقه للحالات المستحقة</p>
                  </div>
                </div>
                @if (pricePreview()?.isSpecialPricingAvailable) {
                  <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    خصم {{ pricePreview()?.discountAmount }} ج.م
                  </span>
                }
              </label>

              @if (bookingForm.get('applySpecialPrice')?.value) {
                <div class="mt-3 pt-3 border-t border-border-subtle">
                  <label class="block text-[11px] font-bold text-text-muted mb-1">سبب أو ملاحظة السعر الخاص (اختياري)</label>
                  <input
                    type="text"
                    formControlName="specialPriceNotes"
                    placeholder="مثال: حالة إنسانية، قريب طبيب، رعاية أيتام"
                    class="w-full px-3 py-1.5 bg-white border border-border-main rounded-xl text-xs text-text-main"
                  />
                </div>
              }
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-4 border-t border-border-subtle flex items-center justify-end">
            <button
              type="submit"
              [disabled]="bookingForm.invalid || !selectedPatient() || isSubmitting()"
              class="px-8 py-3 bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/25 transition-all cursor-pointer flex items-center gap-2"
            >
              @if (isSubmitting()) {
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              }
              <span>تأكيد الحجز واستخراج رقم الدور</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Right Column: Booking Summary & Live Ticket Preview -->
      <div class="space-y-4">
        <div class="bg-gradient-to-br from-navy-sidebar to-navy-deep rounded-3xl p-6 text-white shadow-xl">
          <span class="text-[10px] font-bold tracking-wider text-blue-300 uppercase">تذكرة الحجز المتوقعة</span>
          <h4 class="text-xl font-black mt-1 font-sans">عيادة النور التخصصية</h4>
          <p class="text-xs text-slate-300 mt-0.5">ClinicFlow Queue Ticket</p>

          <div class="my-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
            <span class="text-xs text-blue-200">رقم الدور يتم إنشاؤه ذرياً</span>
            <p class="text-4xl font-black text-white font-sans mt-1"># التالي</p>
            <span class="text-[11px] text-emerald-300 font-semibold mt-1 block">بدون حجز ساعة - بالترتيب الفعلي</span>
          </div>

          <div class="space-y-2 text-xs border-t border-white/15 pt-4 text-slate-300">
            <div class="flex justify-between">
              <span>المريض:</span>
              <span class="font-bold text-white">{{ selectedPatient()?.fullName || '---' }}</span>
            </div>
            <div class="flex justify-between">
              <span>الطبيب:</span>
              <span class="font-bold text-white">{{ selectedDoctorName() }}</span>
            </div>
            <div class="flex justify-between">
              <span>التاريخ:</span>
              <span class="font-bold text-white">{{ bookingForm.get('appointmentDate')?.value }}</span>
            </div>
            <div class="flex justify-between">
              <span>النوع:</span>
              <span class="font-bold text-white">
                {{ bookingForm.get('appointmentType')?.value === 'NewExam' ? 'كشف جديد' : 'استشارة' }}
              </span>
            </div>
            <div class="flex justify-between pt-2 border-t border-white/10 text-sm">
              <span class="font-bold text-white">المبلغ المطلوب:</span>
              <span class="font-black text-emerald-300 font-sans text-base">
                {{ calculatedPrice() }} ج.م
              </span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-border-main p-4 shadow-xs text-xs text-text-muted">
          <p class="font-bold text-text-main mb-1">تعليمات هامة للاستقبال:</p>
          <ul class="list-disc list-inside space-y-1">
            <li>يجب تحصيل الرسوم وتسجيل الدفع قبل بدء الطبيب للكشف.</li>
            <li>رقم الدور ملزم ولا يتغير حتى وإن تأخر المريض عن الحضور.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Quick New Patient Modal -->
    @if (isNewPatientModalOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" (click)="isNewPatientModalOpen.set(false)"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-border-main text-right" dir="rtl">
            <h3 class="text-base font-black text-text-main mb-1">تسجيل مريض جديد سريع</h3>
            <p class="text-xs text-text-muted mb-4">أدخل الاسم الثلاثي ورقم الهاتف لتسجيل المريض وحجزه فوراً</p>

            <div class="space-y-4 text-xs sm:text-sm">
              <div>
                <label class="block font-bold text-text-main mb-1">الاسم الثلاثي بالكامل *</label>
                <input type="text" [(ngModel)]="newPatientName" placeholder="محمد علي حسن" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl" />
              </div>

              <div>
                <label class="block font-bold text-text-main mb-1">رقم الهاتف *</label>
                <input type="text" [(ngModel)]="newPatientPhone" placeholder="01012345678" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl" />
              </div>

              <div>
                <label class="block font-bold text-text-main mb-1">العمر (سنوات)</label>
                <input type="number" [(ngModel)]="newPatientAge" placeholder="30" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl" />
              </div>

              <label class="flex items-center gap-2 cursor-pointer font-bold text-xs text-text-main pt-1">
                <input type="checkbox" [(ngModel)]="newPatientIsFollowUp" class="rounded text-primary w-4 h-4" />
                <span>مريض متابعة دورية (IsFollowUp)</span>
              </label>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle mt-6">
                <button type="button" (click)="isNewPatientModalOpen.set(false)" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-text-muted rounded-xl text-xs font-bold">إلغاء</button>
                <button type="button" (click)="saveQuickPatient()" class="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20">تسجيل واختيار المريض</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class SecretaryBookingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly tenantService = inject(TenantService);

  isSubmitting = signal<boolean>(false);
  doctors = signal<DoctorDto[]>([]);
  selectedPatient = signal<PatientDto | null>(null);
  patientSearchTerm = '';
  patientSearchResults = signal<PatientDto[]>([]);
  eligibility = signal<ConsultationEligibilityResultDto | null>(null);
  pricePreview = signal<PricingPreviewDto | null>(null);

  isNewPatientModalOpen = signal<boolean>(false);
  newPatientName = '';
  newPatientPhone = '';
  newPatientAge: number | null = null;
  newPatientIsFollowUp = false;

  bookingForm = this.fb.group({
    doctorId: ['', [Validators.required]],
    appointmentDate: [new Date().toISOString().split('T')[0], [Validators.required]],
    appointmentType: ['NewExam' as AppointmentType, [Validators.required]],
    applySpecialPrice: [false],
    specialPriceNotes: [''],
    allowLateConsultationException: [false]
  });

  ngOnInit(): void {
    this.api.getDoctors().subscribe({
      next: (docs) => {
        this.doctors.set(docs);
        if (docs.length > 0) {
          this.bookingForm.patchValue({ doctorId: docs[0].doctorId });
          this.fetchPricePreview();
        }
      }
    });
  }

  onPatientSearchInput(): void {
    const term = this.patientSearchTerm.trim();
    if (term.length < 2) {
      this.patientSearchResults.set([]);
      return;
    }
    this.api.getPatients({ search: term, pageSize: 6 }).subscribe({
      next: (res) => this.patientSearchResults.set(res.items)
    });
  }

  selectPatient(p: PatientDto): void {
    this.selectedPatient.set(p);
    this.patientSearchTerm = '';
    this.patientSearchResults.set([]);
    if (this.bookingForm.get('appointmentType')?.value === 'Consultation') {
      this.checkEligibility();
    }
  }

  clearSelectedPatient(): void {
    this.selectedPatient.set(null);
    this.eligibility.set(null);
  }

  onDoctorChanged(): void {
    this.fetchPricePreview();
    if (this.bookingForm.get('appointmentType')?.value === 'Consultation') {
      this.checkEligibility();
    }
  }

  onAppointmentTypeChanged(): void {
    this.fetchPricePreview();
    if (this.bookingForm.get('appointmentType')?.value === 'Consultation') {
      this.checkEligibility();
    } else {
      this.eligibility.set(null);
    }
  }

  onSpecialPriceToggle(): void {
    this.fetchPricePreview();
  }

  checkEligibility(): void {
    const pat = this.selectedPatient();
    const docId = this.bookingForm.get('doctorId')?.value;
    if (!pat || !docId) return;

    this.api.checkConsultationEligibility(pat.patientId, docId).subscribe({
      next: (res) => this.eligibility.set(res)
    });
  }

  fetchPricePreview(): void {
    const docId = this.bookingForm.get('doctorId')?.value;
    const type = this.bookingForm.get('appointmentType')?.value || 'NewExam';
    if (!docId) return;

    this.api.getPricingPreview(docId, type).subscribe({
      next: (res) => this.pricePreview.set(res)
    });
  }

  selectedDoctorName(): string {
    const docId = this.bookingForm.get('doctorId')?.value;
    const doc = this.doctors().find(d => d.doctorId === docId);
    return doc?.fullName || '---';
  }

  calculatedPrice(): number {
    const preview = this.pricePreview();
    const applySpecial = this.bookingForm.get('applySpecialPrice')?.value;

    if (preview) {
      if (applySpecial && preview.specialPrice !== null) {
        return preview.specialPrice;
      }
      return preview.basePrice;
    }
    return 300;
  }

  saveQuickPatient(): void {
    if (!this.newPatientName.trim() || !this.newPatientPhone.trim()) {
      this.toast.warning('يرجى إدخال الاسم ورقم الهاتف');
      return;
    }

    this.api.createPatient({
      fullName: this.newPatientName,
      phoneNumber: this.newPatientPhone,
      age: this.newPatientAge,
      isFollowUp: this.newPatientIsFollowUp
    }).subscribe({
      next: (created) => {
        this.selectedPatient.set(created);
        this.toast.success('تم تسجيل المريض واختياره بنجاح');
        this.isNewPatientModalOpen.set(false);
      }
    });
  }

  onSubmitBooking(): void {
    const pat = this.selectedPatient();
    if (!pat) {
      this.toast.warning('يرجى اختيار مريض أولاً');
      return;
    }

    if (this.bookingForm.invalid) return;

    const val = this.bookingForm.value;
    this.isSubmitting.set(true);

    this.api.createAppointment({
      patientId: pat.patientId,
      doctorId: val.doctorId!,
      appointmentDate: val.appointmentDate!,
      appointmentType: val.appointmentType!,
      applySpecialPrice: !!val.applySpecialPrice,
      specialPriceNotes: val.specialPriceNotes || null,
      allowLateConsultationException: !!val.allowLateConsultationException
    }).subscribe({
      next: (apt) => {
        this.toast.success(`تم إنشاء الحجز بنجاح! رقم الدور المخصص: #${apt.queueNumber}`);
        this.isSubmitting.set(false);
        this.router.navigate([`/${this.tenantService.clinicSlug()}/secretary/queue`]);
      },
      error: () => this.isSubmitting.set(false)
    });
  }
}

