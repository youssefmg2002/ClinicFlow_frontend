import { Injectable, inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlatformLoginResponse } from '../../shared/models';

interface StoredSuperAdminSession {
  accessToken: string;
  adminId: string;
  userName: string;
  fullName: string;
  isOwner: boolean;
  permissions: string[];
}

const SUPER_ADMIN_STORAGE_KEY = 'clinicflow_superadmin_session';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminAuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/super-admin`;

  private readonly _adminUser = signal<StoredSuperAdminSession | null>(null);
  private readonly _accessToken = signal<string | null>(null);
  private readonly _isLoading = signal<boolean>(false);

  readonly adminUser = this._adminUser.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  readonly isAuthenticated = computed(() => !!this._accessToken() && !!this._adminUser());
  readonly isOwner = computed(() => this._adminUser()?.isOwner ?? false);
  readonly permissions = computed(() => this._adminUser()?.permissions ?? []);

  constructor() {
    this.restoreSession();
  }

  hasPermission(permission: string): boolean {
    if (this.isOwner()) return true;
    return this.permissions().includes(permission);
  }

  login(userName: string, password: string): Observable<PlatformLoginResponse> {
    this._isLoading.set(true);
    return this.http.post<PlatformLoginResponse>(`${this.baseUrl}/auth/login`, { userName, password }).pipe(
      tap(res => {
        const session: StoredSuperAdminSession = {
          accessToken: res.accessToken,
          adminId: res.adminId,
          userName: res.userName,
          fullName: res.fullName,
          isOwner: res.isOwner,
          permissions: res.permissions
        };
        this.saveSession(session);
        this._isLoading.set(false);
      }),
      catchError(err => {
        this._isLoading.set(false);
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        sessionStorage.removeItem(SUPER_ADMIN_STORAGE_KEY);
      } catch {}
    }
    this._adminUser.set(null);
    this._accessToken.set(null);
    this.router.navigate(['/super-admin/login']);
  }

  private saveSession(session: StoredSuperAdminSession): void {
    this._adminUser.set(session);
    this._accessToken.set(session.accessToken);
    if (isPlatformBrowser(this.platformId)) {
      try {
        sessionStorage.setItem(SUPER_ADMIN_STORAGE_KEY, JSON.stringify(session));
      } catch {}
    }
  }

  private restoreSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const stored = sessionStorage.getItem(SUPER_ADMIN_STORAGE_KEY);
        if (stored) {
          const session: StoredSuperAdminSession = JSON.parse(stored);
          if (session?.accessToken) {
            this._accessToken.set(session.accessToken);
            this._adminUser.set(session);
          }
        }
      } catch {}
    }
  }
}

