// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),

  integrations: [react()],

  /** Server secrets — never bundled for the client (no PUBLIC_ prefix). */
  env: {
    schema: {
      ABR_GUID: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      ORACLE_USER: envField.string({ context: 'server', access: 'secret', optional: true }),
      ORACLE_PASSWORD: envField.string({ context: 'server', access: 'secret', optional: true }),
      ORACLE_CONNECT_STRING: envField.string({ context: 'server', access: 'secret', optional: true }),
      ORACLE_HOST: envField.string({ context: 'server', access: 'secret', optional: true }),
      ORACLE_PORT: envField.string({ context: 'server', access: 'secret', optional: true }),
      ORACLE_SERVICE_NAME: envField.string({ context: 'server', access: 'secret', optional: true }),
      SUPABASE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      SUPABASE_SERVICE_ROLE_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      OTP_EXPOSE_CODE: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
