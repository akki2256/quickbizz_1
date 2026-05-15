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
const conn = await oracledb.getConnection({
	user: env.ORACLE_USER,
	password: env.ORACLE_PASSWORD,
	connectString,
});

const cols = await conn.execute(
	`SELECT column_name, data_type, virtual_column, data_default
   FROM user_tab_cols
   WHERE table_name = 'QB_QUESTIONNAIRE_SUBMISSION'
   ORDER BY column_id`,
	[],
	{ outFormat: oracledb.OUT_FORMAT_OBJECT },
);
console.table(cols.rows);
await conn.close();
