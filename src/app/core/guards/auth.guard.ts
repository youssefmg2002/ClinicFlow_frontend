import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TenantService } from '../tenant/tenant.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const tenantService = inject(TenantService);

  const slug = route.paramMap.get('clinicSlug') || tenantService.clinicSlug();

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree([`/${slug}/login`], {
    queryParams: { returnUrl: state.url }
  });
};

