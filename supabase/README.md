# Supabase setup (QuickBiz)

## 1. Create a Supabase project

1. [supabase.com](https://supabase.com) → **New project**
2. Note **Project URL** and **service_role** key (Settings → API)

## 2. Run SQL script

In **SQL Editor**, run:

- `questionnaire_submission.sql` — creates `public.qb_questionnaire_submission` (eligibility wizard)

## 3. Environment variables

Add to **`.env`** (local) and **Vercel → Environment Variables** (production):

| Variable | Where to get it | Notes |
|----------|-----------------|-------|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL | Server-only |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` | **Secret** — never `PUBLIC_*` |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys | Lead + Excel export emails |
| `ABR_GUID` | [abr.business.gov.au](https://abr.business.gov.au/) | ABN lookup |

Optional (local Oracle only — not needed on Vercel if using Supabase):

- `ORACLE_HOST`, `ORACLE_PORT`, `ORACLE_SERVICE_NAME`, `ORACLE_USER`, `ORACLE_PASSWORD`

**Storage priority:** If both Supabase and Oracle are configured, the app uses **Supabase** for questionnaire save/export.

## 4. Redeploy / restart

- Local: restart `npm run dev` after changing `.env`
- Vercel: redeploy after adding env vars

## 5. Verify

- Submit eligibility wizard → row in **Table Editor** → `qb_questionnaire_submission`
- Click floating **Contact us** → Excel emailed to `akhilg9312@gmail.com` (requires `RESEND_API_KEY`)

Contact form enquiries are sent by **email only** (no Supabase table).
