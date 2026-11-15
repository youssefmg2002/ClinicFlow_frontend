export type UserRole = 'Admin' | 'Doctor' | 'Secretary';

export type AppointmentType = 'NewExam' | 'Consultation';

export type AppointmentStatus =
  | 'Confirmed'
  | 'Late'
  | 'Arrived'
  | 'Completed'
  | 'Cancelled'
  | 'NotSeen';

export type PaidStatus = 'Unpaid' | 'Paid';

export type HealthInfoCategory =
  | 'ChronicDisease'
  | 'FoodAllergy'
  | 'DrugAllergy'
  | 'ActiveIngredientAllergy'
  | 'GeneralMedicalNote'
  | 'OtherContinuousCondition';

export type HealthInfoSource =
  | 'ConfirmedByPatient'
  | 'RecordedByDoctor'
  | 'EnteredDuringRegistration';

export type HealthInfoVerificationStatus =
  | 'Confirmed'
  | 'Unconfirmed'
  | 'NeedsReview';

export type SubscriptionStatus = 'Trial' | 'Active' | 'Expired' | 'Suspended';

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export interface ApiErrorResponse {
  errorCode: string;
  message: string;
  correlationId: string;
  validationErrors?: Record<string, string[]>;
  details?: unknown;
}

