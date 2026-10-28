import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, migrationManager, DbTestUtils } from '@coko/server'

const MIGRATION_BEFORE_PRIMARY_KEY =
  '1792576418-remap-version-image-file-ids.ts'

const offerId = '205dc110-39f6-4c70-ae59-af61dd24a471'
const undoId = '1473730f-7dbd-4063-b6e5-eac8f7d2b625'

type NotificationRow = {
  id: string
  payload: Record<string, unknown>
  created: string
}

const notification = (
  id: string,
  payload: Record<string, unknown> = {},
): NotificationRow => ({
  id,
  payload: { type: ['Offer', 'coar-notify:ReviewAction'], ...payload },
  created: '2025-12-04T11:22:34.771Z',
})

const countsById = async (): Promise<Record<string, number>> => {
  const { rows }: { rows: { id: string; count: number }[] } = await db.raw(
    'SELECT id, count(*)::int AS count FROM coar_notifications GROUP BY id',
  )

  return Object.fromEntries(rows.map(({ id, count }) => [id, count]))
}

describe('COAR notifications primary key migration', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
  })

  beforeEach(async () => {
    await DbTestUtils.dropAllTables()
    await migrationManager.migrate({ to: MIGRATION_BEFORE_PRIMARY_KEY })
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  it('removes identical copies and adds the primary key', async () => {
    await db('coar_notifications').insert([
      notification(offerId),
      notification(offerId),
      notification(offerId),
      notification(undoId, { type: ['Undo', 'coar-notify:ReviewAction'] }),
    ])

    await migrationManager.migrate({ step: 1 })

    expect(await countsById()).toEqual({ [offerId]: 1, [undoId]: 1 })

    await expect(
      db('coar_notifications').insert(notification(offerId)),
    ).rejects.toThrow(/coar_notifications_pkey/)
  })

  it('stops, changing nothing, when rows share an id but differ', async () => {
    await db('coar_notifications').insert([
      notification(offerId),
      notification(offerId),
      notification(offerId, { inReplyTo: 'urn:uuid:other' }),
    ])

    await expect(migrationManager.migrate({ step: 1 })).rejects.toThrow(
      `share an id but differ: ${offerId}`,
    )

    // The identical copy is still there, as the transaction rolled back
    expect(await countsById()).toEqual({ [offerId]: 3 })
  })

  it('drops the primary key on rollback', async () => {
    await db('coar_notifications').insert(notification(offerId))

    await migrationManager.migrate({ step: 1 })
    await migrationManager.rollback({ step: 1 })

    await db('coar_notifications').insert(notification(offerId))

    expect(await countsById()).toEqual({ [offerId]: 2 })
  })
})
