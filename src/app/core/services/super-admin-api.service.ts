import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PlatformDashboardMetricsDto,
  StaffAdminDto,
  PlatformClinicSummaryDto,
  PlatformPlanDto,
  PlatformPromoCodeDto,
  PlatformManualPaymentDto,
  PlatformLandingContentDto,
  PlatformFaqDto,
  PlatformMasterSpecialtyDto,
  PagedResult
} from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/super-admin`;

  getMetrics(): Observable<PlatformDashboardMetricsDto> {
    return this.http.get<PlatformDashboardMetricsDto>(`${this.baseUrl}/dashboard/metrics`);
  }

  // --- Staff Super Admins ---
  getStaff(): Observable<StaffAdminDto[]> {
    return this.http.get<StaffAdminDto[]>(`${this.baseUrl}/staff`);
  }

  createStaff(req: {
    userName: string;
    fullName: string;
    password: string;
    email?: string;
    phoneNumber?: string;
    permissions: string[];
  }): Observable<StaffAdminDto> {
    return this.http.post<StaffAdminDto>(`${this.baseUrl}/staff`, req);
  }

  updateStaff(id: string, req: {
    staffId: string;
    fullName: string;
    email?: string;
    phoneNumber?: string;
    permissions: string[];
    isActive: boolean;
  }): Observable<StaffAdminDto> {
    return this.http.put<StaffAdminDto>(`${this.baseUrl}/staff/${id}`, req);
  }

  // --- Clinics ---
  getClinics(search?: string, status?: string, page = 1, pageSize = 20): Observable<PagedResult<PlatformClinicSummaryDto>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<PagedResult<PlatformClinicSummaryDto>>(`${this.baseUrl}/clinics`, { params });
  }

  updateClinicStatus(clinicId: string, isActive: boolean, reason?: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/clinics/${clinicId}/status`, { clinicId, isActive, reason });
  }

  extendSubscription(clinicId: string, additionalDays: number, reason?: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/clinics/${clinicId}/extend-subscription`, { clinicId, additionalDays, reason });
  }

  changePlan(clinicId: string, newPlanCode: string, billingCycle: 'Monthly' | 'Annual', reason?: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/clinics/${clinicId}/change-plan`, { clinicId, newPlanCode, billingCycle, reason });
  }

  // --- Plans ---
  getPlans(): Observable<PlatformPlanDto[]> {
    return this.http.get<PlatformPlanDto[]>(`${this.baseUrl}/plans`);
  }

  upsertPlan(req: {
    code: string;
    nameAr: string;
    nameEn: string;
    description?: string;
    monthlyPrice: number;
    annualPrice: number;
    featuresJson?: string;
    isPublished: boolean;
    isActive: boolean;
    displayOrder: number;
  }): Observable<PlatformPlanDto> {
    return this.http.post<PlatformPlanDto>(`${this.baseUrl}/plans`, req);
  }

  // --- Promo Codes ---
  getPromoCodes(): Observable<PlatformPromoCodeDto[]> {
    return this.http.get<PlatformPromoCodeDto[]>(`${this.baseUrl}/promo-codes`);
  }

  createPromoCode(req: {
    code: string;
    discountType: 'Percentage' | 'FixedAmount';
    discountValue: number;
    maxDiscountAmount?: number;
    maxTotalUses: number;
    maxUsesPerClinic: number;
    validFrom: string;
    validTo: string;
    allowedPlanCodes?: string;
  }): Observable<PlatformPromoCodeDto> {
    return this.http.post<PlatformPromoCodeDto>(`${this.baseUrl}/promo-codes`, req);
  }

  togglePromoCodeActive(id: string, isActive: boolean): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/promo-codes/${id}/toggle-active`, { isActive });
  }

  // --- Manual Payments ---
  getManualPayments(status?: string): Observable<PlatformManualPaymentDto[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<PlatformManualPaymentDto[]>(`${this.baseUrl}/manual-payments`, { params });
  }

  reviewManualPayment(submissionId: string, approve: boolean, rejectionReason?: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/manual-payments/review`, { submissionId, approve, rejectionReason });
  }

  // --- CMS ---
  getCmsContent(): Observable<PlatformLandingContentDto> {
    return this.http.get<PlatformLandingContentDto>(`${this.baseUrl}/cms`);
  }

  updateCmsContent(req: {
    heroTitle: string;
    heroSubtitle: string;
    heroCtaText: string;
    heroCtaUrl: string;
    whatsAppNumber: string;
    contactEmail: string;
    contactPhone: string;
    seoTitle: string;
    seoDescription: string;
    featureSectionsJson: string;
  }): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/cms`, req);
  }

  upsertFaq(req: {
    id?: string;
    question: string;
    answer: string;
    displayOrder: number;
    isPublished: boolean;
  }): Observable<PlatformFaqDto> {
    return this.http.post<PlatformFaqDto>(`${this.baseUrl}/cms/faqs`, req);
  }

  deleteFaq(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/cms/faqs/${id}`);
  }

  // --- Master Specialties ---
  getMasterSpecialties(): Observable<PlatformMasterSpecialtyDto[]> {
    return this.http.get<PlatformMasterSpecialtyDto[]>(`${this.baseUrl}/master-specialties`);
  }

  upsertMasterSpecialty(req: {
    id?: string;
    code: string;
    nameAr: string;
    descriptionAr: string;
    isActive: boolean;
    displayOrder: number;
  }): Observable<PlatformMasterSpecialtyDto> {
    return this.http.post<PlatformMasterSpecialtyDto>(`${this.baseUrl}/master-specialties`, req);
  }
}

