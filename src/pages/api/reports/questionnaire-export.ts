import type { APIRoute } from 'astro';
import { buildQuestionnaireWorkbookBuffer } from '../../../lib/questionnaire/exportExcel';
import {
	isQuestionnaireStoreConfigured,
	listQuestionnaireSubmissions,
} from '../../../lib/questionnaire/repository';
import { sendQuestionnaireExportEmail } from '../../../lib/notificationEmail';

export const prerender = false;

const JSON_HEADERS = { 'content-type': 'application/json' } as const;

export const POST: APIRoute = async () => {
	if (!isQuestionnaireStoreConfigured() && !import.meta.env.DEV) {
		return new Response(JSON.stringify({ error: 'Database not configured' }), {
			status: 503,
			headers: JSON_HEADERS,
		});
	}

	try {
		const records = await listQuestionnaireSubmissions();
		const buffer = buildQuestionnaireWorkbookBuffer(records);
		const stamp = new Date().toISOString().slice(0, 10);
		const filename = `qb-questionnaire-submissions-${stamp}.xlsx`;

		await sendQuestionnaireExportEmail({
			filename,
			xlsxBuffer: buffer,
			rowCount: records.length,
		});

		return new Response(JSON.stringify({ ok: true, rowCount: records.length }), {
			status: 200,
			headers: JSON_HEADERS,
		});
	} catch (error) {
		if (import.meta.env.DEV) {
			const msg = error instanceof Error ? error.message : String(error);
			console.error('[reports][questionnaire-export] failed:', msg);
		} else {
			console.error('[reports][questionnaire-export] failed');
		}
		return new Response(JSON.stringify({ error: 'Export failed' }), {
			status: 500,
			headers: JSON_HEADERS,
		});
	}
};
