import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager } from '@coko/server'

import Group from '../../../models/group/group.model'
import Config from '../../../models/config/config.model'
import { archiveOldManuscripts } from '../manuscriptCommsUtils'

describe('archiveOldManuscripts', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
    await db.destroy()
  })

  it('archivedOldManuscripts does not crash when archivePeriodDays is not set in the config', async () => {
    const group = await Group.insert({})

    await Config.insert({
      active: true,
      groupId: group.id,
      formData: {
        manuscript: {
          // archivePeriodDays intentionally omitted,
          // reproducing a config created before this field existed
        },
      },
    })

    const res = await archiveOldManuscripts(group.id)
    expect(res).not.toBeDefined()
  })
})
