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
  selector: 'app-admin-layout',
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
              <span class="block text-[10px] text-slate-400 font-medium">لوحة الإدارة</span>
            </div>
          </div>

          <!-- Close mobile menu button -->
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

        <!-- Clinic Pill -->
        <div class="px-4 py-3 border-b border-slate-800/60 bg-slate-900/20">
          <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span class="truncate font-semibold">{{ tenantService.clinicName() }}</span>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          @for (item of navItems; track item.url) {
            <a
              [routerLink]="['/' + tenantService.clinicSlug() + item.url]"
              routerLinkActive="bg-primary text-white shadow-md shadow-primary/25 font-bold"
              [routerLinkActiveOptions]="{ exact: item.url === '/admin/dashboard' }"
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
                م
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-white truncate">{{ authService.currentUser()?.fullName || 'مدير النظام' }}</p>
                <p class="text-[10px] text-slate-400 truncate">إدارة العيادة</p>
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
            <!-- Mobile Menu Toggle -->
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

            <span class="text-xs sm:text-sm font-semibold text-text-muted">نظام ClinicFlow المتكامل</span>
          </div>

          <div class="flex items-center gap-4">
            <!-- Today Date Badge -->
            <div class="hidden sm:flex items-center gap-1.5 text-xs font-medium text-text-muted bg-slate-50 border border-border-main px-3 py-1.5 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>اليوم: {{ todayFormatted }}</span>
            </div>

            <!-- Profile Link -->
            <a
              [routerLink]="['/' + tenantService.clinicSlug() + '/profile']"
              class="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-border-main text-xs font-semibold text-text-main"
            >
              <div class="w-7 h-7 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold">
                م
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
export class AdminLayoutComponent {
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
      label: 'لوحة التحكم',
      url: '/admin/dashboard',
      iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    {
      label: 'الحجوزات',
      url: '/admin/appointments',
      iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    {
      label: 'المرضى',
      url: '/admin/patients',
      iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    },
    {
      label: 'الأطباء',
      url: '/admin/doctors',
      iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    },
    {
      label: 'السكرتارية',
      url: '/admin/secretaries',
      iconPath: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
    },
    {
      label: 'التخصصات',
      url: '/admin/specialties',
      iconPath: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
    },
    {
      label: 'الأسعار',
      url: '/admin/pricing',
      iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      label: 'الأسعار الخاصة',
      url: '/admin/special-pricing',
      iconPath: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
    },
    {
      label: 'مواعيد العمل والإجازات',
      url: '/admin/schedules',
      iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      label: 'التقارير المالية',
      url: '/admin/reports',
      iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
    },
    {
      label: 'إعدادات العيادة',
      url: '/admin/settings',
      iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z'
    },
    {
      label: 'الاشتراك',
      url: '/admin/subscription',
      iconPath: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
    }
  ];

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }
}

