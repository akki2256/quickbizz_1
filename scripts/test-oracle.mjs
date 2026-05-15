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
console.log('Connecting to', connectString, 'as', env.ORACLE_USER);

let conn;
try {
	conn = await oracledb.getConnection({
		user: env.ORACLE_USER,
		password: env.ORACLE_PASSWORD,
		connectString,
	});
	console.log('Connected OK');

	const tables = await conn.execute(
		`SELECT table_name FROM user_tables WHERE table_name = 'QB_QUESTIONNAIRE_SUBMISSION'`,
		[],
		{ outFormat: oracledb.OUT_FORMAT_OBJECT },
	);
	console.log('Table exists:', tables.rows);

	if (tables.rows?.length) {
		const count = await conn.execute(`SELECT COUNT(*) AS C FROM qb_questionnaire_submission`);
		console.log('Row count:', count.rows);
	}
} catch (e) {
	console.error('FAILED:', e.message);
	console.error('Code:', e.errorNum ?? e.code);
} finally {
	if (conn) await conn.close();
}
