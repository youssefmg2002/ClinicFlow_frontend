import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { AuthService } from './auth.service';
import { TenantService } from '../tenant/tenant.service';

describe('AuthService', () => {
  let service: AuthService;
  let tenantService: TenantService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        TenantService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: {
            navigate: vi.fn()
          }
        }
      ]
    });
    service = TestBed.inject(AuthService);
    tenantService = TestBed.inject(TenantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default tenant slug', () => {
    expect(tenantService.clinicSlug()).toBe('alnoor');
  });

  it('should resolve correct home url for each role', () => {
    expect(service.getRoleHomeUrl('Admin')).toBe('/alnoor/admin/dashboard');
    expect(service.getRoleHomeUrl('Secretary')).toBe('/alnoor/secretary/dashboard');
    expect(service.getRoleHomeUrl('Doctor')).toBe('/alnoor/doctor/dashboard');
  });

  it('should compute role booleans accurately', () => {
    expect(service.isAdmin()).toBe(false);
    expect(service.isDoctor()).toBe(false);
    expect(service.isSecretary()).toBe(false);
    expect(service.isAuthenticated()).toBe(false);
  });
});
