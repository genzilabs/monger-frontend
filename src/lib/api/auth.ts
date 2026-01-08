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
	VerifyOTPRequest
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
	}
};
