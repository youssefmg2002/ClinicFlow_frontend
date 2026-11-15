export interface CheckSlugResponse {
  slug: string;
  isAvailable: boolean;
  message: string;
}

export interface CreateRegistrationDraftRequest {
  clinicName: string;
  city: string;
  address?: string;
  clinicSlug: string;
  adminFullName: string;
  adminPhoneNumber: string;
  adminEmail?: string;
  adminUserName: string;
  adminPassword: string;
}

export interface CreateRegistrationDraftResponse {
  draftId: string;
  clinicSlug: string;
  maskedPhone: string;
  otpExpiresInSeconds: number;
  resendCooldownSeconds: number;
}

export interface VerifyOtpRequest {
  draftId: string;
  otpCode: string;
}

export interface VerifyOtpResponse {
  clinicId: string;
  clinicName: string;
  clinicSlug: string;
  adminUserName: string;
  adminFullName: string;
  trialEndDate: string;
  trialDaysRemaining: number;
  accessToken: string;
}

export interface PlatformFaqDto {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
  isPublished: boolean;
}

export interface PlatformLandingContentDto {
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
  faqs: PlatformFaqDto[];
}

export interface PlatformPlanDto {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  price: number;
  monthlyPrice: number;
  annualPrice: number;
  featuresJson?: string;
  currency: string;
  isActive: boolean;
  isPublished: boolean;
  displayOrder: number;
}

export interface PlatformLoginResponse {
  accessToken: string;
  expiresAtUtc: string;
  adminId: string;
  userName: string;
  fullName: string;
  isOwner: boolean;
  permissions: string[];
}

export interface PlatformDashboardMetricsDto {
  totalClinics: number;
  activeClinics: number;
  activeTrialClinics: number;
  expiredClinics: number;
  pendingManualPayments: number;
  totalPaymentsCollected: number;
  totalStaffSuperAdmins: number;
}

export interface StaffAdminDto {
  id: string;
  userName: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  isOwner: boolean;
  permissions: string[];
  isActive: boolean;
  lastLoginAtUtc?: string;
  createdAtUtc: string;
}

export interface PlatformClinicSummaryDto {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAtUtc: string;
  currentPlanCode: string;
  currentPlanNameAr: string;
  subscriptionStatus: 'Trial' | 'Active' | 'Expired' | 'Suspended';
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  daysRemaining: number;
  doctorsCount: number;
  patientsCount: number;
  appointmentsCount: number;
}

export interface PlatformPromoCodeDto {
  id: string;
  code: string;
  discountType: 'Percentage' | 'FixedAmount';
  discountValue: number;
  maxDiscountAmount?: number;
  maxTotalUses: number;
  currentUses: number;
  maxUsesPerClinic: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  allowedPlanCodes?: string;
}

export interface PlatformManualPaymentDto {
  id: string;
  clinicId: string;
  clinicName: string;
  clinicSlug: string;
  planCode: string;
  planNameAr: string;
  billingCycle: 'Monthly' | 'Annual';
  amountPaid: number;
  currency: string;
  paymentMethod: 'InstaPay' | 'BankTransfer' | 'EWallet';
  referenceNumber: string;
  proofDocumentPath: string;
  status: 'PendingReview' | 'Approved' | 'Rejected';
  promoCodeDiscount: number;
  rejectionReason?: string;
  reviewerAdminName?: string;
  reviewedAtUtc?: string;
  createdAtUtc: string;
}

export interface PlatformMasterSpecialtyDto {
  id: string;
  code: string;
  nameAr: string;
  descriptionAr: string;
  isActive: boolean;
  displayOrder: number;
}

export interface ManualPaymentInstructionDto {
  methodName: string;
  method: 'InstaPay' | 'BankTransfer' | 'EWallet';
  instructions: string;
  accountDetails: string;
}

export interface PromoCodeValidationResultDto {
  isValid: boolean;
  message: string;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  promoCodeId?: string;
}

