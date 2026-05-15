/** Digits-only mobile (8–15) for MOBILE_NORMALIZED / DB mobile format check. */
export function normalizeMobileDigits(mobile: string): string {
	return mobile.replace(/\D/g, '');
}

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

/** Oracle CK_QB_QS_EMAIL_FORMAT (mirrored in app validation). */
export function isValidEmailFormat(email: string): boolean {
	const trimmed = email.trim();
	if (!trimmed || trimmed.includes(' ')) return false;
	const at = trimmed.indexOf('@');
	if (at <= 0) return false;
	const dot = trimmed.indexOf('.', at + 2);
	return dot > at + 1;
}

/** Oracle CK_QB_QS_MOBILE_FORMAT (mirrored in app validation). */
export function isValidMobileFormat(mobile: string): boolean {
	const digits = normalizeMobileDigits(mobile);
	return digits.length >= 8 && digits.length <= 15;
}
