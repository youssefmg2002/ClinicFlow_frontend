import { Injectable, inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthTokenResponse,
  CurrentUserProfileDto,
  LoginRequest,
  UpdateOwnProfileRequest,
  ChangeOwnPasswordRequest,
  UserRole
} from '../../shared/models';
import { TenantService } from '../tenant/tenant.service';

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: CurrentUserProfileDto;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tenantService = inject(TenantService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _currentUser = signal<CurrentUserProfileDto | null>(null);
  private readonly _accessToken = signal<string | null>(null);
  private readonly _refreshToken = signal<string | null>(null);
  private readonly _isLoading = signal<boolean>(false);

  readonly currentUser = this._currentUser.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  readonly isAuthenticated = computed(() => !!this._currentUser() && !!this._accessToken());
  readonly role = computed<UserRole | null>(() => this._currentUser()?.role ?? null);
  readonly isAdmin = computed(() => this.role() === 'Admin');
  readonly isDoctor = computed(() => this.role() === 'Doctor');
  readonly isSecretary = computed(() => this.role() === 'Secretary');
  readonly doctorId = computed(() => this._currentUser()?.doctorId ?? null);

  constructor() {
    this.restoreSessionFromBrowser();
  }

  private restoreSessionFromBrowser(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const stored = sessionStorage.getItem(environment.sessionStorageKey);
        if (stored) {
          const session: StoredSession = JSON.parse(stored);
          if (session?.accessToken && session?.user) {
            this._accessToken.set(session.accessToken);
            this._refreshToken.set(session.refreshToken);
            this._currentUser.set(session.user);
            if (session.user.clinicSlug) {
              this.tenantService.setClinicSlug(session.user.clinicSlug);
            }
          }
        }
      } catch {
        this.clearSession();
      }
    }
  }

  private saveSessionToBrowser(tokenResponse: AuthTokenResponse): void {
    this._accessToken.set(tokenResponse.accessToken);
    this._refreshToken.set(tokenResponse.refreshToken);
    this._currentUser.set(tokenResponse.user);

    if (tokenResponse.user.clinicSlug) {
      this.tenantService.setClinicSlug(tokenResponse.user.clinicSlug);
    }

    if (isPlatformBrowser(this.platformId)) {
      try {
        const session: StoredSession = {
          accessToken: tokenResponse.accessToken,
          refreshToken: tokenResponse.refreshToken,
          user: tokenResponse.user
        };
        sessionStorage.setItem(environment.sessionStorageKey, JSON.stringify(session));
      } catch {
        // Storage might be restricted
      }
    }
  }

  setSession(tokenResponse: AuthTokenResponse): void {
    this.saveSessionToBrowser(tokenResponse);
  }

  clearSession(): void {
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._currentUser.set(null);

    if (isPlatformBrowser(this.platformId)) {
      try {
        sessionStorage.removeItem(environment.sessionStorageKey);
      } catch {
        // Ignored
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthTokenResponse> {
    this._isLoading.set(true);
    const slug = this.tenantService.clinicSlug();
    const url = `${environment.apiBaseUrl}/api/${slug}/auth/login`;

    return this.http.post<AuthTokenResponse>(url, credentials).pipe(
      tap((response) => {
        this._isLoading.set(false);
        this.saveSessionToBrowser(response);
      }),
      catchError((error) => {
        this._isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    const slug = this.tenantService.clinicSlug();
    const rt = this._refreshToken();
    if (rt) {
      const url = `${environment.apiBaseUrl}/api/${slug}/auth/logout`;
      this.http.post(url, { refreshToken: rt }).pipe(
        catchError(() => of(null))
      ).subscribe();
    }
    this.clearSession();
    this.router.navigate([`/${slug}/login`]);
  }

  getCurrentProfile(): Observable<CurrentUserProfileDto> {
    const slug = this.tenantService.clinicSlug();
    const url = `${environment.apiBaseUrl}/api/${slug}/auth/me`;
    return this.http.get<CurrentUserProfileDto>(url).pipe(
      tap((user) => {
        this._currentUser.set(user);
        if (isPlatformBrowser(this.platformId)) {
          try {
            const stored = sessionStorage.getItem(environment.sessionStorageKey);
            if (stored) {
              const session = JSON.parse(stored);
              session.user = user;
              sessionStorage.setItem(environment.sessionStorageKey, JSON.stringify(session));
            }
          } catch {
            // Ignored
          }
        }
      })
    );
  }

  updateProfile(request: UpdateOwnProfileRequest): Observable<CurrentUserProfileDto> {
    const slug = this.tenantService.clinicSlug();
    const url = `${environment.apiBaseUrl}/api/${slug}/auth/me/profile`;
    return this.http.put<CurrentUserProfileDto>(url, request).pipe(
      tap((updated) => {
        this._currentUser.set(updated);
      })
    );
  }

  changePassword(request: ChangeOwnPasswordRequest): Observable<void> {
    const slug = this.tenantService.clinicSlug();
    const url = `${environment.apiBaseUrl}/api/${slug}/auth/me/change-password`;
    return this.http.post<void>(url, request);
  }

  getRoleHomeUrl(role?: UserRole | null): string {
    const r = role ?? this.role();
    const slug = this.tenantService.clinicSlug();
    switch (r) {
      case 'Admin':
        return `/${slug}/admin/dashboard`;
      case 'Secretary':
        return `/${slug}/secretary/dashboard`;
      case 'Doctor':
        return `/${slug}/doctor/dashboard`;
      default:
        return `/${slug}/login`;
    }
  }
}

