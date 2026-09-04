/* eslint-disable import/no-extraneous-dependencies */

/**
 * Runs before each test file's own code (per vitest worker). Points this
 * worker's `POSTGRES_DB` at a dedicated, per-worker database -- created here
 * if it doesn't already exist -- so that test files running in different
 * workers (fileParallelism) never share a database and can't step on each
 * other's tables/migrations. Files in the *same* worker still share this
 * database and run sequentially, same as before.
 *
 * Cleanup of these databases happens once, at the end of the whole run, in
 * vitest.setup.ts.
 *
 * Exclude from tsconfig because of top-level await (coko server still
 * transpiles to commonjs.
 */
import { Client } from 'pg'

const sanitize = (value: string): string => value.replace(/[^a-zA-Z0-9_]/g, '_')

const workerId = sanitize(process.env.VITEST_POOL_ID ?? '1')
const baseDatabase = process.env.POSTGRES_DB ?? 'kotahi_dev'
const workerDatabase = `${sanitize(baseDatabase)}_test_${workerId}`

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT
    ? Number(process.env.POSTGRES_PORT)
    : undefined,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: 'postgres',
})

await client.connect()

const { rows } = await client.query(
  'SELECT 1 FROM pg_database WHERE datname = $1',
  [workerDatabase],
)

if (rows.length === 0) {
  await client.query(`CREATE DATABASE "${workerDatabase}"`)
}

await client.end()

process.env.POSTGRES_DB = workerDatabase
