import {
  AppointmentStatus,
  AppointmentType,
  PaidStatus,
} from './api.models';

export interface AppointmentDto {
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientIsFollowUp: boolean;
  doctorId: string;
  doctorName: string;
  appointmentType: AppointmentType;
  appointmentDate: string; // "YYYY-MM-DD"
  queueNumber: number;
  status: AppointmentStatus;
  basePriceSnapshot: number;
  priceSnapshot: number;
  isSpecialPriceApplied: boolean;
  specialPriceSnapshot: number | null;
  discountAmountSnapshot: number;
  specialPriceNotes: string | null;
  paidStatus: PaidStatus;
  originalExamAppointmentId: string | null;
  consultationNumber: number | null;
  isLateConsultationException: boolean;
  lateConsultationDelayDays: number | null;
  rescheduledFromAppointmentId: string | null;
  rescheduledToAppointmentId: string | null;
  cancellationReason: string | null;
  notSeenReason: string | null;
  createdByUserId: string;
  createdByName: string;
  lastModifiedByUserId: string;
  lastModifiedByName: string;
  createdAtUtc: string;
  completedAtUtc: string | null;
}

export interface QueueHistoryItemDto {
  id: string;
  previousQueueNumber: number;
  newQueueNumber: number;
  reason: string;
  changedByUserId: string;
  changedAtUtc: string;
}

export interface ConsultationLastVisitSummaryDto {
  visitAppointmentId: string;
  visitType: AppointmentType;
  visitDate: string;
  completedAtUtc: string;
  nextConsultationValidUntilDate: string | null;
}

export interface ConsultationEligibilityResultDto {
  isEligible: boolean;
  requiresLateExceptionConfirmation: boolean;
  mustBookAsNewExam: boolean;
  statusCode: string;
  message: string;
  originalExamAppointmentId: string | null;
  nextConsultationNumber: number | null;
  completedConsultationsInCycle: number;
  maxConsultationsPerCycle: number | null;
  validUntilDate: string | null;
  delayDays: number;
  lastVisit: ConsultationLastVisitSummaryDto | null;
}

export interface CreateAppointmentRequest {
  patientId: string;
  doctorId: string;
  appointmentType: AppointmentType;
  appointmentDate: string; // "YYYY-MM-DD"
  applySpecialPrice?: boolean;
  specialPriceNotes?: string | null;
  allowLateConsultationException?: boolean;
  lateExceptionNotes?: string | null;
  explicitOriginalExamAppointmentId?: string | null;
}

export interface AppointmentQueryFilter {
  date?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  doctorId?: string | null;
  patientId?: string | null;
  status?: AppointmentStatus | null;
  paidStatus?: PaidStatus | null;
  appointmentType?: AppointmentType | null;
  search?: string | null;
  pageNumber?: number;
  pageSize?: number;
}

