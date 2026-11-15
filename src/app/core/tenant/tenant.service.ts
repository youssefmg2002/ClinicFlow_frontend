import { Injectable, signal, computed } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private readonly _clinicSlug = signal<string>(environment.defaultClinicSlug);
  private readonly _clinicName = signal<string>('عيادة النور التخصصية');
  private readonly _hasLogo = signal<boolean>(true);
  private readonly _logoUrl = signal<string | null>('/assets/brand/clinicflow-logo.png');

  readonly clinicSlug = this._clinicSlug.asReadonly();
  readonly clinicName = this._clinicName.asReadonly();
  readonly hasLogo = this._hasLogo.asReadonly();
  readonly logoUrl = this._logoUrl.asReadonly();

  readonly apiPrefix = computed(() => `/api/${this._clinicSlug()}`);

  setClinicSlug(slug: string): void {
    if (slug && slug !== this._clinicSlug()) {
      this._clinicSlug.set(slug);
    }
  }

  setClinicDetails(name: string, hasLogo: boolean, logoUrl: string | null = null): void {
    this._clinicName.set(name);
    this._hasLogo.set(hasLogo);
    this._logoUrl.set(logoUrl);
  }
}

