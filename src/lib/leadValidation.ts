import { z } from 'zod';

const leadSchema = z.object({
	name: z.string().trim().min(1).max(200),
	email: z.string().trim().email().max(320),
	phone: z.string().trim().max(40).optional().or(z.literal('')),
	company: z.string().trim().max(200).optional().or(z.literal('')),
	message: z.string().trim().max(2000).optional().or(z.literal('')),
	/** Honeypot — must stay empty */
	website: z.string().optional(),
});

export type LeadPayload = z.infer<typeof leadSchema>;

export function parseLeadJson(body: unknown) {
	return leadSchema.safeParse(body);
}
