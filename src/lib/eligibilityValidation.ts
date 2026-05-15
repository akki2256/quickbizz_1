import { z } from 'zod';
import { eligibilityAnswersSchema } from './questionnaire/validation';

export const eligibilitySubmitSchema = z.object({
	answers: eligibilityAnswersSchema,
	otp: z.string().length(6).regex(/^\d+$/),
});

export type EligibilitySubmit = z.infer<typeof eligibilitySubmitSchema>;
