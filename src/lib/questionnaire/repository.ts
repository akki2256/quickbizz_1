import { isOracleConfigured } from '../oracle';
import { isSupabaseConfigured } from '../supabaseAdmin';
import {
	insertQuestionnaireSubmissionOracle,
	listQuestionnaireSubmissionsOracle,
} from './oracleRepository';
import {
	insertQuestionnaireSubmissionSupabase,
	listQuestionnaireSubmissionsSupabase,
} from './supabaseRepository';
import type { QuestionnaireRecord } from './types';
import type { QuestionnaireRow } from './validation';

export type { QuestionnaireRecord } from './types';

export type QuestionnaireBackend = 'supabase' | 'oracle' | 'none';

export function getQuestionnaireBackend(): QuestionnaireBackend {
	if (isSupabaseConfigured()) return 'supabase';
	if (isOracleConfigured()) return 'oracle';
	return 'none';
}

export function isQuestionnaireStoreConfigured(): boolean {
	return getQuestionnaireBackend() !== 'none';
}

export async function insertQuestionnaireSubmission(row: QuestionnaireRow): Promise<number | null> {
	const backend = getQuestionnaireBackend();

	if (backend === 'supabase') {
		return insertQuestionnaireSubmissionSupabase(row);
	}

	if (backend === 'oracle') {
		return insertQuestionnaireSubmissionOracle(row);
	}

	if (import.meta.env.DEV) {
		console.info('[questionnaire] DEV (no store configured), insert skipped');
		return null;
	}

	throw new Error('Questionnaire database is not configured');
}

export async function listQuestionnaireSubmissions(): Promise<QuestionnaireRecord[]> {
	const backend = getQuestionnaireBackend();

	if (backend === 'supabase') {
		return listQuestionnaireSubmissionsSupabase();
	}

	if (backend === 'oracle') {
		return listQuestionnaireSubmissionsOracle();
	}

	if (import.meta.env.DEV) {
		return [];
	}

	throw new Error('Questionnaire database is not configured');
}
