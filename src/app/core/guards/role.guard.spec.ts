import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { roleGuard } from './role.guard';
import { AuthService } from '../auth/auth.service';
import { TenantService } from '../tenant/tenant.service';
import { UserRole } from '../../shared/models';

describe('roleGuard', () => {
  let routerMock: { createUrlTree: ReturnType<typeof vi.fn> };
  let tenantService: TenantService;

  beforeEach(() => {
    routerMock = {
      createUrlTree: vi.fn((commands) => ({ toString: () => commands.join('/') }) as unknown as UrlTree)
    };

    const authServiceMock = {
      isAuthenticated: signal<boolean>(true),
      role: signal<UserRole | null>('Doctor'),
      getRoleHomeUrl: vi.fn().mockReturnValue('/alnoor/doctor/dashboard')
    };

    TestBed.configureTestingModule({
      providers: [
        TenantService,
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    tenantService = TestBed.inject(TenantService);
    tenantService.setClinicSlug('alnoor');
  });

  it('should allow access when user role matches expected role', () => {
    const routeSnapshot = {
      paramMap: { get: () => 'alnoor' },
      data: { roles: ['Doctor'] }
    } as unknown as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() => roleGuard(routeSnapshot, null as never));
    expect(result).toBe(true);
  });

  it('should redirect when user role does not match expected role', () => {
    const routeSnapshot = {
      paramMap: { get: () => 'alnoor' },
      data: { roles: ['Admin'] }
    } as unknown as ActivatedRouteSnapshot;

    TestBed.runInInjectionContext(() => roleGuard(routeSnapshot, null as never));
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/alnoor/doctor/dashboard']);
  });
});
