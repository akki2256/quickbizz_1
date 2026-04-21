import type { APIRoute } from 'astro';
import { eligibilitySubmitSchema } from '../../../lib/eligibilityValidation';
import { verifyOtp } from '../../../lib/otpStore';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	if (request.headers.get('content-type')?.includes('application/json') !== true) {
		return new Response(JSON.stringify({ error: 'Unsupported content type' }), {
			status: 415,
			headers: { 'content-type': 'application/json' },
		});
	}

	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
			status: 400,
			headers: { 'content-type': 'application/json' },
		});
	}

	const parsed = eligibilitySubmitSchema.safeParse(raw);
	if (!parsed.success) {
		return new Response(JSON.stringify({ error: 'Validation failed', details: parsed.error.flatten() }), {
			status: 400,
			headers: { 'content-type': 'application/json' },
		});
	}

	const { answers, otp } = parsed.data;
	const mobile = answers.mobile?.trim() ?? '';
	if (!mobile || !verifyOtp(mobile, otp)) {
		return new Response(JSON.stringify({ error: 'Invalid or expired code' }), {
			status: 400,
			headers: { 'content-type': 'application/json' },
		});
	}

	const name = answers.fullName?.trim() || 'Eligibility applicant';
	const email = answers.email?.trim() || '';
	if (!email) {
		return new Response(JSON.stringify({ error: 'Email required' }), {
			status: 400,
			headers: { 'content-type': 'application/json' },
		});
	}

	const { otp: _o, ...rest } = answers;
	const message = JSON.stringify({ type: 'eligibility', answers: rest });

	const row = {
		name,
		email,
		phone: mobile || null,
		company: answers.companyName?.trim() || null,
		message,
		source: 'eligibility',
		user_agent: request.headers.get('user-agent')?.slice(0, 512) ?? null,
	};

	const admin = getSupabaseAdmin();
	if (admin) {
		const { error } = await admin.from('leads').insert(row);
		if (error) {
			console.error('[eligibility]', error.message);
			return new Response(JSON.stringify({ error: 'Could not save' }), {
				status: 500,
				headers: { 'content-type': 'application/json' },
			});
		}
	} else if (import.meta.env.DEV) {
		console.info('[eligibility] DEV (no Supabase):', row);
	} else {
		return new Response(JSON.stringify({ error: 'Service unavailable' }), {
			status: 503,
			headers: { 'content-type': 'application/json' },
		});
	}

	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: { 'content-type': 'application/json' },
	});
};
