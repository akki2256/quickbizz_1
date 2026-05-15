import { getSupabaseAdmin, isSupabaseConfigured } from '../supabaseAdmin';
import type { QuestionnaireRecord } from './types';
import type { QuestionnaireRow } from './validation';

const TABLE = 'qb_questionnaire_submission';

function toInsertPayload(row: QuestionnaireRow) {
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
		otp_verified_at: row.otp_verified_at?.toISOString() ?? null,
	};
}

function mapRow(row: Record<string, unknown>): QuestionnaireRecord {
	return {
		submission_id: Number(row.submission_id),
		full_name: String(row.full_name ?? ''),
		company_name: String(row.company_name ?? ''),
		email: String(row.email ?? ''),
		mobile: String(row.mobile ?? ''),
		abn: String(row.abn ?? '').trim(),
		fund_purpose: String(row.fund_purpose ?? ''),
		has_abn: row.has_abn as QuestionnaireRow['has_abn'],
		loan_use: row.loan_use as QuestionnaireRow['loan_use'],
		borrow_amount_aud: Number(row.borrow_amount_aud),
		citizen_or_pr: row.citizen_or_pr as QuestionnaireRow['citizen_or_pr'],
		months_trading: Number(row.months_trading),
		homeowner: row.homeowner as QuestionnaireRow['homeowner'],
		monthly_revenue_aud: Number(row.monthly_revenue_aud),
		industry: String(row.industry ?? ''),
		credit_history: row.credit_history as QuestionnaireRow['credit_history'],
		has_defaults: row.has_defaults as QuestionnaireRow['has_defaults'],
		trust_account: row.trust_account as QuestionnaireRow['trust_account'],
		funds_timing: String(row.funds_timing ?? ''),
		loan_priority: String(row.loan_priority ?? ''),
		max_weekly_repayment_aud: Number(row.max_weekly_repayment_aud),
		call_time: row.call_time as QuestionnaireRow['call_time'],
		source: String(row.source ?? ''),
		user_agent: (row.user_agent as string | null) ?? null,
		otp_verified: row.otp_verified as QuestionnaireRow['otp_verified'],
		otp_verified_at: row.otp_verified_at ? new Date(String(row.otp_verified_at)) : null,
		created_at: new Date(String(row.created_at)),
		updated_at: new Date(String(row.updated_at)),
		email_normalized: String(row.email_normalized ?? ''),
		mobile_normalized: String(row.mobile_normalized ?? ''),
	};
}

export async function insertQuestionnaireSubmissionSupabase(
	row: QuestionnaireRow,
): Promise<number> {
	const admin = getSupabaseAdmin();
	if (!admin) {
		throw new Error('Supabase is not configured');
	}

	const { data, error } = await admin
		.from(TABLE)
		.insert(toInsertPayload(row))
		.select('submission_id')
		.single();

	if (error) {
		throw new Error(error.message);
	}

	const id = data?.submission_id;
	if (id === undefined || id === null) {
		throw new Error('Insert did not return submission_id');
	}
	return Number(id);
}

export async function listQuestionnaireSubmissionsSupabase(): Promise<QuestionnaireRecord[]> {
	const admin = getSupabaseAdmin();
	if (!admin) {
		throw new Error('Supabase is not configured');
	}

	const { data, error } = await admin
		.from(TABLE)
		.select('*')
		.order('created_at', { ascending: false })
		.order('submission_id', { ascending: false });

	if (error) {
		throw new Error(error.message);
	}

	return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}
