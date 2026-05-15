import type { QuestionnaireRow } from './validation';

export type QuestionnaireRecord = QuestionnaireRow & {
	submission_id: number;
	created_at: Date;
	updated_at: Date;
};
