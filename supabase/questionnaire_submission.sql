-- Eligibility questionnaire submissions (mirrors Oracle qb_questionnaire_submission).
-- Run in Supabase SQL Editor (eligibility wizard storage).

create table if not exists public.qb_questionnaire_submission (
	submission_id bigint generated always as identity primary key,

	full_name varchar(200) not null,
	company_name varchar(200) not null,
	email varchar(320) not null,
	mobile varchar(20) not null,
	abn char(11) not null,
	fund_purpose varchar(100) not null,
	has_abn char(1) not null,
	loan_use varchar(20) not null,
	borrow_amount_aud numeric(12, 2) not null,
	citizen_or_pr char(1) not null,
	months_trading integer not null,
	homeowner char(1) not null,
	monthly_revenue_aud numeric(14, 2) not null,
	industry varchar(80) not null,
	credit_history varchar(20) not null,
	has_defaults char(1) not null,
	trust_account char(1) not null,
	funds_timing varchar(50) not null,
	loan_priority varchar(60) not null,
	max_weekly_repayment_aud numeric(12, 2) not null,
	call_time varchar(20) not null,
	source varchar(30) not null default 'ELIGIBILITY',
	user_agent varchar(512),
	otp_verified char(1) not null default 'N',
	otp_verified_at timestamptz,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),

	email_normalized varchar(320) generated always as (lower(trim(email))) stored,
	mobile_normalized varchar(20) generated always as (
		replace(
			replace(
				replace(
					replace(replace(trim(mobile), ' ', ''), '-', ''),
					'(',
					''
				),
				')',
				''
			),
			'+',
			''
		)
	) stored,

	constraint ck_qb_qs_abn_format check (
		length(trim(abn)) = 11 and abn ~ '^\d{11}$'
	),
	constraint ck_qb_qs_borrow_amount_min check (borrow_amount_aud >= 10000),
	constraint ck_qb_qs_call_time check (call_time in ('9_12_AM', '12_6_PM', 'ANYTIME')),
	constraint ck_qb_qs_citizen_or_pr check (citizen_or_pr in ('Y', 'N')),
	constraint ck_qb_qs_credit_history check (
		credit_history in ('800_PLUS', '600_800', '400_600', 'UNDER_400')
	),
	constraint ck_qb_qs_email_format check (
		email not like '% %'
		and position('@' in email) > 1
		and position('.' in substring(email from position('@' in email) + 2)) > 0
	),
	constraint ck_qb_qs_has_abn check (has_abn in ('Y', 'N')),
	constraint ck_qb_qs_has_defaults check (has_defaults in ('Y', 'N')),
	constraint ck_qb_qs_homeowner check (homeowner in ('Y', 'N')),
	constraint ck_qb_qs_loan_use check (loan_use in ('BUSINESS_USE', 'PERSONAL_USE')),
	constraint ck_qb_qs_max_weekly_repayment_nonneg check (max_weekly_repayment_aud >= 0),
	constraint ck_qb_qs_mobile_format check (
		length(
			replace(replace(replace(replace(replace(trim(mobile), ' ', ''), '-', ''), '(', ''), ')', ''), '+', '')
		) between 8 and 15
	),
	constraint ck_qb_qs_monthly_revenue_nonneg check (monthly_revenue_aud >= 0),
	constraint ck_qb_qs_months_trading_min check (months_trading >= 6),
	constraint ck_qb_qs_otp_timestamp_consistency check (
		(otp_verified = 'Y' and otp_verified_at is not null)
		or (otp_verified = 'N' and otp_verified_at is null)
	),
	constraint ck_qb_qs_otp_verified check (otp_verified in ('Y', 'N')),
	constraint ck_qb_qs_trust_account check (trust_account in ('Y', 'N'))
);

create or replace function public.set_qb_questionnaire_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at := now();
	return new;
end;
$$;

drop trigger if exists trg_qb_qs_set_updated_at on public.qb_questionnaire_submission;
create trigger trg_qb_qs_set_updated_at
	before update on public.qb_questionnaire_submission
	for each row
	execute function public.set_qb_questionnaire_updated_at();

create index if not exists idx_qb_qs_abn on public.qb_questionnaire_submission (abn);
create index if not exists idx_qb_qs_loan_use on public.qb_questionnaire_submission (loan_use);
create index if not exists idx_qb_qs_call_time on public.qb_questionnaire_submission (call_time);
create index if not exists idx_qb_qs_created_at on public.qb_questionnaire_submission (created_at);
create index if not exists idx_qb_qs_email_norm on public.qb_questionnaire_submission (email_normalized);
create index if not exists idx_qb_qs_mobile_norm on public.qb_questionnaire_submission (mobile_normalized);
create index if not exists idx_qb_qs_source_created on public.qb_questionnaire_submission (source, created_at);

alter table public.qb_questionnaire_submission enable row level security;
