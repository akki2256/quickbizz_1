import { z } from 'zod';
import { isValidAbnChecksum } from '../abn';
import { CALL_TIME, CREDIT_HISTORY, LOAN_USE, YN } from './codes';
import { isValidEmailFormat, isValidMobileFormat } from './normalize';

const abnSchema = z
	.string()
	.trim()
	.regex(/^\d{11}$/, 'Enter a valid 11-digit ABN.')
	.refine(isValidAbnChecksum, 'Enter a valid 11-digit ABN.');

const emailSchema = z
	.string()
	.trim()
	.max(320)
	.refine(isValidEmailFormat, 'Enter a valid email.');

const mobileSchema = z
	.string()
	.trim()
	.max(20)
	.refine(isValidMobileFormat, 'Enter a valid mobile number.');

/** Row shape stored in Oracle (after mapping wizard labels → codes). */
export const questionnaireRowSchema = z.object({
	full_name: z.string().trim().min(1).max(200),
	company_name: z.string().trim().min(1).max(200),
	email: emailSchema,
	mobile: mobileSchema,
	abn: abnSchema,
	fund_purpose: z.string().trim().min(1).max(100),
	has_abn: z.enum(YN),
	loan_use: z.enum(LOAN_USE),
	borrow_amount_aud: z.number().min(10000).max(9999999999.99),
	citizen_or_pr: z.enum(YN),
	months_trading: z.number().int().min(6).max(9999),
	homeowner: z.enum(YN),
	monthly_revenue_aud: z.number().min(0).max(99999999999999.99),
	industry: z.string().trim().min(1).max(80),
	credit_history: z.enum(CREDIT_HISTORY),
	has_defaults: z.enum(YN),
	trust_account: z.enum(YN),
	funds_timing: z.string().trim().min(1).max(50),
	loan_priority: z.string().trim().min(1).max(60),
	max_weekly_repayment_aud: z.number().min(0).max(9999999999.99),
	call_time: z.enum(CALL_TIME),
	source: z.string().trim().min(1).max(30),
	user_agent: z.string().max(512).nullable().optional(),
	otp_verified: z.enum(YN),
	otp_verified_at: z.date().nullable(),
	email_normalized: z.string().trim().max(320),
	mobile_normalized: z
		.string()
		.max(20)
		.refine((v) => v.length >= 8 && v.length <= 15, 'Invalid normalized mobile.'),
});

export type QuestionnaireRow = z.infer<typeof questionnaireRowSchema>;

/** Wizard answer keys required on successful completion. */
export const ELIGIBILITY_ANSWER_KEYS = [
	'fundPurpose',
	'hasAbn',
	'loanUse',
	'borrowAmountAud',
	'citizenOrPr',
	'monthsTrading',
	'homeowner',
	'monthlyRevenueAud',
	'industry',
	'creditHistory',
	'hasDefaults',
	'trustAccount',
	'fundsTiming',
	'loanPriority',
	'maxWeeklyRepaymentAud',
	'callTime',
	'fullName',
	'companyName',
	'abn',
	'email',
	'mobile',
] as const;

export type EligibilityAnswerKey = (typeof ELIGIBILITY_ANSWER_KEYS)[number];

export const eligibilityAnswersSchema = z
	.record(z.string(), z.string())
	.superRefine((answers, ctx) => {
		for (const key of ELIGIBILITY_ANSWER_KEYS) {
			const raw = answers[key]?.trim() ?? '';
			if (!raw) {
				ctx.addIssue({ code: 'custom', message: `Missing answer: ${key}`, path: [key] });
			}
		}
	});

export function parseAudAmount(raw: string): number | null {
	const n = Number(raw.replace(/,/g, '').trim());
	return Number.isFinite(n) ? n : null;
}

export function parseWholeMonths(raw: string): number | null {
	const n = Number(raw.replace(/,/g, '').trim());
	if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
	return n;
}
