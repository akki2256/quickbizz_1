/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly SUPABASE_URL?: string;
	readonly SUPABASE_SERVICE_ROLE_KEY?: string;
	readonly ABR_GUID?: string;
	readonly RESEND_API_KEY?: string;
	readonly OTP_EXPOSE_CODE?: string;
	readonly ORACLE_USER?: string;
	readonly ORACLE_PASSWORD?: string;
	readonly ORACLE_CONNECT_STRING?: string;
	readonly ORACLE_HOST?: string;
	readonly ORACLE_PORT?: string;
	readonly ORACLE_SERVICE_NAME?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
