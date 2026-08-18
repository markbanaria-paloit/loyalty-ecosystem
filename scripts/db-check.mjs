/**
 * Report what DATABASE_URL points at, without printing the credential.
 *
 * Worth having because the failure it catches is quiet: a service with no
 * database still starts and still serves, and only looks wrong later when
 * state goes missing.
 */
import { Pool } from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.log('DATABASE_URL is not set — the platform runs in memory and resets on restart.');
  console.log('Fill in database.env to change that.');
  process.exit(0);
}

let shown = '(unparseable URL)';
try {
  const u = new URL(url);
  shown = `${u.protocol}//${u.username}:***@${u.hostname}:${u.port}${u.pathname}`;
} catch {}
console.log(`Connecting to ${shown}`);

const pool = new Pool({
  connectionString: url,
  ssl: /supabase|amazonaws|neon|render/.test(url) ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 10000,
});

try {
  const { rows } = await pool.query('SELECT current_database() AS db, version() AS version');
  console.log(`  connected to "${rows[0].db}"`);
  console.log(`  ${rows[0].version.split(',')[0]}`);

  const t = await pool.query("SELECT to_regclass('public.stores') AS present");
  if (t.rows[0].present) {
    const s = await pool.query(
      'SELECT code, pg_size_pretty(length(snapshot::text)::bigint) AS size, updated_at FROM stores',
    );
    console.log(`  stores table exists, ${s.rowCount} row(s):`);
    for (const r of s.rows) {
      console.log(`    ${r.code}  ${r.size}  updated ${new Date(r.updated_at).toISOString()}`);
    }
  } else {
    console.log('  stores table not created yet — it is created on first boot.');
  }
  console.log('\nOK');
} catch (err) {
  console.error(`\nFailed: ${err.message}`);
  if (/self.signed|certificate/i.test(err.message)) {
    console.error('Hint: hosted Postgres needs TLS; enabled automatically for known hosts.');
  }
  if (/password|auth|SASL/i.test(err.message)) {
    console.error('Hint: the database password is not your Supabase account password.');
  }
  if (/ENOTFOUND|EAI_AGAIN/.test(err.message)) {
    console.error('Hint: check the host — Supabase poolers are aws-0-<region>.pooler.supabase.com.');
  }
  process.exitCode = 1;
} finally {
  await pool.end();
}
