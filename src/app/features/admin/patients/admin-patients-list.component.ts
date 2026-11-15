import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { SearchInputComponent } from '../../../shared/components/search-input.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { PatientDto } from '../../../shared/models';

@Component({
  selector: 'app-admin-patients-list',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    SearchInputComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    ConfirmDialogComponent
  ],
  template: `
    <app-page-header
      title="سجل المرضى (الإدارة)"
      subtitle="عرض وتوثيق السجلات الإدارية للمرضى، وإدارة الأرشفة والاستعادة"
      [breadcrumbs]="[{ label: 'الرئيسية', url: '/admin/dashboard' }, { label: 'المرضى' }]"
    >
      <div actions class="flex items-center gap-2">
        <!-- Privacy Info Banner for Admin -->
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          خصوصية مشددة: البيانات الطبية والسريرية معزولة تماماً عن لوحة الإدارة
        </span>
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
            [checked]="includeArchived()"
            (change)="toggleIncludeArchived()"
            class="rounded border-border-main text-primary focus:ring-primary/20"
          />
          <span>إظهار الملفات المؤرشفة</span>
        </label>
        <span class="text-slate-300">|</span>
        <span>إجمالي المرضى: <strong class="text-text-main font-sans">{{ totalCount() }}</strong></span>
      </div>
    </div>

    @if (isLoading()) {
      <app-loading-skeleton type="table" [count]="4"></app-loading-skeleton>
    } @else if (patients().length === 0) {
      <app-empty-state
        title="لم يتم العثور على مرضى"
        message="لا توجد سجلات مرضى تطابق خيارات البحث المحددة."
      ></app-empty-state>
    } @else {
      <div class="bg-white rounded-2xl border border-border-main overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr class="bg-slate-50/70 text-text-muted border-b border-border-subtle font-bold">
                <th class="py-3.5 px-4 rounded-r-xl">المريض</th>
                <th class="py-3.5 px-4">رقم الهاتف</th>
                <th class="py-3.5 px-4">العمر</th>
                <th class="py-3.5 px-4">نوع الملف</th>
                <th class="py-3.5 px-4">السعر الخاص</th>
                <th class="py-3.5 px-4">تاريخ التسجيل</th>
                <th class="py-3.5 px-4 rounded-l-xl text-left">الإجراءات الإدارية</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              @for (pat of patients(); track pat.patientId) {
                <tr class="hover:bg-slate-50/50 transition-colors" [class.opacity-60]="!pat.isActive">
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-full bg-slate-100 text-text-main flex items-center justify-center font-bold text-xs shrink-0">
                        {{ pat.fullName.charAt(0) }}
                      </div>
                      <div>
                        <p class="font-bold text-text-main">{{ pat.fullName }}</p>
                        @if (!pat.isActive) {
                          <span class="text-[10px] text-rose-600 font-semibold">(ملف مؤرشف)</span>
                        }
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 font-mono text-text-muted" dir="ltr">
                    {{ pat.phoneNumber }}
                  </td>
                  <td class="py-3.5 px-4 text-text-main font-semibold">
                    {{ pat.age ? pat.age + ' سنة' : 'غير محدد' }}
                  </td>
                  <td class="py-3.5 px-4">
                    @if (pat.isFollowUp) {
                      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        متابعة دورية
                      </span>
                    } @else {
                      <span class="text-xs text-text-muted">مريض عادي</span>
                    }
                  </td>
                  <td class="py-3.5 px-4">
                    @if (pat.hasUsedSpecialPrice) {
                      <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        سبق الاستفادة
                      </span>
                    } @else {
                      <span class="text-[11px] text-text-muted">لم يستفد</span>
                    }
                  </td>
                  <td class="py-3.5 px-4 text-text-muted text-xs">
                    {{ pat.createdAtUtc | date:'yyyy/MM/dd' }}
                  </td>
                  <td class="py-3.5 px-4 text-left">
                    @if (pat.isActive) {
                      <button
                        type="button"
                        (click)="promptArchive(pat)"
                        class="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        أرشفة الملف
                      </button>
                    } @else {
                      <button
                        type="button"
                        (click)="restorePatient(pat)"
                        class="px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        استعادة الملف
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }

    <!-- Archive Confirmation Dialog -->
    <app-confirm-dialog
      [isOpen]="isArchiveDialogOpen()"
      title="أرشفة ملف المريض"
      message="هل أنت متأكد من أرشفة هذا الملف؟ لن يتم حذفه من قاعدة البيانات وسيمكن استعادته في أي وقت."
      confirmLabel="أرشفة"
      [isDestructive]="true"
      (confirm)="confirmArchive()"
      (cancel)="isArchiveDialogOpen.set(false)"
    ></app-confirm-dialog>
  `
})
export class AdminPatientsListComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  isLoading = signal<boolean>(true);
  patients = signal<PatientDto[]>([]);
  totalCount = signal<number>(0);
  searchQuery = signal<string>('');
  includeArchived = signal<boolean>(false);

  isArchiveDialogOpen = signal<boolean>(false);
  selectedPatient = signal<PatientDto | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.api.getPatients({
      search: this.searchQuery() || undefined,
      includeArchived: this.includeArchived(),
      pageNumber: 1,
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

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.loadData();
  }

  toggleIncludeArchived(): void {
    this.includeArchived.update(v => !v);
    this.loadData();
  }

  promptArchive(pat: PatientDto): void {
    this.selectedPatient.set(pat);
    this.isArchiveDialogOpen.set(true);
  }

  confirmArchive(): void {
    const pat = this.selectedPatient();
    if (!pat) return;

    this.api.archivePatient(pat.patientId).subscribe({
      next: () => {
        this.toast.success('تمت أرشفة ملف المريض بنجاح');
        this.isArchiveDialogOpen.set(false);
        this.loadData();
      }
    });
  }

  restorePatient(pat: PatientDto): void {
    this.api.restorePatient(pat.patientId).subscribe({
      next: () => {
        this.toast.success('تمت استعادة ملف المريض بنجاح');
        this.loadData();
      }
    });
  }
}
