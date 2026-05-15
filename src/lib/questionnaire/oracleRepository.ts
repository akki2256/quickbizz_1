import oracledb from 'oracledb';
import { isOracleConfigured, withOracleConnection } from '../oracle';
import type { QuestionnaireRecord } from './types';
import type { QuestionnaireRow } from './validation';

const INSERT_SQL = `
INSERT INTO qb_questionnaire_submission (
	full_name, company_name, email, mobile, abn, fund_purpose, has_abn, loan_use,
	borrow_amount_aud, citizen_or_pr, months_trading, homeowner, monthly_revenue_aud,
	industry, credit_history, has_defaults, trust_account, funds_timing, loan_priority,
	max_weekly_repayment_aud, call_time, source, user_agent, otp_verified, otp_verified_at
) VALUES (
	:full_name, :company_name, :email, :mobile, :abn, :fund_purpose, :has_abn, :loan_use,
	:borrow_amount_aud, :citizen_or_pr, :months_trading, :homeowner, :monthly_revenue_aud,
	:industry, :credit_history, :has_defaults, :trust_account, :funds_timing, :loan_priority,
	:max_weekly_repayment_aud, :call_time, :source, :user_agent, :otp_verified, :otp_verified_at
) RETURNING submission_id INTO :out_submission_id
`;

const SELECT_ALL_SQL = `
SELECT
	submission_id, full_name, company_name, email, mobile, abn, fund_purpose, has_abn,
	loan_use, borrow_amount_aud, citizen_or_pr, months_trading, homeowner, monthly_revenue_aud,
	industry, credit_history, has_defaults, trust_account, funds_timing, loan_priority,
	max_weekly_repayment_aud, call_time, source, user_agent, otp_verified, otp_verified_at,
	created_at, updated_at, email_normalized, mobile_normalized
FROM qb_questionnaire_submission
ORDER BY created_at DESC, submission_id DESC
`;

function bindRow(row: QuestionnaireRow) {
	return {
		full_name: row.full_name,
		company_name: row.company_name,
		email: row.email,
		mobile: row.mobile,
		abn: row.abn,
		fund_purpose: row.fund_purpose,
		has_abn: row.has_abn,
		loan_use: row.loan_use,
		borrow_amount_aud: row.borrow_amount_aud,
		citizen_or_pr: row.citizen_or_pr,
		months_trading: row.months_trading,
		homeowner: row.homeowner,
		monthly_revenue_aud: row.monthly_revenue_aud,
		industry: row.industry,
		credit_history: row.credit_history,
		has_defaults: row.has_defaults,
		trust_account: row.trust_account,
		funds_timing: row.funds_timing,
		loan_priority: row.loan_priority,
		max_weekly_repayment_aud: row.max_weekly_repayment_aud,
		call_time: row.call_time,
		source: row.source,
		user_agent: row.user_agent ?? null,
		otp_verified: row.otp_verified,
		otp_verified_at: row.otp_verified_at,
	};
}

function mapRecord(row: Record<string, unknown>): QuestionnaireRecord {
	return {
		submission_id: Number(row.SUBMISSION_ID ?? row.submission_id),
		full_name: String(row.FULL_NAME ?? row.full_name ?? ''),
		company_name: String(row.COMPANY_NAME ?? row.company_name ?? ''),
		email: String(row.EMAIL ?? row.email ?? ''),
		mobile: String(row.MOBILE ?? row.mobile ?? ''),
		abn: String(row.ABN ?? row.abn ?? '').trim(),
		fund_purpose: String(row.FUND_PURPOSE ?? row.fund_purpose ?? ''),
		has_abn: String(row.HAS_ABN ?? row.has_abn ?? '') as QuestionnaireRow['has_abn'],
		loan_use: String(row.LOAN_USE ?? row.loan_use ?? '') as QuestionnaireRow['loan_use'],
		borrow_amount_aud: Number(row.BORROW_AMOUNT_AUD ?? row.borrow_amount_aud),
		citizen_or_pr: String(row.CITIZEN_OR_PR ?? row.citizen_or_pr ?? '') as QuestionnaireRow['citizen_or_pr'],
		months_trading: Number(row.MONTHS_TRADING ?? row.months_trading),
		homeowner: String(row.HOMEOWNER ?? row.homeowner ?? '') as QuestionnaireRow['homeowner'],
		monthly_revenue_aud: Number(row.MONTHLY_REVENUE_AUD ?? row.monthly_revenue_aud),
		industry: String(row.INDUSTRY ?? row.industry ?? ''),
		credit_history: String(row.CREDIT_HISTORY ?? row.credit_history ?? '') as QuestionnaireRow['credit_history'],
		has_defaults: String(row.HAS_DEFAULTS ?? row.has_defaults ?? '') as QuestionnaireRow['has_defaults'],
		trust_account: String(row.TRUST_ACCOUNT ?? row.trust_account ?? '') as QuestionnaireRow['trust_account'],
		funds_timing: String(row.FUNDS_TIMING ?? row.funds_timing ?? ''),
		loan_priority: String(row.LOAN_PRIORITY ?? row.loan_priority ?? ''),
		max_weekly_repayment_aud: Number(row.MAX_WEEKLY_REPAYMENT_AUD ?? row.max_weekly_repayment_aud),
		call_time: String(row.CALL_TIME ?? row.call_time ?? '') as QuestionnaireRow['call_time'],
		source: String(row.SOURCE ?? row.source ?? ''),
		user_agent: (row.USER_AGENT ?? row.user_agent ?? null) as string | null,
		otp_verified: String(row.OTP_VERIFIED ?? row.otp_verified ?? '') as QuestionnaireRow['otp_verified'],
		otp_verified_at: (row.OTP_VERIFIED_AT ?? row.otp_verified_at ?? null) as Date | null,
		created_at: (row.CREATED_AT ?? row.created_at) as Date,
		updated_at: (row.UPDATED_AT ?? row.updated_at) as Date,
		email_normalized: String(row.EMAIL_NORMALIZED ?? row.email_normalized ?? ''),
		mobile_normalized: String(row.MOBILE_NORMALIZED ?? row.mobile_normalized ?? ''),
	};
}

export async function insertQuestionnaireSubmissionOracle(row: QuestionnaireRow): Promise<number> {
	return withOracleConnection(async (connection) => {
		const result = await connection.execute(INSERT_SQL, {
			...bindRow(row),
			out_submission_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
		});

		const out = result.outBinds as { out_submission_id?: number[] } | undefined;
		const id = out?.out_submission_id?.[0];
		if (id === undefined || id === null) {
			throw new Error('Insert did not return submission_id');
		}
		await connection.commit();
		return Number(id);
	});
}

export async function listQuestionnaireSubmissionsOracle(): Promise<QuestionnaireRecord[]> {
	return withOracleConnection(async (connection) => {
		const result = await connection.execute(SELECT_ALL_SQL, [], {
			outFormat: oracledb.OUT_FORMAT_OBJECT,
		});
		const rows = (result.rows ?? []) as Record<string, unknown>[];
		return rows.map(mapRecord);
	});
}

export { isOracleConfigured };
