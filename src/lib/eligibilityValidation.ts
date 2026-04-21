import { z } from 'zod';

export const eligibilitySubmitSchema = z.object({
	answers: z.record(z.string(), z.string()),
	otp: z.string().length(6).regex(/^\d+$/),
});

export type EligibilitySubmit = z.infer<typeof eligibilitySubmitSchema>;
