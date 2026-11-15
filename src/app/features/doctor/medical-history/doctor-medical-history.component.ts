import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { MedicalVisitDto, PatientDto } from '../../../shared/models';

@Component({
  selector: 'app-doctor-medical-history',
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
      title="السجل والتاريخ المرضي للزيارات"
      subtitle="استعراض شامل لكافة الفحوصات والتشخيصات السابقة للمريض عبر مختلف تخصصات العيادة"
      [breadcrumbs]="[{ label: 'الرئيسية', url: '/doctor/dashboard' }, { label: 'السجل المرضي' }]"
    >
      <div actions>
        <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          خصوصية سريرية: هاتف المريض ورقم بطاقة المتابعة محجوبة عن الطبيب
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
        <div class="flex items-center gap-5 text-xs font-medium text-text-muted">
          <div>
            الاسم: <strong class="text-text-main font-bold">{{ p.fullName }}</strong>
          </div>
          @if (p.age) {
            <div>
              العمر: <strong class="text-text-main font-sans font-bold">{{ p.age }}</strong> سنة
            </div>
          }
          <div>
            الحالة: <strong class="text-primary font-bold">{{ p.isFollowUp ? 'متابع بالعيادة' : 'مريض كشف جديد' }}</strong>
          </div>
        </div>
      }
    </div>

    @if (isLoading()) {
      <app-loading-skeleton type="table" [count]="3"></app-loading-skeleton>
    } @else if (visits().length === 0) {
      <div class="bg-white rounded-3xl border border-border-main p-12 text-center shadow-xs">
        <app-empty-state
          title="لا توجد زيارات أو كشوفات مسجلة"
          description="لم يقم المريض بأي كشوفات سابقة مكتملة في العيادة حتى الآن."
          iconType="folder"
        ></app-empty-state>
      </div>
    } @else {
      <!-- Timeline Visits -->
      <div class="space-y-6">
        @for (v of visits(); track v.medicalVisitId) {
          <div class="bg-white rounded-3xl border border-border-main shadow-xs overflow-hidden transition-all hover:border-primary/40">
            <!-- Visit Top Banner -->
            <div class="p-5 sm:px-6 bg-slate-50/70 border-b border-border-main flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-black text-text-main">
                      {{ v.appointmentDate | date: 'EEEE, d MMMM yyyy' }}
                    </h3>
                    <span
                      class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                      [ngClass]="v.appointmentType === 'NewExam' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'"
                    >
                      {{ v.appointmentType === 'NewExam' ? 'كشف جديد' : 'استشارة دورية (' + (v.consultationNumber || 1) + ')' }}
                    </span>
                  </div>
                  <p class="text-xs text-text-muted mt-0.5">
                    الطبيب المعالج: <strong class="text-text-main">{{ v.doctorName }}</strong>
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                @if (v.nextConsultationValidUntilDate) {
                  <div class="text-left text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl font-bold">
                    <span>صلاحية الاستشارة: </span>
                    <span class="font-sans">{{ v.nextConsultationValidUntilDate | date: 'yyyy/MM/dd' }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Visit Content Body -->
            <div class="p-5 sm:p-6 space-y-5">
              <!-- Diagnosis Box -->
              <div>
                <h4 class="text-xs font-bold text-text-muted mb-1.5">التشخيص الطبي السريري:</h4>
                <div class="p-3.5 bg-blue-50/40 rounded-2xl border border-blue-100 text-sm font-bold text-text-main leading-relaxed">
                  {{ v.diagnosis }}
                </div>
              </div>

              <!-- Doctor Notes -->
              @if (v.diagnosisNotes) {
                <div>
                  <h4 class="text-xs font-bold text-text-muted mb-1.5">ملاحظات الطبيب وتوصيات المتابعة:</h4>
                  <div class="p-3 bg-slate-50 rounded-2xl border border-border-main text-xs text-text-main leading-relaxed">
                    {{ v.diagnosisNotes }}
                  </div>
                </div>
              }

              <!-- Follow Up Medications if any -->
              @if (v.followUpMedications && v.followUpMedications.length > 0) {
                <div>
                  <h4 class="text-xs font-bold text-text-muted mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <span>الأدوية الموصوفة لمريض المتابعة:</span>
                  </h4>

                  <div class="overflow-x-auto rounded-2xl border border-border-main">
                    <table class="w-full text-right text-xs">
                      <thead class="bg-slate-50 text-text-muted font-bold border-b border-border-main">
                        <tr>
                          <th class="py-2.5 px-3">اسم الدواء</th>
                          <th class="py-2.5 px-3">الجرعة</th>
                          <th class="py-2.5 px-3">التكرار</th>
                          <th class="py-2.5 px-3">المدة</th>
                          <th class="py-2.5 px-3">ملاحظات</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-border-main">
                        @for (med of v.followUpMedications; track med.id) {
                          <tr class="hover:bg-slate-50/50">
                            <td class="py-2.5 px-3 font-bold text-text-main">{{ med.medicineName }}</td>
                            <td class="py-2.5 px-3 font-sans">{{ med.dosage }}</td>
                            <td class="py-2.5 px-3">{{ med.frequency }}</td>
                            <td class="py-2.5 px-3 font-sans">{{ med.duration }}</td>
                            <td class="py-2.5 px-3 text-text-muted">{{ med.notes || '-' }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    }
  `
})
export class DoctorMedicalHistoryComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  patients = signal<PatientDto[]>([]);
  selectedPatientId = signal<string>('');
  currentPatient = signal<PatientDto | null>(null);
  visits = signal<MedicalVisitDto[]>([]);
  isLoading = signal<boolean>(false);

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
    this.loadHistory(patientId);
  }

  loadHistory(patientId: string): void {
    this.isLoading.set(true);
    this.apiService.getPatientHistory(patientId).subscribe({
      next: data => {
        this.visits.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('تعذر تحميل التاريخ المرضي للمريض');
        this.isLoading.set(false);
      }
    });
  }
}
