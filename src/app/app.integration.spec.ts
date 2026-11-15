import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { TenantService } from './core/tenant/tenant.service';

describe('ClinicFlow Architectural & Navigation Integration Specs', () => {
  let router: Router;
  let authService: AuthService;
  let tenantService: TenantService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideLocationMocks(),
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        TenantService
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    tenantService = TestBed.inject(TenantService);
  });

  it('1. Root url should load SaaS landing page and tenant route resolves properly', async () => {
    await router.navigateByUrl('/');
    expect(router.url).toBe('/');

    await router.navigateByUrl('/alnoor/login');
    expect(router.url).toBe('/alnoor/login');
    expect(tenantService.clinicSlug()).toBe('alnoor');
  });

  it('2. Tenant resolution should update clinic slug dynamically', async () => {
    await router.navigateByUrl('/alshifa/login');
    expect(router.url).toBe('/alshifa/login');
    expect(tenantService.clinicSlug()).toBe('alshifa');
  });

  it('3. Unauthenticated access to admin dashboard should redirect to login', async () => {
    await router.navigateByUrl('/alnoor/admin/dashboard');
    expect(router.url).toContain('/alnoor/login');
  });

  it('4. Unauthenticated access to doctor dashboard should redirect to login', async () => {
    await router.navigateByUrl('/alnoor/doctor/dashboard');
    expect(router.url).toContain('/alnoor/login');
  });

  it('5. Unauthenticated access to secretary dashboard should redirect to login', async () => {
    await router.navigateByUrl('/alnoor/secretary/dashboard');
    expect(router.url).toContain('/alnoor/login');
  });

  it('6. Error routes (404, 403, 500) are mapped and accessible', async () => {
    await router.navigateByUrl('/not-found');
    expect(router.url).toBe('/not-found');

    await router.navigateByUrl('/forbidden');
    expect(router.url).toBe('/forbidden');

    await router.navigateByUrl('/server-error');
    expect(router.url).toBe('/server-error');
  });
});

