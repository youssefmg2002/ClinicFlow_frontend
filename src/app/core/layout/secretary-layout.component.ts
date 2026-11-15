import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TenantService } from '../tenant/tenant.service';

interface NavItem {
  label: string;
  url: string;
  iconPath: string;
}

@Component({
  selector: 'app-secretary-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-app-bg flex" dir="rtl">
      <!-- Mobile sidebar backdrop -->
      @if (isMobileMenuOpen()) {
        <div
          class="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          (click)="toggleMobileMenu()"
        ></div>
      }

      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 right-0 z-50 w-64 bg-navy-sidebar text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 border-l border-slate-800 shadow-xl"
        [class.translate-x-full]="!isMobileMenuOpen()"
      >
        <!-- Brand Header -->
        <div class="h-20 px-5 flex items-center justify-between border-b border-slate-800/80 bg-navy-deep/40">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center p-1.5 shadow-md shadow-primary/20 shrink-0">
              <img src="/assets/brand/clinicflow-mark.png" alt="ClinicFlow Mark" class="w-full h-full object-contain" />
            </div>
            <div>
              <span class="text-lg font-black tracking-tight font-sans text-white">Clinic<span class="text-blue-400">Flow</span></span>
              <span class="block text-[10px] text-slate-400 font-medium">لوحة الاستقبال</span>
            </div>
          </div>

          <button
            type="button"
            class="lg:hidden text-slate-400 hover:text-white p-1"
            (click)="toggleMobileMenu()"
            aria-label="إغلاق القائمة"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Quick Booking Action -->
        <div class="p-3.5 border-b border-slate-800/60">
          <a
            [routerLink]="['/' + tenantService.clinicSlug() + '/secretary/booking']"
            (click)="isMobileMenuOpen.set(false)"
            class="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-primary/25 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>إنشاء حجز جديد</span>
          </a>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          @for (item of navItems; track item.url) {
            <a
              [routerLink]="['/' + tenantService.clinicSlug() + item.url]"
              routerLinkActive="bg-primary text-white shadow-md shadow-primary/25 font-bold"
              [routerLinkActiveOptions]="{ exact: item.url === '/secretary/dashboard' }"
              (click)="isMobileMenuOpen.set(false)"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all duration-150 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 opacity-80 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" [attr.d]="item.iconPath" />
              </svg>
              <span class="truncate">{{ item.label }}</span>
            </a>
          }
        </nav>

        <!-- User Info & Logout Footer -->
        <div class="p-4 border-t border-slate-800/80 bg-navy-deep/60">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                س
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-white truncate">{{ authService.currentUser()?.fullName || 'سكرتير الاستقبال' }}</p>
                <p class="text-[10px] text-slate-400 truncate">مكتب الاستقبال</p>
              </div>
            </div>

            <button
              type="button"
              (click)="authService.logout()"
              class="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800/80 transition-colors shrink-0"
              title="تسجيل الخروج"
              aria-label="تسجيل الخروج"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 lg:pr-64">
        <!-- Topbar -->
        <header class="h-16 bg-white border-b border-border-main sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between shadow-xs">
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="toggleMobileMenu()"
              class="lg:hidden p-2 text-text-muted hover:text-text-main rounded-xl hover:bg-slate-100"
              aria-label="فتح القائمة الجانبية"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <span class="text-xs sm:text-sm font-semibold text-text-muted">مكتب الاستقبال وتنظيم الحجوزات</span>
          </div>

          <div class="flex items-center gap-3">
            <div class="hidden sm:flex items-center gap-1.5 text-xs font-medium text-text-muted bg-slate-50 border border-border-main px-3 py-1.5 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ todayFormatted }}</span>
            </div>

            <a
              [routerLink]="['/' + tenantService.clinicSlug() + '/profile']"
              class="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-border-main text-xs font-semibold text-text-main"
            >
              <div class="w-7 h-7 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold">
                س
              </div>
              <span class="hidden md:inline">{{ authService.currentUser()?.fullName }}</span>
            </a>
          </div>
        </header>

        <!-- Page Outlet Container -->
        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class SecretaryLayoutComponent {
  readonly authService = inject(AuthService);
  readonly tenantService = inject(TenantService);

  isMobileMenuOpen = signal<boolean>(false);

  readonly todayFormatted = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  readonly navItems: NavItem[] = [
    {
      label: 'الرئيسية (لوحة الاستقبال)',
      url: '/secretary/dashboard',
      iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    {
      label: 'قائمة الانتظار (الدور)',
      url: '/secretary/queue',
      iconPath: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
    },
    {
      label: 'حجز جديد',
      url: '/secretary/booking',
      iconPath: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      label: 'إدارة المرضى',
      url: '/secretary/patients',
      iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    },
    {
      label: 'تسجيل الدفع قبل الكشف',
      url: '/secretary/payments',
      iconPath: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
    },
    {
      label: 'إدخال علاج المتابعة',
      url: '/secretary/follow-up-treatment',
      iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
    }
  ];

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }
}

