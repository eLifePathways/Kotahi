import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager } from '@coko/server'

import PublishedArtifact from '../publishedArtifact.model'
import Group from '../../group/group.model'
import Manuscript from '../../manuscript/manuscript.model'

describe('PublishedArtifact model', () => {
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
  })

  describe('deleteByExternalId', () => {
    it("deletes the manuscript's artifacts with the external id only", async () => {
      const group = await Group.insert({})
      const manuscript = await Manuscript.insert({ groupId: group.id })
      const otherManuscript = await Manuscript.insert({ groupId: group.id })

      const match = await PublishedArtifact.insert({
        manuscriptId: manuscript.id,
        platform: 'Hypothesis',
        externalId: 'abc',
      })

      const otherExternalId = await PublishedArtifact.insert({
        manuscriptId: manuscript.id,
        platform: 'Hypothesis',
        externalId: 'def',
      })

      const otherManuscriptArtifact = await PublishedArtifact.insert({
        manuscriptId: otherManuscript.id,
        platform: 'Hypothesis',
        externalId: 'abc',
      })

      const exists = async (id: string): Promise<boolean> =>
        !!(await PublishedArtifact.findById(id, { throwIfNotFound: false }))

      expect(
        await PublishedArtifact.deleteByExternalId(manuscript.id, 'abc'),
      ).toBe(1)
      expect(await exists(match.id)).toBe(false)
      expect(await exists(otherExternalId.id)).toBe(true)
      expect(await exists(otherManuscriptArtifact.id)).toBe(true)
    })
  })
})
