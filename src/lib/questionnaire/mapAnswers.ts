import {
	mapCallTime,
	mapCreditHistory,
	mapLoanUse,
	mapYesNo,
} from './codes';
import { normalizeEmail, normalizeMobileDigits } from './normalize';
import {
	parseAudAmount,
	parseWholeMonths,
	questionnaireRowSchema,
	type QuestionnaireRow,
} from './validation';

export type MapAnswersMeta = {
	userAgent?: string | null;
	source?: string;
	otpVerifiedAt: Date;
};

export function mapEligibilityAnswersToRow(
	answers: Record<string, string>,
	meta: MapAnswersMeta,
): { ok: true; row: QuestionnaireRow } | { ok: false; error: string } {
	const fundPurpose = answers.fundPurpose?.trim() ?? '';
	const hasAbn = mapYesNo(answers.hasAbn ?? '');
	const loanUse = mapLoanUse(answers.loanUse ?? '');
	const borrowAmount = parseAudAmount(answers.borrowAmountAud ?? '');
	const citizenOrPr = mapYesNo(answers.citizenOrPr ?? '');
	const monthsTrading = parseWholeMonths(answers.monthsTrading ?? '');
	const homeowner = mapYesNo(answers.homeowner ?? '');
	const monthlyRevenue = parseAudAmount(answers.monthlyRevenueAud ?? '');
	const industry = answers.industry?.trim() ?? '';
	const creditHistory = mapCreditHistory(answers.creditHistory ?? '');
	const hasDefaults = mapYesNo(answers.hasDefaults ?? '');
	const trustAccount = mapYesNo(answers.trustAccount ?? '');
	const fundsTiming = answers.fundsTiming?.trim() ?? '';
	const loanPriority = answers.loanPriority?.trim() ?? '';
	const maxWeekly = parseAudAmount(answers.maxWeeklyRepaymentAud ?? '');
	const callTime = mapCallTime(answers.callTime ?? '');
	const fullName = answers.fullName?.trim() ?? '';
	const companyName = answers.companyName?.trim() ?? '';
	const email = answers.email?.trim() ?? '';
	const mobile = answers.mobile?.trim() ?? '';
	const abn = answers.abn?.trim() ?? '';

	if (!hasAbn) return { ok: false, error: 'Invalid ABN answer (Yes/No).' };
	if (!loanUse) return { ok: false, error: 'Invalid loan use selection.' };
	if (borrowAmount === null) return { ok: false, error: 'Enter a valid loan amount.' };
	if (!citizenOrPr) return { ok: false, error: 'Invalid residency answer.' };
	if (monthsTrading === null) return { ok: false, error: 'Enter whole months only.' };
	if (!homeowner) return { ok: false, error: 'Invalid homeowner answer.' };
	if (monthlyRevenue === null) return { ok: false, error: 'Enter a valid monthly revenue.' };
	if (!creditHistory) return { ok: false, error: 'Invalid credit history selection.' };
	if (!hasDefaults) return { ok: false, error: 'Invalid defaults answer.' };
	if (!trustAccount) return { ok: false, error: 'Invalid trust account answer.' };
	if (maxWeekly === null) return { ok: false, error: 'Enter a valid weekly repayment amount.' };
	if (!callTime) return { ok: false, error: 'Invalid call time selection.' };

	const emailNorm = normalizeEmail(email);
	const mobileNorm = normalizeMobileDigits(mobile);

	const candidate = {
		full_name: fullName,
		company_name: companyName,
		email,
		mobile,
		abn,
		fund_purpose: fundPurpose,
		has_abn: hasAbn,
		loan_use: loanUse,
		borrow_amount_aud: borrowAmount,
		citizen_or_pr: citizenOrPr,
		months_trading: monthsTrading,
		homeowner,
		monthly_revenue_aud: monthlyRevenue,
		industry,
		credit_history: creditHistory,
		has_defaults: hasDefaults,
		trust_account: trustAccount,
		funds_timing: fundsTiming,
		loan_priority: loanPriority,
		max_weekly_repayment_aud: maxWeekly,
		call_time: callTime,
		source: (meta.source ?? 'ELIGIBILITY').slice(0, 30),
		user_agent: meta.userAgent?.slice(0, 512) ?? null,
		otp_verified: 'Y' as const,
		otp_verified_at: meta.otpVerifiedAt,
		email_normalized: emailNorm,
		mobile_normalized: mobileNorm,
	};

	const parsed = questionnaireRowSchema.safeParse(candidate);
	if (!parsed.success) {
		const first = parsed.error.issues[0];
		return { ok: false, error: first?.message ?? 'Validation failed.' };
	}

	return { ok: true, row: parsed.data };
}
