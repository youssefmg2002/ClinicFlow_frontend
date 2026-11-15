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
  selector: 'app-doctor-layout',
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
              <span class="block text-[10px] text-slate-400 font-medium">لوحة الطبيب المعالج</span>
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

        <!-- Doctor Specialty Pill -->
        <div class="px-4 py-3 border-b border-slate-800/60 bg-slate-900/20">
          <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span class="truncate font-semibold">باطنة عامة وقلب</span>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          @for (item of navItems; track item.url) {
            <a
              [routerLink]="['/' + tenantService.clinicSlug() + item.url]"
              routerLinkActive="bg-primary text-white shadow-md shadow-primary/25 font-bold"
              [routerLinkActiveOptions]="{ exact: item.url === '/doctor/dashboard' }"
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

        <!-- Doctor Info & Logout Footer -->
        <div class="p-4 border-t border-slate-800/80 bg-navy-deep/60">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-9 h-9 rounded-full bg-emerald-700 border border-emerald-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                د
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-white truncate">{{ authService.currentUser()?.fullName || 'الطبيب المعالج' }}</p>
                <p class="text-[10px] text-slate-400 truncate">عيادة الباطنة</p>
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

            <span class="text-xs sm:text-sm font-semibold text-text-muted">العيادة السريرية وفحص المرضى</span>
          </div>

          <div class="flex items-center gap-3">
            <div class="hidden sm:flex items-center gap-1.5 text-xs font-medium text-text-muted bg-slate-50 border border-border-main px-3 py-1.5 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ todayFormatted }}</span>
            </div>

            <a
              [routerLink]="['/' + tenantService.clinicSlug() + '/profile']"
              class="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-border-main text-xs font-semibold text-text-main"
            >
              <div class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                د
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
export class DoctorLayoutComponent {
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
      label: 'الرئيسية (لوحة الدكتور)',
      url: '/doctor/dashboard',
      iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    {
      label: 'مواعيدي وحجوزاتي',
      url: '/doctor/appointments',
      iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    {
      label: 'شاشة الكشف والزيارة',
      url: '/doctor/visit',
      iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
    },
    {
      label: 'الملف الصحي العام',
      url: '/doctor/health-profile',
      iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
    },
    {
      label: 'السجل والتاريخ المرضي',
      url: '/doctor/medical-history',
      iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
    }
  ];

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }
}

