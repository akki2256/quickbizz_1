import { ELIGIBILITY_STEPS, parseTitleAndHelper } from '../data/eligibility-flow';
import { Resend } from 'resend';

const DEFAULT_RESEND_FROM = 'onboarding@resend.dev';
const NOTIFICATION_TO = 'akhilg9312@gmail.com';

const eligibilityLabels = new Map(
	ELIGIBILITY_STEPS.filter((step) => step.key !== 'otp').map((step) => [
		step.key,
		parseTitleAndHelper(step.title).title,
	]),
);

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function buildTableHtml(rows: Array<{ label: string; value: string }>): string {
	const bodyRows = rows
		.map(
			({ label, value }) =>
				`<tr><th align="left" style="padding:8px;border:1px solid #d1d5db;background:#f8fafc;">${escapeHtml(label)}</th><td style="padding:8px;border:1px solid #d1d5db;">${escapeHtml(value || '-')}</td></tr>`,
		)
		.join('');

	return `<table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;max-width:840px;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;line-height:1.4;color:#111827;">${bodyRows}</table>`;
}

function getResendClient(): Resend | null {
	const apiKey = import.meta.env.RESEND_API_KEY;
	if (!apiKey) return null;
	return new Resend(apiKey);
}

async function sendMail(params: {
	from: string;
	subject: string;
	rows: Array<{ label: string; value: string }>;
}): Promise<void> {
	const resend = getResendClient();
	if (!resend) {
		if (import.meta.env.DEV) {
			console.info('[email] DEV (no RESEND_API_KEY):', params.subject);
			return;
		}
		throw new Error('RESEND_API_KEY is not configured');
	}

	const { error } = await resend.emails.send({
		from: params.from,
		to: [NOTIFICATION_TO],
		subject: params.subject,
		html: buildTableHtml(params.rows),
	});

	if (error) {
		throw new Error(error.message || 'Failed to send notification email');
	}
}

export async function sendQuestionnaireExportEmail(input: {
	filename: string;
	xlsxBuffer: Buffer;
	rowCount: number;
}): Promise<void> {
	const resend = getResendClient();
	if (!resend) {
		if (import.meta.env.DEV) {
			console.info(
				'[email] DEV (no RESEND_API_KEY): questionnaire export',
				input.filename,
				`${input.rowCount} rows`,
			);
			return;
		}
		throw new Error('RESEND_API_KEY is not configured');
	}

	const subject = `QuickBizz : Questionnaire export (${input.rowCount} submissions)`;
	const { error } = await resend.emails.send({
		from: DEFAULT_RESEND_FROM,
		to: [NOTIFICATION_TO],
		subject,
		html: `<p>Attached: all eligibility questionnaire submissions (${input.rowCount} rows).</p>`,
		attachments: [
			{
				filename: input.filename,
				content: input.xlsxBuffer.toString('base64'),
			},
		],
	});

	if (error) {
		throw new Error(error.message || 'Failed to send export email');
	}
}

export async function sendContactQueryEmail(input: {
	name: string;
	email: string;
	phone?: string | null;
	company?: string | null;
	message?: string | null;
}): Promise<void> {
	const senderPhone = input.phone?.trim() || 'No Phone';
	const subject = `QuickBizz : New Online Query - ${senderPhone}`;
	const rows = [
		{ label: 'Full Name', value: input.name },
		{ label: 'Email', value: input.email },
		{ label: 'Phone', value: input.phone?.trim() || '-' },
		{ label: 'Business Name', value: input.company?.trim() || '-' },
		{ label: 'Message', value: input.message?.trim() || '-' },
	];

	await sendMail({ from: DEFAULT_RESEND_FROM, subject, rows });
}

export async function sendEligibilityLeadEmail(answers: Record<string, string>): Promise<void> {
	const loanAmount = answers.borrowAmountAud?.trim() || '-';
	const subject = `QuickBizz : New Online Lead - Business Loan -${loanAmount}`;
	const rows = Object.entries(answers)
		.filter(([key]) => key !== 'otp')
		.map(([key, value]) => ({
			label: eligibilityLabels.get(key) ?? key,
			value: value?.trim() || '-',
		}));

	await sendMail({ from: DEFAULT_RESEND_FROM, subject, rows });
}
