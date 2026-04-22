/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly SUPABASE_URL?: string;
	readonly SUPABASE_SERVICE_ROLE_KEY?: string;
	readonly ABR_GUID?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
