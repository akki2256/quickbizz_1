export type AbnLookupResult =
	| { status: 'valid'; entityName: string }
	| { status: 'inactive'; message: string }
	| { status: 'invalid'; message: string }
	| { status: 'service_unavailable'; message: string };

export function isValidAbnChecksum(abn: string): boolean {
	if (!/^\d{11}$/.test(abn)) return false;
	const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
	const digits = abn.split('').map(Number);
	digits[0] -= 1;
	const sum = digits.reduce((acc, digit, index) => acc + digit * weights[index], 0);
	return sum % 89 === 0;
}
