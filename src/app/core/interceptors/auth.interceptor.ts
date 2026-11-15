import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { SuperAdminAuthService } from '../auth/super-admin-auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Public endpoints do not require auth header
  if (
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/clinic/public-info') ||
    req.url.includes('/api/public/')
  ) {
    return next(req);
  }

  // Super Admin API requests
  if (req.url.includes('/api/super-admin/')) {
    const superAdminAuth = inject(SuperAdminAuthService);
    const saToken = superAdminAuth.accessToken();
    if (saToken) {
      return next(req.clone({
        setHeaders: {
          Authorization: `Bearer ${saToken}`
        }
      }));
    }
    return next(req);
  }

  // Clinic user requests
  const authService = inject(AuthService);
  const token = authService.accessToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};

