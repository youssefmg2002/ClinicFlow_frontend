import {
  HealthInfoCategory,
  HealthInfoSource,
  HealthInfoVerificationStatus,
} from './api.models';

export interface PatientDto {
  patientId: string;
  fullName: string;
  phoneNumber: string;
  isFollowUp: boolean;
  followUpCardNumber: string | null;
  age: number | null;
  whatsAppNumber: string | null;
  hasUsedSpecialPrice: boolean;
  isActive: boolean;
  createdAtUtc: string;
}

export interface InitialHealthProfileEntryRequest {
  category: HealthInfoCategory;
  content: string;
  source: HealthInfoSource;
  verificationStatus: HealthInfoVerificationStatus;
}

export interface CreatePatientRequest {
  fullName: string;
  phoneNumber: string;
  isFollowUp?: boolean;
  followUpCardNumber?: string | null;
  age?: number | null;
  whatsAppNumber?: string | null;
  initialHealthProfileItems?: InitialHealthProfileEntryRequest[] | null;
}

export interface UpdatePatientRequest {
  fullName: string;
  phoneNumber: string;
  isFollowUp: boolean;
  followUpCardNumber?: string | null;
  age?: number | null;
  whatsAppNumber?: string | null;
}

export interface HealthProfileItemDto {
  id: string;
  patientId: string;
  category: HealthInfoCategory;
  content: string;
  source: HealthInfoSource;
  verificationStatus: HealthInfoVerificationStatus;
  addedByUserId: string;
  addedByName: string;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
}

export interface UpsertHealthProfileItemRequest {
  category: HealthInfoCategory;
  content: string;
  source: HealthInfoSource;
  verificationStatus: HealthInfoVerificationStatus;
}

