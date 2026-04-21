/**
 * In-memory OTP storage. Fine for local dev; for production serverless use Redis/KV or SMS provider webhooks.
 */

const store = new Map<string, { code: string; expires: number }>();

function normMobile(m: string) {
	return m.replace(/\s/g, '');
}

export function saveOtp(mobile: string, code: string, ttlMs = 10 * 60 * 1000) {
	store.set(normMobile(mobile), { code, expires: Date.now() + ttlMs });
}

export function verifyOtp(mobile: string, code: string): boolean {
	const k = normMobile(mobile);
	const row = store.get(k);
	if (!row || Date.now() > row.expires) {
		store.delete(k);
		return false;
	}
	const ok = row.code === code.trim();
	if (ok) store.delete(k);
	return ok;
}
