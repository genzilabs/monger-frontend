/**
 * Authentication types matching backend DTOs
 */

export interface User {
	id: string;
	email: string;
	phone?: string | null;
	name: string;
	avatar_url?: string | null;
	locale: string;
	base_currency: string;
	pin_enabled: boolean;
	pin_lock_timeout: string;
	created_at: string;
	updated_at: string;
}

export interface AuthResponse {
	user: User;
	access_token: string;
	refresh_token: string;
	expires_at: string;
	pin_required: boolean;
}

export interface OTPCooldownResponse {
	message: string;
	cooldown_seconds: number;
}

export interface MessageResponse {
	message: string;
}

// Request types
export interface SendOTPRequest {
	identifier: string;
}

export interface VerifyOTPRequest {
	identifier: string;
	otp: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	email: string;
	phone?: string;
	password: string;
	name: string;
	locale?: string;
	base_currency?: string;
}

export interface RefreshTokenRequest {
	refresh_token: string;
}

export interface UpdateProfileRequest {
	name?: string;
	avatar_url?: string;
	locale?: string;
	base_currency?: string;
}

// PIN types
export interface PINStatusResponse {
	enabled: boolean;
	lock_timeout: string;
	is_set: boolean;
	is_verified: boolean;
}

export interface SetPINRequest {
	pin: string;
	confirm_pin: string;
}

export interface VerifyPINRequest {
	pin: string;
}

export interface ChangePINRequest {
	current_pin: string;
	new_pin: string;
	confirm_pin: string;
}

export interface UpdatePINSettingsRequest {
	enabled?: boolean;
	lock_timeout?: string;
}
