import type { APIRoute } from 'astro';
import { parseLeadJson } from '../../lib/leadValidation';
import { getSupabaseAdmin } from '../../lib/supabaseAdmin';

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

	const row = {
		name: fields.name,
		email: fields.email,
		phone: fields.phone || null,
		company: fields.company || null,
		message: fields.message || null,
		source: 'website',
		user_agent: request.headers.get('user-agent')?.slice(0, 512) ?? null,
	};

	const admin = getSupabaseAdmin();
	if (admin) {
		const { error } = await admin.from('leads').insert(row);
		if (error) {
			console.error('[lead]', error.message);
			return new Response(JSON.stringify({ error: 'Could not save lead' }), {
				status: 500,
				headers: { 'content-type': 'application/json' },
			});
		}
	} else if (import.meta.env.DEV) {
		console.info('[lead] DEV (no Supabase):', row);
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
