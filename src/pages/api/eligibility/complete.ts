import type { APIRoute } from 'astro';
import { eligibilitySubmitSchema } from '../../../lib/eligibilityValidation';
import { mapEligibilityAnswersToRow } from '../../../lib/questionnaire/mapAnswers';
import {
	getQuestionnaireBackend,
	insertQuestionnaireSubmission,
	isQuestionnaireStoreConfigured,
} from '../../../lib/questionnaire/repository';
import { sendEligibilityLeadEmail } from '../../../lib/notificationEmail';
import { verifyOtp } from '../../../lib/otpStore';

export const prerender = false;

const JSON_HEADERS = { 'content-type': 'application/json' } as const;

export const POST: APIRoute = async ({ request }) => {
	if (request.headers.get('content-type')?.includes('application/json') !== true) {
		return new Response(JSON.stringify({ error: 'Unsupported content type' }), {
			status: 415,
			headers: JSON_HEADERS,
		});
	}

	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
			status: 400,
			headers: JSON_HEADERS,
		});
	}

	const parsed = eligibilitySubmitSchema.safeParse(raw);
	if (!parsed.success) {
		const first = parsed.error.issues[0];
		return new Response(
			JSON.stringify({
				error: first?.message ?? 'Validation failed',
				details: parsed.error.flatten(),
			}),
			{ status: 400, headers: JSON_HEADERS },
		);
	}

	const { answers, otp } = parsed.data;
	const mobile = answers.mobile?.trim() ?? '';
	if (!verifyOtp(mobile, otp)) {
		return new Response(JSON.stringify({ error: 'Invalid or expired code' }), {
			status: 400,
			headers: JSON_HEADERS,
		});
	}

	const mapped = mapEligibilityAnswersToRow(answers, {
		userAgent: request.headers.get('user-agent'),
		source: 'ELIGIBILITY',
		otpVerifiedAt: new Date(),
	});
	if (!mapped.ok) {
		return new Response(JSON.stringify({ error: mapped.error }), {
			status: 400,
			headers: JSON_HEADERS,
		});
	}

	if (!isQuestionnaireStoreConfigured() && !import.meta.env.DEV) {
		return new Response(JSON.stringify({ error: 'Service unavailable' }), {
			status: 503,
			headers: JSON_HEADERS,
		});
	}

	try {
		await insertQuestionnaireSubmission(mapped.row);
	} catch (error) {
		const backend = getQuestionnaireBackend();
		if (import.meta.env.DEV) {
			const msg = error instanceof Error ? error.message : String(error);
			console.error(`[eligibility][${backend}] could not save submission:`, msg);
		} else {
			console.error(`[eligibility][${backend}] could not save submission`);
		}
		return new Response(JSON.stringify({ error: 'Could not save your submission' }), {
			status: 500,
			headers: JSON_HEADERS,
		});
	}

	const { otp: _o, ...rest } = answers;

	try {
		await sendEligibilityLeadEmail(rest);
	} catch (error) {
		console.error('[eligibility][email]', error);
		const message = error instanceof Error ? error.message : 'Could not send notification email';
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: JSON_HEADERS,
		});
	}

	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: JSON_HEADERS,
	});
};
