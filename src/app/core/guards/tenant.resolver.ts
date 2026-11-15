import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { TenantService } from '../tenant/tenant.service';

export const tenantResolver: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
  const tenantService = inject(TenantService);
  const clinicSlug = route.paramMap.get('clinicSlug');

  if (clinicSlug) {
    tenantService.setClinicSlug(clinicSlug);
    return clinicSlug;
  }

  return tenantService.clinicSlug();
};

