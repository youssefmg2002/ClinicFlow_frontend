import { AppointmentType } from './api.models';

export interface DoctorPricingDto {
  doctorId: string;
  doctorName: string;
  newExamPrice: number;
  consultationPrice: number;
  updatedAtUtc?: string | null;
}

export interface UpsertDoctorPricingRequest {
  newExamPrice: number;
  consultationPrice: number;
}

export interface DoctorSpecialPricingItemDto {
  id: string;
  doctorId: string;
  doctorName: string;
  appointmentType: AppointmentType;
  basePrice: number;
  specialPrice: number;
  discountAmount: number;
  conditionsNotes: string | null;
  isActive: boolean;
}

export interface ClinicSpecialPricingSettingsDto {
  isSpecialPricingEnabled: boolean;
  announcedRulesDescription: string | null;
  doctorSpecialPrices: DoctorSpecialPricingItemDto[];
}

export interface UpdateClinicSpecialPricingToggleRequest {
  isSpecialPricingEnabled: boolean;
  announcedRulesDescription?: string | null;
}

export interface UpsertDoctorSpecialPricingRequest {
  appointmentType: AppointmentType;
  specialPrice: number;
  conditionsNotes?: string | null;
  isActive?: boolean;
}

export interface PricingPreviewDto {
  doctorId: string;
  appointmentType: AppointmentType;
  basePrice: number;
  isSpecialPricingAvailable: boolean;
  specialPrice: number | null;
  discountAmount: number | null;
  announcedRulesDescription: string | null;
  doctorConditionsNotes: string | null;
}

export interface RecordPaymentRequest {
  amount: number;
}

export interface CorrectPaymentRequest {
  correctionReason: string;
}

export interface SpecialPricingReportItemDto {
  usageId: string;
  appointmentId: string;
  queueNumber: number;
  appointmentDate: string;
  patientId: string;
  patientName: string;
  secretaryUserId: string;
  secretaryName: string;
  doctorId: string;
  doctorName: string;
  appointmentType: AppointmentType;
  basePrice: number;
  specialPrice: number;
  discountAmount: number;
  appliedAtUtc: string;
  appliedAtClinicLocal: string;
  specialPriceNotes: string | null;
}

