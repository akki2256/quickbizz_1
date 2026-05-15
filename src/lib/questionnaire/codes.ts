/** DB-coded values (Oracle CHECK constraints). */

export const YN = ['Y', 'N'] as const;
export type Yn = (typeof YN)[number];

export const LOAN_USE = ['BUSINESS_USE', 'PERSONAL_USE'] as const;
export type LoanUse = (typeof LOAN_USE)[number];

export const CREDIT_HISTORY = ['800_PLUS', '600_800', '400_600', 'UNDER_400'] as const;
export type CreditHistory = (typeof CREDIT_HISTORY)[number];

export const CALL_TIME = ['9_12_AM', '12_6_PM', 'ANYTIME'] as const;
export type CallTime = (typeof CALL_TIME)[number];

export const YES_NO_LABELS = ['Yes', 'No'] as const;

export const LOAN_USE_LABELS = ['Business Use', 'Personal Use'] as const;

export const CREDIT_HISTORY_LABELS = ['800+', '600-800', '400-600', '<400'] as const;

export const CALL_TIME_LABELS = ['9-12 AM', '12-6 PM', 'Anytime'] as const;

const yesNoToYn = new Map<string, Yn>([
	['Yes', 'Y'],
	['No', 'N'],
]);

const loanUseToCode = new Map<string, LoanUse>([
	['Business Use', 'BUSINESS_USE'],
	['Personal Use', 'PERSONAL_USE'],
]);

const creditHistoryToCode = new Map<string, CreditHistory>([
	['800+', '800_PLUS'],
	['600-800', '600_800'],
	['400-600', '400_600'],
	['<400', 'UNDER_400'],
]);

const callTimeToCode = new Map<string, CallTime>([
	['9-12 AM', '9_12_AM'],
	['12-6 PM', '12_6_PM'],
	['Anytime', 'ANYTIME'],
]);

export function mapYesNo(label: string): Yn | null {
	return yesNoToYn.get(label.trim()) ?? null;
}

export function mapLoanUse(label: string): LoanUse | null {
	return loanUseToCode.get(label.trim()) ?? null;
}

export function mapCreditHistory(label: string): CreditHistory | null {
	return creditHistoryToCode.get(label.trim()) ?? null;
}

export function mapCallTime(label: string): CallTime | null {
	return callTimeToCode.get(label.trim()) ?? null;
}
