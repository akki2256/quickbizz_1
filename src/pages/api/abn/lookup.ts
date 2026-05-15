import type { APIRoute } from 'astro';
import {
	isValidAbnChecksum,
	parseAbrEntityName,
	stripXmlMarkup,
	type AbnLookupResult,
} from '../../../lib/abn';

export const prerender = false;

const PRIVATE_JSON_HEADERS = {
	'content-type': 'application/json',
	'cache-control': 'no-store, no-cache, must-revalidate, private',
	pragma: 'no-cache',
} as const;

function json(status: number, body: AbnLookupResult) {
	return new Response(JSON.stringify(body), {
		status,
		headers: PRIVATE_JSON_HEADERS,
	});
}

export const POST: APIRoute = async ({ request }) => {
	if (request.headers.get('content-type')?.includes('application/json') !== true) {
		return new Response(JSON.stringify({ error: 'Unsupported content type' }), {
			status: 415,
			headers: PRIVATE_JSON_HEADERS,
		});
	}

	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
			status: 400,
			headers: PRIVATE_JSON_HEADERS,
		});
	}

	const abn = typeof (raw as { abn?: unknown })?.abn === 'string' ? (raw as { abn: string }).abn.trim() : '';
	if (!/^\d{11}$/.test(abn) || !isValidAbnChecksum(abn)) {
		return json(200, { status: 'invalid', message: 'Enter a valid 11-digit ABN.' });
	}

	const guid = import.meta.env.ABR_GUID?.trim();
	if (!guid) {
		return json(200, {
			status: 'service_unavailable',
			message:
				'ABN service is temporarily unavailable. You can continue now and we will validate the ABN shortly.',
		});
	}

	const url = new URL('https://abr.business.gov.au/abrxmlsearch/ABRXMLSearch.asmx/ABRSearchByABN');
	url.searchParams.set('searchString', abn);
	url.searchParams.set('includeHistoricalDetails', 'N');
	url.searchParams.set('authenticationGuid', guid);

	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 5000);
		const res = await fetch(url.toString(), {
			method: 'GET',
			headers: { accept: 'application/xml,text/xml' },
			signal: controller.signal,
		});
		clearTimeout(timeout);

		if (!res.ok) {
			return json(200, {
				status: 'service_unavailable',
				message:
					'ABN service is temporarily unavailable. You can continue now and we will validate the ABN shortly.',
			});
		}

		const xml = await res.text();
		const statusMatch = xml.match(/<entityStatus>([\s\S]*?)<\/entityStatus>/i) ??
			xml.match(/<ABNStatus>([\s\S]*?)<\/ABNStatus>/i);
		const entityName = stripXmlMarkup(parseAbrEntityName(xml));
		const abnStatus = stripXmlMarkup(statusMatch?.[1] ?? '').toLowerCase();

		if (abnStatus.includes('cancelled') || abnStatus.includes('inactive')) {
			return json(200, {
				status: 'inactive',
				message: 'This ABN is inactive/cancelled. Please enter an active ABN.',
			});
		}

		if (entityName) {
			return json(200, { status: 'valid', entityName });
		}

		return json(200, { status: 'invalid', message: 'Unable to verify this ABN. Please check and try again.' });
	} catch {
		return json(200, {
			status: 'service_unavailable',
			message:
				'ABN service is temporarily unavailable. You can continue now and we will validate the ABN shortly.',
		});
	}
};
