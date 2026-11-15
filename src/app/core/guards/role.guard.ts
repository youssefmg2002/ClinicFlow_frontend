import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TenantService } from '../tenant/tenant.service';
import { UserRole } from '../../shared/models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const tenantService = inject(TenantService);

  const slug = route.paramMap.get('clinicSlug') || tenantService.clinicSlug();
  const expectedRoles = route.data['roles'] as UserRole[] | undefined;

  if (!authService.isAuthenticated()) {
    return router.createUrlTree([`/${slug}/login`]);
  }

  const currentRole = authService.role();

  if (expectedRoles && currentRole && expectedRoles.includes(currentRole)) {
    return true;
  }

  // Not authorized for this role: redirect to user's home dashboard
  const userHome = authService.getRoleHomeUrl(currentRole);
  return router.createUrlTree([userHome]);
};

