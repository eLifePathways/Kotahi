/* eslint-disable import/no-extraneous-dependencies */

/**
 * Runs once in the main process.
 */

import { Client } from 'pg'

const sanitize = (value: string): string => value.replace(/[^a-zA-Z0-9_]/g, '_')

// Drop all dbs created for the workers in the worker db file.
export async function teardown(): Promise<void> {
  const baseDatabase = sanitize(process.env.POSTGRES_DB ?? 'kotahi_dev')

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

  const { rows } = await client.query<{ datname: string }>(
    'SELECT datname FROM pg_database WHERE datname LIKE $1',
    [`${baseDatabase}_test_%`],
  )

  await Promise.all(
    rows.map(({ datname }) =>
      client.query(`DROP DATABASE IF EXISTS "${datname}" WITH (FORCE)`),
    ),
  )

  await client.end()
}
