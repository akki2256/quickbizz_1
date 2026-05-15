import * as XLSX from 'xlsx';
import type { QuestionnaireRecord } from './types';

function formatTs(value: Date | null): string {
	if (!value) return '';
	const d = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(d.getTime())) return '';
	return d.toISOString();
}

export function questionnaireRecordsToSheetRows(records: QuestionnaireRecord[]): Record<string, string | number>[] {
	return records.map((r) => ({
		SUBMISSION_ID: r.submission_id,
		FULL_NAME: r.full_name,
		COMPANY_NAME: r.company_name,
		EMAIL: r.email,
		MOBILE: r.mobile,
		ABN: r.abn,
		FUND_PURPOSE: r.fund_purpose,
		HAS_ABN: r.has_abn,
		LOAN_USE: r.loan_use,
		BORROW_AMOUNT_AUD: r.borrow_amount_aud,
		CITIZEN_OR_PR: r.citizen_or_pr,
		MONTHS_TRADING: r.months_trading,
		HOMEOWNER: r.homeowner,
		MONTHLY_REVENUE_AUD: r.monthly_revenue_aud,
		INDUSTRY: r.industry,
		CREDIT_HISTORY: r.credit_history,
		HAS_DEFAULTS: r.has_defaults,
		TRUST_ACCOUNT: r.trust_account,
		FUNDS_TIMING: r.funds_timing,
		LOAN_PRIORITY: r.loan_priority,
		MAX_WEEKLY_REPAYMENT_AUD: r.max_weekly_repayment_aud,
		CALL_TIME: r.call_time,
		SOURCE: r.source,
		USER_AGENT: r.user_agent ?? '',
		OTP_VERIFIED: r.otp_verified,
		OTP_VERIFIED_AT: formatTs(r.otp_verified_at),
		CREATED_AT: formatTs(r.created_at),
		UPDATED_AT: formatTs(r.updated_at),
		EMAIL_NORMALIZED: r.email_normalized,
		MOBILE_NORMALIZED: r.mobile_normalized,
	}));
}

export function buildQuestionnaireWorkbookBuffer(records: QuestionnaireRecord[]): Buffer {
	const sheetRows = questionnaireRecordsToSheetRows(records);
	const worksheet = XLSX.utils.json_to_sheet(sheetRows);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Questionnaire');
	return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}
