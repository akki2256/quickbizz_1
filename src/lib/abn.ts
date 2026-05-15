export type AbnLookupResult =
	| { status: 'valid'; entityName: string }
	| { status: 'inactive'; message: string }
	| { status: 'invalid'; message: string }
	| { status: 'service_unavailable'; message: string };

const ABR_NAME_TAGS = [
	'organisationName',
	'businessName',
	'mainTradingName',
	'mainName',
	'legalName',
] as const;

/** Plain text only — strips any XML tags left in a fragment. */
export function stripXmlMarkup(value: string): string {
	return value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

/** Extract entity display name from ABR XML (inner leaf tags first). */
export function parseAbrEntityName(xml: string): string {
	for (const tag of ABR_NAME_TAGS) {
		const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
		const match = xml.match(re);
		if (!match?.[1]) continue;
		const inner = match[1].trim();
		if (/<[a-z]/i.test(inner)) {
			const nested = parseAbrEntityName(inner);
			if (nested) return nested;
		}
		const plain = stripXmlMarkup(inner);
		if (plain) return plain;
	}
	return '';
}

export function isValidAbnChecksum(abn: string): boolean {
	if (!/^\d{11}$/.test(abn)) return false;
	const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
	const digits = abn.split('').map(Number);
	digits[0] -= 1;
	const sum = digits.reduce((acc, digit, index) => acc + digit * weights[index], 0);
	return sum % 89 === 0;
}
