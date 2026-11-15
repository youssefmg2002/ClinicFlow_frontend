import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TenantService } from '../tenant/tenant.service';
import {
  PagedResult,
  ClinicPublicInfoDto,
  ClinicSettingsDto,
  UpdateClinicSettingsRequest,
  DoctorDto,
  CreateDoctorRequest,
  UpdateDoctorRequest,
  AdminResetPasswordRequest,
  SpecialtyDto,
  CreateSpecialtyRequest,
  UpdateSpecialtyRequest,
  WeeklyShiftDto,
  UpdateDoctorWeeklyScheduleRequest,
  DoctorLeaveDto,
  CreateDoctorLeaveRequest,
  SecretaryDto,
  CreateSecretaryRequest,
  UpdateSecretaryRequest,
  UpdateSecretaryDoctorPermissionsRequest,
  PatientDto,
  CreatePatientRequest,
  UpdatePatientRequest,
  HealthProfileItemDto,
  UpsertHealthProfileItemRequest,
  AppointmentDto,
  CreateAppointmentRequest,
  AppointmentQueryFilter,
  ConsultationEligibilityResultDto,
  DoctorPricingDto,
  UpsertDoctorPricingRequest,
  ClinicSpecialPricingSettingsDto,
  UpdateClinicSpecialPricingToggleRequest,
  UpsertDoctorSpecialPricingRequest,
  PricingPreviewDto,
  RecordPaymentRequest,
  CorrectPaymentRequest,
  SpecialPricingReportItemDto,
  AppointmentVisitWorkspaceDto,
  CompleteMedicalVisitRequest,
  UpdateMedicalVisitRequest,
  MedicalVisitDto,
  FollowUpMedicationDto,
  AddFollowUpMedicationsRequest,
  DailyDashboardStatsDto,
  DailyRevenueChartPointDto,
  DoctorDailyPerformanceDto,
  FinancialSummaryDto,
  PeriodFinancialMetricsDto,
  DetailedFinancialReportDto,
  SubscriptionDto,
  ShortcutsSummaryDto
} from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly tenantService = inject(TenantService);

  private get baseUrl(): string {
    const slug = this.tenantService.clinicSlug();
    return `${environment.apiBaseUrl}/api/${slug}`;
  }

  // --- Clinic Settings ---
  getPublicInfo(): Observable<ClinicPublicInfoDto> {
    return this.http.get<ClinicPublicInfoDto>(`${this.baseUrl}/clinic/public-info`);
  }

  getClinicSettings(): Observable<ClinicSettingsDto> {
    return this.http.get<ClinicSettingsDto>(`${this.baseUrl}/clinic/settings`);
  }

  updateClinicSettings(req: UpdateClinicSettingsRequest): Observable<ClinicSettingsDto> {
    return this.http.put<ClinicSettingsDto>(`${this.baseUrl}/clinic/settings`, req);
  }

  // --- Specialties ---
  getSpecialties(includeInactive = false): Observable<SpecialtyDto[]> {
    return this.http.get<SpecialtyDto[]>(`${this.baseUrl}/specialties`, {
      params: { includeInactive }
    });
  }

  createSpecialty(req: CreateSpecialtyRequest): Observable<SpecialtyDto> {
    return this.http.post<SpecialtyDto>(`${this.baseUrl}/specialties`, req);
  }

  updateSpecialty(id: string, req: UpdateSpecialtyRequest): Observable<SpecialtyDto> {
    return this.http.put<SpecialtyDto>(`${this.baseUrl}/specialties/${id}`, req);
  }

  deactivateSpecialty(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/specialties/${id}/deactivate`, {});
  }

  reactivateSpecialty(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/specialties/${id}/activate`, {});
  }

  seedDefaultSpecialties(): Observable<SpecialtyDto[]> {
    return this.http.post<SpecialtyDto[]>(`${this.baseUrl}/specialties/seed`, {});
  }

  // --- Doctors ---
  getDoctors(): Observable<DoctorDto[]> {
    return this.http.get<DoctorDto[]>(`${this.baseUrl}/doctors`);
  }

  getDoctor(id: string): Observable<DoctorDto> {
    return this.http.get<DoctorDto>(`${this.baseUrl}/doctors/${id}`);
  }

  createDoctor(req: CreateDoctorRequest): Observable<DoctorDto> {
    return this.http.post<DoctorDto>(`${this.baseUrl}/doctors`, req);
  }

  updateDoctor(id: string, req: UpdateDoctorRequest): Observable<DoctorDto> {
    return this.http.put<DoctorDto>(`${this.baseUrl}/doctors/${id}`, req);
  }

  deactivateDoctor(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/doctors/${id}/deactivate`, {});
  }

  reactivateDoctor(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/doctors/${id}/reactivate`, {});
  }

  resetDoctorPassword(id: string, req: AdminResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/doctors/${id}/reset-password`, req);
  }

  getDoctorWeeklySchedule(doctorId: string): Observable<WeeklyShiftDto[]> {
    return this.http.get<WeeklyShiftDto[]>(`${this.baseUrl}/doctors/${doctorId}/weekly-schedule`);
  }

  updateDoctorWeeklySchedule(doctorId: string, req: UpdateDoctorWeeklyScheduleRequest): Observable<WeeklyShiftDto[]> {
    return this.http.put<WeeklyShiftDto[]>(`${this.baseUrl}/doctors/${doctorId}/weekly-schedule`, req);
  }

  getDoctorLeaves(doctorId: string): Observable<DoctorLeaveDto[]> {
    return this.http.get<DoctorLeaveDto[]>(`${this.baseUrl}/doctors/${doctorId}/leaves`);
  }

  createDoctorLeave(doctorId: string, req: CreateDoctorLeaveRequest): Observable<DoctorLeaveDto> {
    return this.http.post<DoctorLeaveDto>(`${this.baseUrl}/doctors/${doctorId}/leaves`, req);
  }

  deleteDoctorLeave(doctorId: string, leaveId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/doctors/${doctorId}/leaves/${leaveId}`);
  }

  // --- Secretaries ---
  getSecretaries(): Observable<SecretaryDto[]> {
    return this.http.get<SecretaryDto[]>(`${this.baseUrl}/secretaries`);
  }

  createSecretary(req: CreateSecretaryRequest): Observable<SecretaryDto> {
    return this.http.post<SecretaryDto>(`${this.baseUrl}/secretaries`, req);
  }

  updateSecretary(userId: string, req: UpdateSecretaryRequest): Observable<SecretaryDto> {
    return this.http.put<SecretaryDto>(`${this.baseUrl}/secretaries/${userId}`, req);
  }

  deactivateSecretary(userId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/secretaries/${userId}/deactivate`, {});
  }

  reactivateSecretary(userId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/secretaries/${userId}/reactivate`, {});
  }

  resetSecretaryPassword(userId: string, req: AdminResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/secretaries/${userId}/reset-password`, req);
  }

  updateSecretaryDoctorPermissions(userId: string, req: UpdateSecretaryDoctorPermissionsRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/secretaries/${userId}/doctor-permissions`, req);
  }

  // --- Patients ---
  getPatients(filter?: { search?: string; isFollowUp?: boolean; includeArchived?: boolean; pageNumber?: number; pageSize?: number }): Observable<PagedResult<PatientDto>> {
    let params = new HttpParams();
    if (filter?.search) params = params.set('search', filter.search);
    if (filter?.isFollowUp !== undefined) params = params.set('isFollowUp', filter.isFollowUp);
    if (filter?.includeArchived !== undefined) params = params.set('includeArchived', filter.includeArchived);
    if (filter?.pageNumber) params = params.set('pageNumber', filter.pageNumber);
    if (filter?.pageSize) params = params.set('pageSize', filter.pageSize);

    return this.http.get<PagedResult<PatientDto>>(`${this.baseUrl}/patients`, { params });
  }

  getPatient(id: string): Observable<PatientDto> {
    return this.http.get<PatientDto>(`${this.baseUrl}/patients/${id}`);
  }

  createPatient(req: CreatePatientRequest): Observable<PatientDto> {
    return this.http.post<PatientDto>(`${this.baseUrl}/patients`, req);
  }

  updatePatient(id: string, req: UpdatePatientRequest): Observable<PatientDto> {
    return this.http.put<PatientDto>(`${this.baseUrl}/patients/${id}`, req);
  }

  archivePatient(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/patients/${id}/archive`, {});
  }

  restorePatient(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/patients/${id}/restore`, {});
  }

  getHealthProfile(patientId: string): Observable<HealthProfileItemDto[]> {
    return this.http.get<HealthProfileItemDto[]>(`${this.baseUrl}/patients/${patientId}/health-profile`);
  }

  addHealthProfileItem(patientId: string, req: UpsertHealthProfileItemRequest): Observable<HealthProfileItemDto> {
    return this.http.post<HealthProfileItemDto>(`${this.baseUrl}/patients/${patientId}/health-profile`, req);
  }

  updateHealthProfileItem(patientId: string, itemId: string, req: UpsertHealthProfileItemRequest): Observable<HealthProfileItemDto> {
    return this.http.put<HealthProfileItemDto>(`${this.baseUrl}/patients/${patientId}/health-profile/${itemId}`, req);
  }

  deleteHealthProfileItem(patientId: string, itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/patients/${patientId}/health-profile/${itemId}`);
  }

  // --- Appointments & Queue ---
  getAppointments(filter?: AppointmentQueryFilter): Observable<PagedResult<AppointmentDto>> {
    let params = new HttpParams();
    if (filter?.date) params = params.set('date', filter.date);
    if (filter?.fromDate) params = params.set('fromDate', filter.fromDate);
    if (filter?.toDate) params = params.set('toDate', filter.toDate);
    if (filter?.doctorId) params = params.set('doctorId', filter.doctorId);
    if (filter?.patientId) params = params.set('patientId', filter.patientId);
    if (filter?.status) params = params.set('status', filter.status);
    if (filter?.paidStatus) params = params.set('paidStatus', filter.paidStatus);
    if (filter?.appointmentType) params = params.set('appointmentType', filter.appointmentType);
    if (filter?.search) params = params.set('search', filter.search);
    if (filter?.pageNumber) params = params.set('pageNumber', filter.pageNumber);
    if (filter?.pageSize) params = params.set('pageSize', filter.pageSize);

    return this.http.get<PagedResult<AppointmentDto>>(`${this.baseUrl}/appointments`, { params });
  }

  getDoctorTodayQueue(doctorId: string): Observable<AppointmentDto[]> {
    return this.http.get<AppointmentDto[]>(`${this.baseUrl}/appointments/queue/${doctorId}`);
  }

  getAppointment(id: string): Observable<AppointmentDto> {
    return this.http.get<AppointmentDto>(`${this.baseUrl}/appointments/${id}`);
  }

  createAppointment(req: CreateAppointmentRequest): Observable<AppointmentDto> {
    return this.http.post<AppointmentDto>(`${this.baseUrl}/appointments`, req);
  }

  checkConsultationEligibility(patientId: string, doctorId: string): Observable<ConsultationEligibilityResultDto> {
    return this.http.get<ConsultationEligibilityResultDto>(
      `${this.baseUrl}/appointments/consultations/check-eligibility`,
      { params: { patientId, doctorId } }
    );
  }

  arriveAppointment(id: string): Observable<AppointmentDto> {
    return this.http.post<AppointmentDto>(`${this.baseUrl}/appointments/${id}/arrive`, {});
  }

  markAppointmentLate(id: string): Observable<AppointmentDto> {
    return this.http.post<AppointmentDto>(`${this.baseUrl}/appointments/${id}/late`, {});
  }

  returnToQueue(id: string): Observable<AppointmentDto> {
    return this.http.post<AppointmentDto>(`${this.baseUrl}/appointments/${id}/return-to-queue`, {});
  }

  cancelAppointment(id: string, reason?: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/appointments/${id}/cancel`, { cancellationReason: reason });
  }

  markAppointmentNotSeen(id: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/appointments/${id}/not-seen`, { notSeenReason: reason });
  }

  recordPayment(appointmentId: string, req: RecordPaymentRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/appointments/${appointmentId}/payments`, req);
  }

  correctPayment(appointmentId: string, req: CorrectPaymentRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/appointments/${appointmentId}/payments/correct-unpaid`, req);
  }

  // --- Pricing ---
  getDoctorPricings(): Observable<DoctorPricingDto[]> {
    return this.http.get<DoctorPricingDto[]>(`${this.baseUrl}/pricing/doctors`);
  }

  updateDoctorPricing(doctorId: string, req: UpsertDoctorPricingRequest): Observable<DoctorPricingDto> {
    return this.http.put<DoctorPricingDto>(`${this.baseUrl}/pricing/doctors/${doctorId}`, req);
  }

  getSpecialPricingSettings(): Observable<ClinicSpecialPricingSettingsDto> {
    return this.http.get<ClinicSpecialPricingSettingsDto>(`${this.baseUrl}/pricing/special`);
  }

  updateSpecialPricingToggle(req: UpdateClinicSpecialPricingToggleRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/pricing/special/settings`, req);
  }

  upsertDoctorSpecialPricing(doctorId: string, req: UpsertDoctorSpecialPricingRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/pricing/special/doctors/${doctorId}`, req);
  }

  getPricingPreview(doctorId: string, appointmentType: string): Observable<PricingPreviewDto> {
    return this.http.get<PricingPreviewDto>(`${this.baseUrl}/pricing/preview`, {
      params: { doctorId, appointmentType }
    });
  }

  // --- Clinical Workspace (Doctor) ---
  getVisitWorkspace(appointmentId: string): Observable<AppointmentVisitWorkspaceDto> {
    return this.http.get<AppointmentVisitWorkspaceDto>(
      `${this.baseUrl}/medical-visits/appointment/${appointmentId}/workspace`
    );
  }

  completeMedicalVisit(appointmentId: string, req: CompleteMedicalVisitRequest): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/medical-visits/appointment/${appointmentId}/complete`,
      req
    );
  }

  getPatientHistory(patientId: string): Observable<MedicalVisitDto[]> {
    return this.http.get<MedicalVisitDto[]>(
      `${this.baseUrl}/medical-visits/patient/${patientId}/history`
    );
  }

  getFollowUpMedications(medicalVisitId: string): Observable<FollowUpMedicationDto[]> {
    return this.http.get<FollowUpMedicationDto[]>(
      `${this.baseUrl}/medical-visits/${medicalVisitId}/follow-up-medications`
    );
  }

  addFollowUpMedications(medicalVisitId: string, req: AddFollowUpMedicationsRequest): Observable<FollowUpMedicationDto[]> {
    return this.http.post<FollowUpMedicationDto[]>(
      `${this.baseUrl}/medical-visits/${medicalVisitId}/follow-up-medications`,
      req
    );
  }

  // --- Dashboard & Reports (Admin) ---
  getDailyStats(date?: string): Observable<DailyDashboardStatsDto> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<DailyDashboardStatsDto>(`${this.baseUrl}/dashboard/daily-stats`, { params });
  }

  getRevenueLast7Days(): Observable<DailyRevenueChartPointDto[]> {
    return this.http.get<DailyRevenueChartPointDto[]>(`${this.baseUrl}/dashboard/revenue-last-7-days`);
  }

  getDoctorPerformanceToday(): Observable<DoctorDailyPerformanceDto[]> {
    return this.http.get<DoctorDailyPerformanceDto[]>(`${this.baseUrl}/dashboard/doctors-performance`);
  }

  getFinancialSummary(fromDate?: string, toDate?: string): Observable<FinancialSummaryDto> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get<FinancialSummaryDto>(`${this.baseUrl}/dashboard/financial-summary`, { params });
  }

  getShortcutsSummary(): Observable<ShortcutsSummaryDto> {
    return this.http.get<ShortcutsSummaryDto>(`${this.baseUrl}/dashboard/shortcuts-summary`);
  }

  getDetailedFinancialReport(fromDate: string, toDate: string): Observable<DetailedFinancialReportDto> {
    return this.http.get<DetailedFinancialReportDto>(`${this.baseUrl}/reports/financial`, {
      params: { fromDate, toDate }
    });
  }

  getSpecialPricingReport(fromDate?: string, toDate?: string): Observable<SpecialPricingReportItemDto[]> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get<SpecialPricingReportItemDto[]>(`${this.baseUrl}/reports/special-pricing`, { params });
  }

  getSubscription(): Observable<SubscriptionDto> {
    return this.http.get<SubscriptionDto>(`${this.baseUrl}/subscription`);
  }

  getPaymentInstructions(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/subscription/payment-instructions`);
  }

  validatePromoCode(code: string, originalAmount: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/dashboard/subscription/validate-promo`, {
      code,
      originalAmount
    });
  }

  submitManualPayment(req: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/dashboard/subscription/manual-payment`, req);
  }
}
