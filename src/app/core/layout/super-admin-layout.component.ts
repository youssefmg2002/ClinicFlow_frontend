import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SuperAdminAuthService } from '../auth/super-admin-auth.service';

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-slate-100 flex font-sans" dir="rtl">
      <!-- Mobile sidebar backdrop -->
      @if (isMobileMenuOpen()) {
        <div
          class="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          (click)="toggleMobileMenu()"
        ></div>
      }

      <!-- Fixed Sidebar with independent scroll -->
      <aside
        class="fixed inset-y-0 right-0 z-50 w-64 h-screen bg-slate-900 text-slate-300 flex flex-col shrink-0 border-l border-slate-800 shadow-xl transition-transform duration-200 ease-in-out lg:translate-x-0"
        [class.translate-x-full]="!isMobileMenuOpen()"
      >
        <!-- Brand Header -->
        <div class="h-16 shrink-0 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950/40">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div>
              <div class="font-bold text-white text-base tracking-tight leading-none">ClinicFlow</div>
              <div class="text-[10px] text-blue-400 font-semibold tracking-wider uppercase mt-1">Super Admin Console</div>
            </div>
          </div>

          <button
            type="button"
            class="lg:hidden text-slate-400 hover:text-white p-1"
            (click)="toggleMobileMenu()"
            aria-label="إغلاق القائمة"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Navigation Menu (Independent Scroll) -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <a
            routerLink="/super-admin/dashboard"
            routerLinkActive="bg-blue-600 text-white font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span>لوحة المؤشرات العامة</span>
          </a>

          <a
            routerLink="/super-admin/clinics"
            routerLinkActive="bg-blue-600 text-white font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <span>إدارة العيادات</span>
          </a>

          <a
            routerLink="/super-admin/plans"
            routerLinkActive="bg-blue-600 text-white font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            <span>باقات الاشتراك والأسعار</span>
          </a>

          <a
            routerLink="/super-admin/promo-codes"
            routerLinkActive="bg-blue-600 text-white font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>كوبونات الخصم والعروض</span>
          </a>

          <a
            routerLink="/super-admin/payments"
            routerLinkActive="bg-blue-600 text-white font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>مراجعة التحويلات المالية</span>
          </a>

          <a
            routerLink="/super-admin/specialties"
            routerLinkActive="bg-blue-600 text-white font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
            </svg>
            <span>التخصصات الطبية المرجعية (25)</span>
          </a>

          <a
            routerLink="/super-admin/cms"
            routerLinkActive="bg-blue-600 text-white font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            <span>محتوى الموقع والصفحة الرئيسية</span>
          </a>

          @if (isOwner() || hasPermission('manage_staff')) {
            <a
              routerLink="/super-admin/staff"
              routerLinkActive="bg-blue-600 text-white font-semibold"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-slate-800 text-slate-300 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              <span>مشرفو المنصة والصلاحيات</span>
            </a>
          }
        </nav>

        <!-- Current User Section & Logout -->
        <div class="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div class="flex items-center gap-2.5 truncate">
            <div class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
              {{ (currentUser()?.fullName || 'SA').slice(0, 2) }}
            </div>
            <div class="truncate text-xs">
              <div class="font-semibold text-white truncate">{{ currentUser()?.fullName }}</div>
              <div class="text-slate-400 text-[10px]">
                {{ isOwner() ? 'مالك المنصة' : 'مشرف منصة' }}
              </div>
            </div>
          </div>

          <button
            type="button"
            (click)="logout()"
            title="تسجيل الخروج"
            class="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 lg:pr-64">
        <!-- Mobile Topbar -->
        <header class="lg:hidden h-14 bg-slate-900 text-white px-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <button
            type="button"
            (click)="toggleMobileMenu()"
            class="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="فتح القائمة الجانبية"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <span class="font-bold text-sm">ClinicFlow Super Admin</span>
        </header>

        <main class="flex-1">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class SuperAdminLayoutComponent {
  private readonly superAdminAuth = inject(SuperAdminAuthService);

  readonly currentUser = this.superAdminAuth.adminUser;
  readonly isOwner = this.superAdminAuth.isOwner;
  readonly isMobileMenuOpen = signal<boolean>(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  hasPermission(perm: string): boolean {
    return this.superAdminAuth.hasPermission(perm);
  }

  logout(): void {
    this.superAdminAuth.logout();
  }
}
