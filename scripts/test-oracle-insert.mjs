import oracledb from 'oracledb';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');
const env = Object.fromEntries(
	readFileSync(envPath, 'utf8')
		.split('\n')
		.filter((l) => l && !l.startsWith('#'))
		.map((l) => {
			const i = l.indexOf('=');
			const key = l.slice(0, i).trim();
			let val = l.slice(i + 1).trim();
			if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
				val = val.slice(1, -1);
			}
			return [key, val];
		}),
);

const connectString = `${env.ORACLE_HOST}:${env.ORACLE_PORT || 1521}/${env.ORACLE_SERVICE_NAME}`;

const INSERT_SQL = `
INSERT INTO qb_questionnaire_submission (
	full_name, company_name, email, mobile, abn, fund_purpose, has_abn, loan_use,
	borrow_amount_aud, citizen_or_pr, months_trading, homeowner, monthly_revenue_aud,
	industry, credit_history, has_defaults, trust_account, funds_timing, loan_priority,
	max_weekly_repayment_aud, call_time, source, user_agent, otp_verified, otp_verified_at
) VALUES (
	:full_name, :company_name, :email, :mobile, :abn, :fund_purpose, :has_abn, :loan_use,
	:borrow_amount_aud, :citizen_or_pr, :months_trading, :homeowner, :monthly_revenue_aud,
	:industry, :credit_history, :has_defaults, :trust_account, :funds_timing, :loan_priority,
	:max_weekly_repayment_aud, :call_time, :source, :user_agent, :otp_verified, :otp_verified_at
) RETURNING submission_id INTO :out_submission_id
`;

const row = {
	full_name: 'Test User',
	company_name: 'Test Co',
	email: 'test@example.com',
	mobile: '0412345678',
	abn: '51824753556',
	fund_purpose: 'cashflow',
	has_abn: 'Y',
	loan_use: 'BUSINESS_USE',
	borrow_amount_aud: 25000,
	citizen_or_pr: 'Y',
	months_trading: 12,
	homeowner: 'N',
	monthly_revenue_aud: 50000,
	industry: 'Professional services',
	credit_history: '600_800',
	has_defaults: 'N',
	trust_account: 'N',
	funds_timing: '7 days',
	loan_priority: 'Speed',
	max_weekly_repayment_aud: 500,
	call_time: 'ANYTIME',
	source: 'ELIGIBILITY',
	user_agent: 'test-script',
	otp_verified: 'Y',
	otp_verified_at: new Date(),
};

let conn;
try {
	conn = await oracledb.getConnection({
		user: env.ORACLE_USER,
		password: env.ORACLE_PASSWORD,
		connectString,
	});
	const result = await conn.execute(INSERT_SQL, {
		...row,
		out_submission_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
	});
	console.log('outBinds:', result.outBinds);
	await conn.commit();
	console.log('Insert OK, id:', result.outBinds?.out_submission_id?.[0]);
} catch (e) {
	console.error('INSERT FAILED:', e.message);
	if (e.errorNum) console.error('ORA:', e.errorNum);
} finally {
	if (conn) await conn.close();
}
