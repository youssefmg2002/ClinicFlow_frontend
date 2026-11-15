import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CheckSlugResponse,
  CreateRegistrationDraftRequest,
  CreateRegistrationDraftResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  PlatformLandingContentDto,
  PlatformPlanDto
} from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class PublicService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/public`;

  checkSlugAvailability(slug: string): Observable<CheckSlugResponse> {
    return this.http.get<CheckSlugResponse>(`${this.baseUrl}/clinics/check-slug`, {
      params: { slug }
    });
  }

  createRegistrationDraft(req: CreateRegistrationDraftRequest): Observable<CreateRegistrationDraftResponse> {
    return this.http.post<CreateRegistrationDraftResponse>(`${this.baseUrl}/registration/draft`, req);
  }

  verifyOtp(req: VerifyOtpRequest): Observable<VerifyOtpResponse> {
    return this.http.post<VerifyOtpResponse>(`${this.baseUrl}/registration/verify`, req);
  }

  resendOtp(draftId: string): Observable<CreateRegistrationDraftResponse> {
    return this.http.post<CreateRegistrationDraftResponse>(`${this.baseUrl}/registration/resend-otp`, { draftId });
  }

  getLandingContent(): Observable<PlatformLandingContentDto> {
    return this.http.get<PlatformLandingContentDto>(`${this.baseUrl}/content/landing`);
  }

  getPublishedPlans(): Observable<PlatformPlanDto[]> {
    return this.http.get<PlatformPlanDto[]>(`${this.baseUrl}/plans`);
  }
}
