import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import {
  DoctorDto,
  WeeklyShiftDto,
  DoctorLeaveDto,
  WeeklyShiftInputDto
} from '../../../shared/models';

interface DayOption {
  dayOfWeek: number;
  name: string;
}

@Component({
  selector: 'app-doctor-schedules',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, LoadingSkeletonComponent],
  template: `
    <app-page-header
      title="مواعيد العمل والإجازات الاستثنائية"
      subtitle="إدارة الجدول الأسبوعي المتكرر لكل طبيب وتسجيل فترات الإجازات مع فحص تعارض الحجوزات"
      [breadcrumbs]="[{ label: 'الرئيسية', url: '/admin/dashboard' }, { label: 'جداول العمل' }]"
    ></app-page-header>

    <!-- Doctor Selector -->
    <div class="bg-white rounded-2xl border border-border-main p-4 mb-6 shadow-xs flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <label class="text-xs font-bold text-text-main whitespace-nowrap">اختر الطبيب:</label>
        <select
          [ngModel]="selectedDoctorId()"
          (ngModelChange)="onDoctorChange($event)"
          class="px-3 py-2 bg-slate-50 border border-border-main rounded-xl text-xs font-bold text-text-main focus:bg-white"
        >
          @for (doc of doctors(); track doc.doctorId) {
            <option [value]="doc.doctorId">{{ doc.fullName }} ({{ doc.specialties[0]?.specialtyName || 'طبيب' }})</option>
          }
        </select>
      </div>

      <span class="text-xs text-text-muted hidden sm:inline">
        فحص التعارض: يتم منع تسجيل إجازة أو إلغاء فترة عمل إذا كانت هناك حجوزات قائمة
      </span>
    </div>

    @if (isLoading()) {
      <app-loading-skeleton type="card" [count]="2"></app-loading-skeleton>
    } @else {
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 1. Weekly Schedule Editor -->
        <div class="bg-white rounded-3xl border border-border-main p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 mb-4 border-b border-border-subtle">
              <div>
                <h3 class="text-base font-bold text-text-main">الجدول الأسبوعي المتكرر</h3>
                <p class="text-xs text-text-muted mt-0.5">أيام وفترات استقبال الحالات أسبوعياً</p>
              </div>
              <button
                type="button"
                (click)="addShiftRow()"
                class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-primary rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                + إضافة فترة عمل
              </button>
            </div>

            <!-- Shifts rows -->
            <div class="space-y-3">
              @for (shift of activeShifts; track $index; let i = $index) {
                <div class="p-3.5 rounded-2xl bg-slate-50 border border-border-subtle flex items-center justify-between gap-3">
                  <div class="grid grid-cols-3 gap-2 flex-1">
                    <div>
                      <label class="block text-[10px] font-bold text-text-muted mb-1">اليوم</label>
                      <select [(ngModel)]="shift.dayOfWeek" class="w-full px-2 py-1.5 bg-white border border-border-main rounded-lg text-xs font-bold">
                        @for (day of daysOfWeek; track day.dayOfWeek) {
                          <option [value]="day.dayOfWeek">{{ day.name }}</option>
                        }
                      </select>
                    </div>

                    <div>
                      <label class="block text-[10px] font-bold text-text-muted mb-1">من الساعة</label>
                      <input type="time" [(ngModel)]="shift.startTime" class="w-full px-2 py-1.5 bg-white border border-border-main rounded-lg text-xs font-sans" />
                    </div>

                    <div>
                      <label class="block text-[10px] font-bold text-text-muted mb-1">إلى الساعة</label>
                      <input type="time" [(ngModel)]="shift.endTime" class="w-full px-2 py-1.5 bg-white border border-border-main rounded-lg text-xs font-sans" />
                    </div>
                  </div>

                  <button
                    type="button"
                    (click)="removeShiftRow(i)"
                    class="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0 mt-3"
                    title="حذف الفترة"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              }
              @if (activeShifts.length === 0) {
                <div class="text-center py-8 text-text-muted text-xs bg-slate-50 rounded-2xl border border-dashed border-border-subtle">
                  لم يتم تحديد فترات عمل لهذا الطبيب بعد.
                </div>
              }
            </div>
          </div>

          <div class="pt-5 mt-6 border-t border-border-subtle flex justify-end">
            <button
              type="button"
              (click)="saveWeeklySchedule()"
              class="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 transition-colors cursor-pointer"
            >
              حفظ الجدول الأسبوعي
            </button>
          </div>
        </div>

        <!-- 2. Exceptional Leaves List & Add Leave -->
        <div class="bg-white rounded-3xl border border-border-main p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 mb-4 border-b border-border-subtle">
              <div>
                <h3 class="text-base font-bold text-text-main">الإجازات الاستثنائية</h3>
                <p class="text-xs text-text-muted mt-0.5">تسجيل إجازات الطبيب الرسمية والطارئة</p>
              </div>
              <button
                type="button"
                (click)="isAddLeaveModalOpen.set(true)"
                class="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                + تسجيل إجازة جديدة
              </button>
            </div>

            <!-- Leaves List -->
            <div class="space-y-3">
              @for (leave of leaves(); track leave.id) {
                <div class="p-4 rounded-2xl border border-border-main bg-slate-50 flex items-center justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span class="font-bold text-text-main text-xs sm:text-sm">
                        من {{ leave.startDate }} إلى {{ leave.endDate }}
                      </span>
                    </div>
                    <p class="text-xs text-text-muted">
                      {{ leave.reason || 'إجازة اعتيادية' }}
                    </p>
                  </div>

                  <button
                    type="button"
                    (click)="deleteLeave(leave.id)"
                    class="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    إلغاء الإجازة
                  </button>
                </div>
              }
              @if (leaves().length === 0) {
                <div class="text-center py-8 text-text-muted text-xs bg-slate-50 rounded-2xl border border-dashed border-border-subtle">
                  لا توجد إجازات استثنائية مسجلة لهذا الطبيب.
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Add Leave Modal -->
    @if (isAddLeaveModalOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" (click)="isAddLeaveModalOpen.set(false)"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-border-main text-right" dir="rtl">
            <h3 class="text-base font-black text-text-main mb-4">تسجيل إجازة استثنائية للطبيب</h3>

            <div class="space-y-4 text-xs sm:text-sm">
              <div>
                <label class="block font-bold text-text-main mb-1.5">تاريخ البداية *</label>
                <input type="date" [(ngModel)]="leaveStartDate" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl font-sans" />
              </div>

              <div>
                <label class="block font-bold text-text-main mb-1.5">تاريخ النهاية *</label>
                <input type="date" [(ngModel)]="leaveEndDate" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl font-sans" />
              </div>

              <div>
                <label class="block font-bold text-text-main mb-1.5">سبب الإجازة (اختياري)</label>
                <input type="text" [(ngModel)]="leaveReason" placeholder="مثال: مؤتمر طبي أو إجازة سنوية" class="w-full px-3 py-2 bg-slate-50 border border-border-main rounded-xl" />
              </div>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle mt-6">
                <button type="button" (click)="isAddLeaveModalOpen.set(false)" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-text-muted rounded-xl text-xs font-bold">إلغاء</button>
                <button type="button" (click)="saveLeave()" class="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20">تسجيل الإجازة</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class DoctorSchedulesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  isLoading = signal<boolean>(true);
  doctors = signal<DoctorDto[]>([]);
  selectedDoctorId = signal<string>('');
  leaves = signal<DoctorLeaveDto[]>([]);

  isAddLeaveModalOpen = signal<boolean>(false);
  leaveStartDate = '';
  leaveEndDate = '';
  leaveReason = '';

  activeShifts: WeeklyShiftInputDto[] = [];

  readonly daysOfWeek: DayOption[] = [
    { dayOfWeek: 0, name: 'الأحد' },
    { dayOfWeek: 1, name: 'الإثنين' },
    { dayOfWeek: 2, name: 'الثلاثاء' },
    { dayOfWeek: 3, name: 'الأربعاء' },
    { dayOfWeek: 4, name: 'الخميس' },
    { dayOfWeek: 5, name: 'الجمعة' },
    { dayOfWeek: 6, name: 'السبت' }
  ];

  ngOnInit(): void {
    this.api.getDoctors().subscribe({
      next: (docs) => {
        this.doctors.set(docs);
        if (docs.length > 0) {
          this.selectedDoctorId.set(docs[0].doctorId);
          this.loadDoctorSchedule(docs[0].doctorId);
        } else {
          this.isLoading.set(false);
        }
      }
    });
  }

  onDoctorChange(docId: string): void {
    this.selectedDoctorId.set(docId);
    this.loadDoctorSchedule(docId);
  }

  loadDoctorSchedule(docId: string): void {
    this.isLoading.set(true);

    this.api.getDoctorWeeklySchedule(docId).subscribe({
      next: (shifts) => {
        this.activeShifts = shifts.map(s => ({
          dayOfWeek: Number(s.dayOfWeek),
          startTime: s.startTime,
          endTime: s.endTime
        }));
        if (this.activeShifts.length === 0) {
          // Default template
          this.activeShifts = [
            { dayOfWeek: 0, startTime: '17:00', endTime: '21:00' },
            { dayOfWeek: 2, startTime: '17:00', endTime: '21:00' },
            { dayOfWeek: 4, startTime: '17:00', endTime: '21:00' }
          ];
        }
      }
    });

    this.api.getDoctorLeaves(docId).subscribe({
      next: (leavesData) => {
        this.leaves.set(leavesData);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  addShiftRow(): void {
    this.activeShifts.push({
      dayOfWeek: 1,
      startTime: '17:00',
      endTime: '21:00'
    });
  }

  removeShiftRow(index: number): void {
    this.activeShifts.splice(index, 1);
  }

  saveWeeklySchedule(): void {
    const docId = this.selectedDoctorId();
    if (!docId) return;

    this.api.updateDoctorWeeklySchedule(docId, { shifts: this.activeShifts }).subscribe({
      next: () => {
        this.toast.success('تم حفظ جدول العمل الأسبوعي للطبيب بنجاح');
      }
    });
  }

  saveLeave(): void {
    const docId = this.selectedDoctorId();
    if (!docId || !this.leaveStartDate || !this.leaveEndDate) {
      this.toast.warning('يرجى تحديد تاريخي البداية والنهاية');
      return;
    }

    this.api.createDoctorLeave(docId, {
      startDate: this.leaveStartDate,
      endDate: this.leaveEndDate,
      reason: this.leaveReason
    }).subscribe({
      next: (newLeave) => {
        this.leaves.update(list => [...list, newLeave]);
        this.toast.success('تم تسجيل الإجازة بنجاح مع فحص عدم تعارض الحجوزات');
        this.isAddLeaveModalOpen.set(false);
        this.leaveStartDate = '';
        this.leaveEndDate = '';
        this.leaveReason = '';
      }
    });
  }

  deleteLeave(leaveId: string): void {
    const docId = this.selectedDoctorId();
    if (!docId) return;

    this.api.deleteDoctorLeave(docId, leaveId).subscribe({
      next: () => {
        this.leaves.update(list => list.filter(l => l.id !== leaveId));
        this.toast.success('تم إلغاء الإجازة وإعادة استقبال الحجوزات للفترة');
      }
    });
  }
}

