export interface ClinicPublicInfoDto {
  clinicName: string;
  logoUrl: string | null;
  hasLogo: boolean;
}

export interface ClinicSettingsDto {
  clinicName: string;
  address: string;
  phoneNumber: string;
  whatsAppNumber: string | null;
  email: string | null;
  timeZone: string;
  isRtl: boolean;
  hasLogo: boolean;
}

export interface UpdateClinicSettingsRequest {
  clinicName: string;
  address: string;
  phoneNumber: string;
  whatsAppNumber: string | null;
  email: string | null;
}

