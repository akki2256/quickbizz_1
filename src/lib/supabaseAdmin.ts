import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function isSupabaseConfigured(): boolean {
	return Boolean(
		import.meta.env.SUPABASE_URL?.trim() && import.meta.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
	);
}

export function getSupabaseAdmin(): SupabaseClient | null {
	const url = import.meta.env.SUPABASE_URL?.trim();
	const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
	if (!url || !key) return null;
	return createClient(url, key, {
		auth: { persistSession: false, autoRefreshToken: false },
	});
}
