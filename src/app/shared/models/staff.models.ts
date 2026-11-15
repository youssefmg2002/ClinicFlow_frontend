import { AppointmentStatus, AppointmentType } from './api.models';

export interface DoctorSpecialtyItemDto {
  specialtyId: string;
  specialtyName: string;
  isPrimary: boolean;
  specialtyIsActive: boolean;
}

export interface DoctorDto {
  doctorId: string;
  userId: string;
  userName: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  isActive: boolean;
  maxConsultationsPerCycle: number | null;
  newExamPrice: number | null;
  consultationPrice: number | null;
  specialties: DoctorSpecialtyItemDto[];
}

export interface CreateDoctorRequest {
  fullName: string;
  userName: string;
  password: string;
  phoneNumber: string;
  email?: string | null;
  specialtyIds: string[];
  primarySpecialtyId: string;
  maxConsultationsPerCycle?: number | null;
  newExamPrice?: number;
  consultationPrice?: number;
}

export interface UpdateDoctorRequest {
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  specialtyIds: string[];
  primarySpecialtyId: string;
  maxConsultationsPerCycle?: number | null;
}

export interface AdminResetPasswordRequest {
  newPassword: string;
}

export interface PermittedDoctorSummaryDto {
  doctorId: string;
  doctorName: string;
  doctorIsActive: boolean;
}

export interface SecretaryDto {
  userId: string;
  userName: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  isActive: boolean;
  permittedDoctors: PermittedDoctorSummaryDto[];
}

export interface CreateSecretaryRequest {
  fullName: string;
  userName: string;
  password: string;
  phoneNumber: string;
  email?: string | null;
  allowedDoctorIds?: string[];
}

export interface UpdateSecretaryRequest {
  fullName: string;
  phoneNumber: string;
  email?: string | null;
}

export interface UpdateSecretaryDoctorPermissionsRequest {
  doctorIds: string[];
}

export interface SpecialtyDto {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  linkedDoctorsCount: number;
}

export interface CreateSpecialtyRequest {
  name: string;
  description?: string | null;
}

export interface UpdateSpecialtyRequest {
  name: string;
  description?: string | null;
}

export interface WeeklyShiftDto {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  periodOrder: number;
}

export interface WeeklyShiftInputDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface UpdateDoctorWeeklyScheduleRequest {
  shifts: WeeklyShiftInputDto[];
}

export interface DoctorLeaveDto {
  id: string;
  doctorId: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
  reason: string | null;
  isActive: boolean;
  createdAtUtc: string;
}

export interface CreateDoctorLeaveRequest {
  startDate: string;
  endDate: string;
  reason?: string | null;
}

export interface AffectedAppointmentSummaryDto {
  appointmentId: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  queueNumber: number;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
}
