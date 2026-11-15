import { AppointmentType } from './api.models';

export interface FollowUpMedicationDto {
  id: string;
  medicalVisitId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string | null;
  enteredByUserId: string;
  lastModifiedByUserId: string;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
}

export interface MedicalVisitDto {
  medicalVisitId: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientIsFollowUp: boolean;
  doctorId: string;
  doctorName: string;
  appointmentType: AppointmentType;
  appointmentDate: string;
  consultationNumber: number | null;
  diagnosis: string;
  diagnosisNotes: string | null;
  nextConsultationValidUntilDate: string | null;
  completedAtUtc: string;
  followUpMedications: FollowUpMedicationDto[];
}

export interface AppointmentVisitWorkspaceDto {
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientIsFollowUp: boolean;
  appointmentType: AppointmentType;
  appointmentDate: string;
  queueNumber: number;
  consultationNumber: number | null;
  canSetNextConsultationValidity: boolean;
  remainingConsultationsAfterThisVisit: number;
  isUnlimitedConsultations: boolean;
  autoPrefilledCycleDiagnosis: string | null;
  existingVisit: MedicalVisitDto | null;
}

export interface CompleteMedicalVisitRequest {
  diagnosis?: string | null;
  diagnosisNotes?: string | null;
  nextConsultationValidUntilDate?: string | null;
}

export interface UpdateMedicalVisitRequest {
  diagnosis: string;
  diagnosisNotes?: string | null;
  nextConsultationValidUntilDate?: string | null;
}

export interface FollowUpMedicationInputDto {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string | null;
}

export interface AddFollowUpMedicationsRequest {
  medications: FollowUpMedicationInputDto[];
}

