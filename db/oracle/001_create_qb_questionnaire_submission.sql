-- QuickBiz eligibility questionnaire submissions
-- Run as a user with CREATE TABLE / INDEX privileges.

CREATE SEQUENCE qb_questionnaire_submission_seq
	START WITH 1
	INCREMENT BY 1
	NOCACHE
	NOCYCLE;

CREATE TABLE qb_questionnaire_submission (
	submission_id           NUMBER          NOT NULL,
	full_name               VARCHAR2(200 CHAR) NOT NULL,
	company_name            VARCHAR2(200 CHAR) NOT NULL,
	email                   VARCHAR2(320 CHAR) NOT NULL,
	mobile                  VARCHAR2(20 CHAR)  NOT NULL,
	abn                     CHAR(11 CHAR)      NOT NULL,
	fund_purpose            VARCHAR2(100 CHAR) NOT NULL,
	has_abn                  CHAR(1 CHAR)       NOT NULL,
	loan_use                VARCHAR2(20 CHAR)  NOT NULL,
	borrow_amount_aud       NUMBER(12, 2)      NOT NULL,
	citizen_or_pr           CHAR(1 CHAR)       NOT NULL,
	months_trading          NUMBER(4, 0)     NOT NULL,
	homeowner               CHAR(1 CHAR)       NOT NULL,
	monthly_revenue_aud     NUMBER(14, 2)    NOT NULL,
	industry                VARCHAR2(80 CHAR)  NOT NULL,
	credit_history          VARCHAR2(20 CHAR)  NOT NULL,
	has_defaults            CHAR(1 CHAR)       NOT NULL,
	trust_account           CHAR(1 CHAR)       NOT NULL,
	funds_timing            VARCHAR2(50 CHAR)  NOT NULL,
	loan_priority           VARCHAR2(60 CHAR)  NOT NULL,
	max_weekly_repayment_aud NUMBER(12, 2)   NOT NULL,
	call_time               VARCHAR2(20 CHAR)  NOT NULL,
	source                  VARCHAR2(30 CHAR)  NOT NULL,
	user_agent              VARCHAR2(512 CHAR),
	otp_verified            CHAR(1 CHAR)       NOT NULL,
	otp_verified_at         TIMESTAMP(6),
	created_at              TIMESTAMP(6)       NOT NULL,
	updated_at              TIMESTAMP(6)       NOT NULL,
	email_normalized        VARCHAR2(320 CHAR) GENERATED ALWAYS AS (LOWER(TRIM(email))) VIRTUAL,
	mobile_normalized       VARCHAR2(20 CHAR) GENERATED ALWAYS AS (
		REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(mobile), ' ', ''), '-', ''), '(', ''), ')', ''), '+', '')
	) VIRTUAL,
	CONSTRAINT pk_qb_questionnaire_submission PRIMARY KEY (submission_id),
	CONSTRAINT ck_qb_qs_abn_format CHECK (
		LENGTH(TRIM(abn)) = 11
		AND TRIM(TRANSLATE(abn, '0123456789', ' ')) IS NULL
	),
	CONSTRAINT ck_qb_qs_borrow_amount_min CHECK (borrow_amount_aud >= 10000),
	CONSTRAINT ck_qb_qs_call_time CHECK (call_time IN ('9_12_AM', '12_6_PM', 'ANYTIME')),
	CONSTRAINT ck_qb_qs_citizen_or_pr CHECK (citizen_or_pr IN ('Y', 'N')),
	CONSTRAINT ck_qb_qs_credit_history CHECK (
		credit_history IN ('800_PLUS', '600_800', '400_600', 'UNDER_400')
	),
	CONSTRAINT ck_qb_qs_email_format CHECK (
		email NOT LIKE '% %'
		AND INSTR(email, '@') > 1
		AND INSTR(email, '.', INSTR(email, '@') + 2) > 0
	),
	CONSTRAINT ck_qb_qs_has_abn CHECK (has_abn IN ('Y', 'N')),
	CONSTRAINT ck_qb_qs_has_defaults CHECK (has_defaults IN ('Y', 'N')),
	CONSTRAINT ck_qb_qs_homeowner CHECK (homeowner IN ('Y', 'N')),
	CONSTRAINT ck_qb_qs_loan_use CHECK (loan_use IN ('BUSINESS_USE', 'PERSONAL_USE')),
	CONSTRAINT ck_qb_qs_max_weekly_repayment_nonneg CHECK (max_weekly_repayment_aud >= 0),
	CONSTRAINT ck_qb_qs_mobile_format CHECK (
		LENGTH(
			REPLACE(
				REPLACE(
					REPLACE(
						REPLACE(REPLACE(TRIM(mobile), ' ', ''), '-', ''),
						'(',
						''
					),
					')',
					''
				),
				'+',
				''
			)
		) BETWEEN 8 AND 15
	),
	CONSTRAINT ck_qb_qs_monthly_revenue_nonneg CHECK (monthly_revenue_aud >= 0),
	CONSTRAINT ck_qb_qs_months_trading_min CHECK (months_trading >= 6),
	CONSTRAINT ck_qb_qs_otp_timestamp_consistency CHECK (
		(otp_verified = 'Y' AND otp_verified_at IS NOT NULL)
		OR (otp_verified = 'N' AND otp_verified_at IS NULL)
	),
	CONSTRAINT ck_qb_qs_otp_verified CHECK (otp_verified IN ('Y', 'N')),
	CONSTRAINT ck_qb_qs_trust_account CHECK (trust_account IN ('Y', 'N'))
);

CREATE OR REPLACE TRIGGER qb_questionnaire_submission_bi
	BEFORE INSERT ON qb_questionnaire_submission
	FOR EACH ROW
BEGIN
	IF :NEW.submission_id IS NULL THEN
		SELECT qb_questionnaire_submission_seq.NEXTVAL INTO :NEW.submission_id FROM DUAL;
	END IF;
	IF :NEW.created_at IS NULL THEN
		:NEW.created_at := SYSTIMESTAMP;
	END IF;
	IF :NEW.updated_at IS NULL THEN
		:NEW.updated_at := SYSTIMESTAMP;
	END IF;
END;
/

CREATE INDEX idx_qb_qs_abn ON qb_questionnaire_submission (abn);
CREATE INDEX idx_qb_qs_loan_use ON qb_questionnaire_submission (loan_use);
CREATE INDEX idx_qb_qs_call_time ON qb_questionnaire_submission (call_time);
CREATE INDEX idx_qb_qs_created_at ON qb_questionnaire_submission (created_at);
CREATE INDEX idx_qb_qs_email_norm ON qb_questionnaire_submission (email_normalized);
CREATE INDEX idx_qb_qs_mobile_norm ON qb_questionnaire_submission (mobile_normalized);
CREATE INDEX idx_qb_qs_source_created ON qb_questionnaire_submission (source, created_at);
