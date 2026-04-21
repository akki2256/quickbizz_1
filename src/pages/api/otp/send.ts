import type { APIRoute } from 'astro';
import { saveOtp } from '../../../lib/otpStore';

export const prerender = false;

function random6() {
	return String(Math.floor(100000 + Math.random() * 900000));
}

export const POST: APIRoute = async ({ request }) => {
	if (request.headers.get('content-type')?.includes('application/json') !== true) {
		return new Response(JSON.stringify({ error: 'Unsupported content type' }), {
			status: 415,
			headers: { 'content-type': 'application/json' },
		});
	}

	let body: { mobile?: string };
	try {
		body = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
			status: 400,
			headers: { 'content-type': 'application/json' },
		});
	}

	const mobile = typeof body.mobile === 'string' ? body.mobile.trim() : '';
	if (mobile.length < 8) {
		return new Response(JSON.stringify({ error: 'Enter a valid mobile number' }), {
			status: 400,
			headers: { 'content-type': 'application/json' },
		});
	}

	const code = random6();
	saveOtp(mobile, code);

	const payload: { ok: true; devCode?: string } = { ok: true };
	if (import.meta.env.DEV) {
		payload.devCode = code;
	}

	return new Response(JSON.stringify(payload), {
		status: 200,
		headers: { 'content-type': 'application/json' },
	});
};
