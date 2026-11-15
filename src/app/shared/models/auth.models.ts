import { UserRole } from './api.models';

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface CurrentUserProfileDto {
  userId: string;
  clinicId: string;
  clinicSlug: string;
  clinicName: string;
  userName: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  role: UserRole;
  doctorId: string | null;
}

export interface AuthTokenResponse {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
  user: CurrentUserProfileDto;
}

export interface UpdateOwnProfileRequest {
  fullName: string;
  phoneNumber: string;
  email: string | null;
}

export interface ChangeOwnPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

