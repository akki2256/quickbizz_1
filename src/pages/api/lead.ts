import type { APIRoute } from 'astro';
import { parseLeadJson } from '../../lib/leadValidation';
import { sendContactQueryEmail } from '../../lib/notificationEmail';

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

	const parsed = parseLeadJson(raw);
	if (!parsed.success) {
		return new Response(JSON.stringify({ error: 'Validation failed', details: parsed.error.flatten() }), {
			status: 400,
			headers: { 'content-type': 'application/json' },
		});
	}

	const { website: _honeypot, ...fields } = parsed.data;
	if (_honeypot?.trim()) {
		return new Response(JSON.stringify({ ok: true }), {
			status: 200,
			headers: { 'content-type': 'application/json' },
		});
	}

	try {
		await sendContactQueryEmail({
			name: fields.name,
			email: fields.email,
			phone: fields.phone || null,
			company: fields.company || null,
			message: fields.message || null,
		});
	} catch (error) {
		console.error('[lead][email]', error);
		const message = error instanceof Error ? error.message : 'Could not send notification email';
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { 'content-type': 'application/json' },
		});
	}

	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: { 'content-type': 'application/json' },
	});
};
