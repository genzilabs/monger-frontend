/**
 * Validation utility functions
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;
const OTP_REGEX = /^\d{6}$/;

export function isValidEmail(email: string): boolean {
	return EMAIL_REGEX.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
	// Remove spaces and dashes for validation
	const cleaned = phone.replace(/[\s-]/g, '');
	return PHONE_REGEX.test(cleaned);
}

export function isValidOTP(otp: string): boolean {
	return OTP_REGEX.test(otp);
}

export function isValidIdentifier(identifier: string): boolean {
	return isValidEmail(identifier) || isValidPhone(identifier);
}

export function formatPhoneDisplay(phone: string): string {
	// Format for display: +62 812 3456 7890
	const cleaned = phone.replace(/\D/g, '');
	if (cleaned.length < 10) return phone;
	
	const countryCode = cleaned.slice(0, 2);
	const rest = cleaned.slice(2);
	const formatted = rest.replace(/(\d{3})(\d{4})(\d+)/, '$1 $2 $3');
	
	return `+${countryCode} ${formatted}`.trim();
}

export function maskIdentifier(identifier: string): string {
	if (isValidEmail(identifier)) {
		const [local, domain] = identifier.split('@');
		const maskedLocal = local.length <= 2 
			? local 
			: local.slice(0, 2) + '*'.repeat(Math.min(local.length - 2, 4));
		return `${maskedLocal}@${domain}`;
	}
	
	if (isValidPhone(identifier)) {
		const cleaned = identifier.replace(/\D/g, '');
		if (cleaned.length < 4) return identifier;
		return identifier.slice(0, 4) + '*'.repeat(cleaned.length - 7) + identifier.slice(-3);
	}
	
	return identifier;
}
