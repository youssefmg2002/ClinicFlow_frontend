import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { SuperAdminAuthService } from '../auth/super-admin-auth.service';

export const superAdminGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const superAdminAuth = inject(SuperAdminAuthService);
  const router = inject(Router);

  if (!superAdminAuth.isAuthenticated()) {
    router.navigate(['/super-admin/login']);
    return false;
  }

  const requiredPermission = route.data?.['permission'] as string | undefined;
  if (requiredPermission && !superAdminAuth.hasPermission(requiredPermission)) {
    router.navigate(['/super-admin/dashboard']);
    return false;
  }

  return true;
};

