import oracledb from 'oracledb';
import {
	ORACLE_CONNECT_STRING,
	ORACLE_HOST,
	ORACLE_PASSWORD,
	ORACLE_PORT,
	ORACLE_SERVICE_NAME,
	ORACLE_USER,
} from 'astro:env/server';

let pool: oracledb.Pool | null = null;
let poolPromise: Promise<oracledb.Pool | null> | null = null;

function buildConnectString(): string | null {
	const direct = ORACLE_CONNECT_STRING?.trim();
	if (direct) return direct;

	const host = ORACLE_HOST?.trim();
	const service = ORACLE_SERVICE_NAME?.trim();
	if (!host || !service) return null;

	const port = ORACLE_PORT?.trim() || '1521';
	return `${host}:${port}/${service}`;
}

export function isOracleConfigured(): boolean {
	return Boolean(ORACLE_USER?.trim() && ORACLE_PASSWORD && buildConnectString());
}

export async function getOraclePool(): Promise<oracledb.Pool | null> {
	if (!isOracleConfigured()) return null;

	if (pool) return pool;
	if (poolPromise) return poolPromise;

	poolPromise = (async () => {
		try {
			pool = await oracledb.createPool({
				user: ORACLE_USER!.trim(),
				password: ORACLE_PASSWORD!,
				connectString: buildConnectString()!,
				poolMin: 0,
				poolMax: 4,
				poolIncrement: 1,
			});
			return pool;
		} catch {
			// Never log connection errors — they may include host/credentials.
			console.error('[oracle] connection pool could not be created');
			pool = null;
			return null;
		} finally {
			poolPromise = null;
		}
	})();

	return poolPromise;
}

export async function withOracleConnection<T>(
	fn: (connection: oracledb.Connection) => Promise<T>,
): Promise<T> {
	const p = await getOraclePool();
	if (!p) {
		throw new Error('Oracle database is not configured');
	}

	const connection = await p.getConnection();
	try {
		return await fn(connection);
	} finally {
		await connection.close();
	}
}
