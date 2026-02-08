/**
 * Auth API service
 */

import { apiClient } from './client';
import type {
	AuthResponse,
	LoginRequest,
	MessageResponse,
	OTPCooldownResponse,
	RegisterRequest,
	UpdateProfileRequest,
	User,
	VerifyOTPRequest,
	PINStatusResponse,
	SetPINRequest,
	VerifyPINRequest,
	ChangePINRequest,
	UpdatePINSettingsRequest
} from '$lib/types';

export const authApi = {
	/**
	 * Send OTP to email or phone
	 */
	sendOTP(identifier: string) {
		return apiClient.post<OTPCooldownResponse>('/auth/otp/send', { identifier });
	},

	/**
	 * Verify OTP and authenticate/register user
	 */
	verifyOTP(data: VerifyOTPRequest) {
		return apiClient.post<AuthResponse>('/auth/otp/verify', data);
	},

	/**
	 * Login with email and password
	 */
	login(data: LoginRequest) {
		return apiClient.post<AuthResponse>('/auth/login', data);
	},

	/**
	 * Register new user
	 */
	register(data: RegisterRequest) {
		return apiClient.post<AuthResponse>('/auth/register', data);
	},

	/**
	 * Refresh access token
	 */
	refreshToken(refreshToken: string) {
		return apiClient.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken });
	},

	/**
	 * Logout current user
	 */
	logout() {
		return apiClient.post<MessageResponse>('/auth/logout', undefined, true);
	},

	/**
	 * Get current user profile
	 */
	getProfile() {
		return apiClient.get<User>('/auth/profile', true);
	},

	/**
	 * Update user profile
	 */
	updateProfile(data: UpdateProfileRequest) {
		return apiClient.patch<User>('/auth/profile', data, true);
	},

	/**
	 * Get PIN status
	 */
	getPINStatus() {
		return apiClient.get<PINStatusResponse>('/auth/pin/status', true);
	},

	/**
	 * Set new PIN
	 */
	setPIN(data: SetPINRequest) {
		return apiClient.post<MessageResponse>('/auth/pin', data, true);
	},

	/**
	 * Verify PIN (for sensitive actions)
	 */
	verifyPIN(data: VerifyPINRequest) {
		return apiClient.post<MessageResponse>('/auth/pin/verify', data, true);
	},

	/**
	 * Change existing PIN
	 */
	changePIN(data: ChangePINRequest) {
		return apiClient.put<MessageResponse>('/auth/pin', data, true);
	},

	/**
	 * Update PIN settings (enable/disable, timeout)
	 */
	updatePINSettings(data: UpdatePINSettingsRequest) {
		return apiClient.patch<User>('/auth/pin/settings', data, true);
	},

	// Telegram linking

	/**
	 * Get Telegram link status
	 */
	getTelegramStatus() {
		return apiClient.get<TelegramLinkStatus>('/auth/telegram/status', true);
	},

	/**
	 * Generate Telegram link code
	 */
	generateTelegramCode() {
		return apiClient.post<TelegramLinkCode>('/auth/telegram/link', undefined, true);
	},

	/**
	 * Unlink Telegram account
	 */
	unlinkTelegram() {
		return apiClient.delete<MessageResponse>('/auth/telegram/unlink', true);
	},

	/**
	 * Update Telegram default book and pocket settings
	 */
	updateTelegramSettings(data: UpdateTelegramSettingsRequest) {
		return apiClient.patch<MessageResponse>('/auth/telegram/settings', data, true);
	}
};

// Telegram types
export interface TelegramLinkStatus {
	linked: boolean;
	platform: string;
	chat_id: string | null;
	linked_at: string | null;
	default_book_id: string | null;
	default_book_name: string | null;
	default_pocket_id: string | null;
	default_pocket_name: string | null;
}

export interface TelegramLinkCode {
	code: string;
	expires_at: string;
	expires_in: number;
}

export interface UpdateTelegramSettingsRequest {
	default_book_id?: string;
	default_pocket_id?: string;
}
