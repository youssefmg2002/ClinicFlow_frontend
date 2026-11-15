import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuperAdminApiService } from '../../core/services/super-admin-api.service';
import { StaffAdminDto } from '../../shared/models';

@Component({
  selector: 'app-super-admin-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 lg:p-8 space-y-6 font-sans max-w-7xl mx-auto" dir="rtl">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">فريق الإدارة المركزية والصلاحيات (Staff Admins)</h1>
          <p class="text-sm text-slate-500 mt-1">
            إضافة مشرفين مساعدين للمنصة ومنحهم صلاحيات مخصصة (العيادات، الاشتراكات، المدفوعات، المحتوى)
          </p>
        </div>

        <button
          type="button"
          (click)="showCreateModal.set(true)"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
          </svg>
          <span>إضافة مشرف منصة جديد</span>
        </button>
      </div>

      <!-- Feedback Banner -->
      @if (feedbackMessage()) {
        <div class="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm flex items-center justify-between">
          <span>{{ feedbackMessage() }}</span>
          <button (click)="feedbackMessage.set('')" class="text-blue-500 hover:text-blue-700 text-xs font-bold">إغلاق</button>
        </div>
      }

      <!-- Staff Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        @if (isLoading()) {
          <div class="p-12 text-center text-slate-400">جاري تحميل مشرفي المنصة...</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-right text-sm">
              <thead class="bg-slate-50 text-slate-500 text-xs font-semibold uppercase">
                <tr>
                  <th class="px-6 py-3.5">المشرف</th>
                  <th class="px-6 py-3.5">اسم الدخول (Username)</th>
                  <th class="px-6 py-3.5">الدور</th>
                  <th class="px-6 py-3.5">الصلاحيات الممنوحة</th>
                  <th class="px-6 py-3.5">آخر تسجيل دخول</th>
                  <th class="px-6 py-3.5">الحالة</th>
                  <th class="px-6 py-3.5 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                @for (admin of staffMembers(); track admin.id) {
                  <tr class="hover:bg-slate-50/60 transition-colors">
                    <td class="px-6 py-4">
                      <div class="font-bold text-slate-900">{{ admin.fullName }}</div>
                      <div class="text-xs text-slate-400">{{ admin.email || 'لا يوجد بريد' }}</div>
                    </td>
                    <td class="px-6 py-4 font-mono text-xs dir-ltr text-right">
                      {{ admin.userName }}
                    </td>
                    <td class="px-6 py-4">
                      <span class="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold"
                        [class]="admin.isOwner ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-700'">
                        {{ admin.isOwner ? 'مالك المنصة (Owner)' : 'مشرف مساعد (Staff)' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-xs">
                      @if (admin.isOwner) {
                        <span class="text-indigo-600 font-bold">صلاحيات كاملة غير مقيدة (*)</span>
                      } @else {
                        <div class="flex flex-wrap gap-1 max-w-xs">
                          @for (p of admin.permissions; track p) {
                            <span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-mono">
                              {{ p }}
                            </span>
                          }
                        </div>
                      }
                    </td>
                    <td class="px-6 py-4 text-xs text-slate-500 font-mono">
                      {{ admin.lastLoginAtUtc ? (admin.lastLoginAtUtc | date:'yyyy/MM/dd HH:mm') : 'لم يدخل بعد' }}
                    </td>
                    <td class="px-6 py-4">
                      @if (admin.isActive) {
                        <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          نشط
                        </span>
                      } @else {
                        <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
                          معطل
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4 text-center">
                      @if (!admin.isOwner) {
                        <button
                          type="button"
                          (click)="toggleActive(admin)"
                          class="px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
                          [class]="admin.isActive ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'"
                        >
                          {{ admin.isActive ? 'تعطيل' : 'تفعيل' }}
                        </button>
                      } @else {
                        <span class="text-xs text-slate-300">-</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Create Staff Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 class="text-lg font-bold text-slate-900">إضافة مشرف منصة جديد</h3>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  [(ngModel)]="newStaff.fullName"
                  class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm"
                  placeholder="محمد أحمد"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">اسم المستخدم (Username)</label>
                <input
                  type="text"
                  [(ngModel)]="newStaff.userName"
                  class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm dir-ltr text-right font-mono"
                  placeholder="mohamed.admin"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  [(ngModel)]="newStaff.email"
                  class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm dir-ltr text-right"
                  placeholder="mohamed@clinicflow.com"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">كلمة المرور المبدئية</label>
                <input
                  type="password"
                  [(ngModel)]="newStaff.password"
                  class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm dir-ltr text-right"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-2">الصلاحيات الممنوحة للمشرف</label>
                <div class="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" (change)="togglePerm('Clinics.Manage')" [checked]="hasSelectedPerm('Clinics.Manage')" class="rounded text-blue-600"/>
                    <span>إدارة العيادات والاشتراكات (Clinics.Manage)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" (change)="togglePerm('Plans.Manage')" [checked]="hasSelectedPerm('Plans.Manage')" class="rounded text-blue-600"/>
                    <span>إدارة الباقات والكوبونات (Plans.Manage)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" (change)="togglePerm('Payments.Review')" [checked]="hasSelectedPerm('Payments.Review')" class="rounded text-blue-600"/>
                    <span>مراجعة واعتماد التحويلات المالية (Payments.Review)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" (change)="togglePerm('Cms.Manage')" [checked]="hasSelectedPerm('Cms.Manage')" class="rounded text-blue-600"/>
                    <span>إدارة محتوى الموقع والأسئلة الشائعة (Cms.Manage)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" (change)="togglePerm('Specialties.Manage')" [checked]="hasSelectedPerm('Specialties.Manage')" class="rounded text-blue-600"/>
                    <span>إدارة التخصصات المرجعية (Specialties.Manage)</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-3">
              <button
                type="button"
                (click)="showCreateModal.set(false)"
                class="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 font-semibold"
              >
                إلغاء
              </button>
              <button
                type="button"
                (click)="saveStaff()"
                class="px-5 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
              >
                إضافة المشرف
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class SuperAdminStaffComponent implements OnInit {
  private readonly superAdminApi = inject(SuperAdminApiService);

  readonly staffMembers = signal<StaffAdminDto[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly feedbackMessage = signal<string>('');
  readonly showCreateModal = signal<boolean>(false);

  newStaff = {
    userName: '',
    email: '',
    fullName: '',
    password: '',
    permissions: ['Clinics.Manage', 'Payments.Review']
  };

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {
    this.isLoading.set(true);
    this.superAdminApi.getStaff().subscribe({
      next: (data) => {
        this.staffMembers.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  hasSelectedPerm(perm: string): boolean {
    return this.newStaff.permissions.includes(perm);
  }

  togglePerm(perm: string): void {
    if (this.newStaff.permissions.includes(perm)) {
      this.newStaff.permissions = this.newStaff.permissions.filter((p: string) => p !== perm);
    } else {
      this.newStaff.permissions.push(perm);
    }
  }

  saveStaff(): void {
    if (!this.newStaff.userName.trim() || !this.newStaff.fullName.trim() || !this.newStaff.password) {
      alert('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    this.superAdminApi.createStaff(this.newStaff).subscribe({
      next: () => {
        this.feedbackMessage.set(`تمت إضافة مشرف المنصة "${this.newStaff.fullName}" بنجاح.`);
        this.showCreateModal.set(false);
        this.loadStaff();
      },
      error: (err: any) => {
        this.feedbackMessage.set(err.error?.message || 'فشل إضافة المشرف.');
      }
    });
  }

  toggleActive(admin: StaffAdminDto): void {
    const newStatus = !admin.isActive;
    this.superAdminApi.updateStaff(admin.id, {
      staffId: admin.id,
      fullName: admin.fullName,
      email: admin.email,
      permissions: admin.permissions,
      isActive: newStatus
    }).subscribe({
      next: () => {
        this.feedbackMessage.set('تم تحديث حالة حساب المشرف بنجاح.');
        this.loadStaff();
      },
      error: (err: any) => {
        this.feedbackMessage.set(err.error?.message || 'فشل تحديث حالة المشرف.');
      }
    });
  }
}
