import { type Db } from '@coko/server'

/**
 * coar_notifications was created without a primary key, so some instances have
 * the same notification stored more than once. Remove copies that are identical
 * to another row, then add the key. Rows that share an id but differ are not
 * ours to choose between, so the migration stops instead.
 */
export async function up(db: Db): Promise<void> {
  return db.transaction(async trx => {
    await trx.raw(`
      DELETE FROM coar_notifications a
      USING coar_notifications b
      WHERE a.id = b.id
        AND a.ctid > b.ctid
        AND to_jsonb(a) = to_jsonb(b)
    `)

    const { rows: conflicting }: { rows: { id: string }[] } = await trx.raw(`
      SELECT id FROM coar_notifications GROUP BY id HAVING count(*) > 1
    `)

    if (conflicting.length) {
      throw new Error(
        `coar_notifications has rows that share an id but differ: ${conflicting
          .map(({ id }) => id)
          .join(', ')}`,
      )
    }

    await trx.raw('ALTER TABLE coar_notifications ADD PRIMARY KEY (id)')
  })
}

export async function down(db: Db): Promise<void> {
  return db.raw(
    'ALTER TABLE coar_notifications DROP CONSTRAINT coar_notifications_pkey',
  )
}
