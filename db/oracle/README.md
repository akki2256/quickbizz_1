# Oracle — questionnaire submissions

## Setup

1. Create an Oracle user/schema for the app (or use an existing schema).
2. Run the migration:

```bash
sqlplus user/password@connect_string @db/oracle/001_create_qb_questionnaire_submission.sql
```

3. Set application env vars (see `.env.example`):

- `ORACLE_USER`
- `ORACLE_PASSWORD`
- `ORACLE_CONNECT_STRING` — e.g. `hostname:1521/SERVICE_NAME`

   Or alternatively: `ORACLE_HOST`, `ORACLE_PORT` (default `1521`), `ORACLE_SERVICE_NAME`.

## Table

`QB_QUESTIONNAIRE_SUBMISSION` — eligibility wizard answers after OTP verification.

`SUBMISSION_ID` is assigned by `QB_QUESTIONNAIRE_SUBMISSION_SEQ` (trigger on insert).

`EMAIL_NORMALIZED` and `MOBILE_NORMALIZED` are **virtual columns** (computed from `EMAIL` / `MOBILE`). The app must not insert into them — only set `email` and `mobile`.
