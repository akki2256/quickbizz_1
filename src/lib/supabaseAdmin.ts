import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
	const url = import.meta.env.SUPABASE_URL;
	const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) return null;
	return createClient(url, key, {
		auth: { persistSession: false, autoRefreshToken: false },
	});
}
