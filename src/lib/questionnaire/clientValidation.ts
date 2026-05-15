import { isValidAbnChecksum } from '../abn';
import {
	CALL_TIME_LABELS,
	CREDIT_HISTORY_LABELS,
	LOAN_USE_LABELS,
	YES_NO_LABELS,
	mapCallTime,
	mapCreditHistory,
	mapLoanUse,
	mapYesNo,
} from './codes';
import { isValidEmailFormat, isValidMobileFormat } from './normalize';
import { parseAudAmount, parseWholeMonths } from './validation';

export { isValidEmailFormat, isValidMobileFormat, parseAudAmount, parseWholeMonths };

export function validateYesNoChoice(value: string): string | null {
	if (!value.trim()) return 'Please select an option.';
	if (!mapYesNo(value)) return 'Please select Yes or No.';
	return null;
}

export function validateLoanUseChoice(value: string): string | null {
	if (!value.trim()) return 'Please select an option.';
	if (!mapLoanUse(value)) return 'Please select Business Use or Personal Use.';
	return null;
}

export function validateCreditHistoryChoice(value: string): string | null {
	if (!value.trim()) return 'Please select an option.';
	if (!mapCreditHistory(value)) return 'Please select a credit history option.';
	return null;
}

export function validateCallTimeChoice(value: string): string | null {
	if (!value.trim()) return 'Please select an option.';
	if (!mapCallTime(value)) return 'Please select a call time.';
	return null;
}

export function validateBorrowAmount(raw: string): string | null {
	const n = parseAudAmount(raw);
	if (n === null) return 'Enter a valid number.';
	if (n < 10000) return 'Minimum loan amount is $10,000 AUD.';
	return null;
}

export function validateMonthsTrading(raw: string): string | null {
	const n = parseWholeMonths(raw);
	if (n === null) return 'Enter whole months only.';
	if (n < 6) return 'You must have been trading for at least 6 months.';
	if (n > 9999) return 'Enter at most 9999 months.';
	return null;
}

export function validateMonthlyRevenue(raw: string): string | null {
	const n = parseAudAmount(raw);
	if (n === null) return 'Enter a valid number.';
	if (n < 0) return 'Revenue cannot be negative.';
	return null;
}

export function validateMaxWeeklyRepayment(raw: string): string | null {
	const n = parseAudAmount(raw);
	if (n === null) return 'Enter a valid number.';
	if (n < 0) return 'Amount cannot be negative.';
	return null;
}

export function validateAbnField(raw: string): string | null {
	const v = raw.trim();
	if (!v) return 'ABN is required.';
	if (!/^\d{11}$/.test(v)) return 'Enter a valid 11-digit ABN.';
	if (!isValidAbnChecksum(v)) return 'Enter a valid 11-digit ABN.';
	return null;
}

export function validateEmailField(raw: string): string | null {
	const v = raw.trim();
	if (!v) return 'Email is required.';
	if (v.length > 320) return 'Email is too long.';
	if (!isValidEmailFormat(v)) return 'Enter a valid email.';
	return null;
}

export function validateMobileField(raw: string): string | null {
	const v = raw.trim();
	if (!v) return 'Mobile number is required.';
	if (v.length > 20) return 'Mobile number is too long.';
	if (!isValidMobileFormat(v)) return 'Enter a valid Australian mobile.';
	return null;
}

export function validateFundPurpose(raw: string): string | null {
	const v = raw.trim();
	if (!v) return 'Please select an option.';
	if (v.length > 100) return 'Selection is too long.';
	return null;
}

export function validateIndustry(raw: string): string | null {
	const v = raw.trim();
	if (!v) return 'Please select an option.';
	if (v.length > 80) return 'Selection is too long.';
	return null;
}

export function validateFundsTiming(raw: string): string | null {
	const v = raw.trim();
	if (!v) return 'Please select an option.';
	if (v.length > 50) return 'Selection is too long.';
	return null;
}

export function validateLoanPriority(raw: string): string | null {
	const v = raw.trim();
	if (!v) return 'Please select an option.';
	if (v.length > 60) return 'Selection is too long.';
	return null;
}

export function validateFullName(raw: string): string | null {
	const v = raw.trim();
	if (!v) return 'This field is required.';
	if (v.length > 200) return 'Name is too long (max 200 characters).';
	return null;
}

export function validateCompanyName(raw: string): string | null {
	const v = raw.trim();
	if (!v) return 'This field is required.';
	if (v.length > 200) return 'Company name is too long (max 200 characters).';
	return null;
}

/** Choice keys that must map to Y/N or coded enums before submit. */
export const CODED_CHOICE_KEYS = new Set([
	'hasAbn',
	'loanUse',
	'citizenOrPr',
	'homeowner',
	'creditHistory',
	'hasDefaults',
	'trustAccount',
	'callTime',
]);

export const KNOWN_YES_NO_KEYS = new Set([
	'hasAbn',
	'citizenOrPr',
	'homeowner',
	'hasDefaults',
	'trustAccount',
]);

export { YES_NO_LABELS, LOAN_USE_LABELS, CREDIT_HISTORY_LABELS, CALL_TIME_LABELS };
