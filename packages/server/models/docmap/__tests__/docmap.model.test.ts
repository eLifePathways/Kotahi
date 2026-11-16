import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, migrationManager } from '@coko/server'

import DbTestUtils from '../../DbTestUtils'
import Docmap from '../docmap.model'
import Group from '../../group/group.model'
import Manuscript from '../../manuscript/manuscript.model'

describe('Docmap model', () => {
  let groupId: string
  let otherGroupId: string
  let manuscriptId: string

  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
    groupId = (await Group.insert({})).id
    otherGroupId = (await Group.insert({})).id
    manuscriptId = (await Manuscript.insert({ groupId })).id
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  describe('findByDoi', () => {
    it('finds the docmap of the group whose external id ends with the DOI, ignoring case', async () => {
      const docmap = await Docmap.insert({
        groupId,
        manuscriptId,
        externalId: 'https://example.com/docmaps/10.1101/ABC',
        content: '{}',
      })

      await Docmap.insert({
        groupId: otherGroupId,
        manuscriptId,
        externalId: 'https://example.com/docmaps/10.1101/other',
        content: '{}',
      })

      expect((await Docmap.findByDoi(groupId, '10.1101', 'abc'))?.id).toBe(
        docmap.id,
      )
      expect(
        await Docmap.findByDoi(groupId, '10.1101', 'other'),
      ).toBeUndefined()
      expect(await Docmap.findByDoi(groupId, '10.1101', 'AB')).toBeUndefined()
    })
  })

  describe('patchByExternalId', () => {
    it('patches the docmaps with the external id in the group only', async () => {
      const externalId = 'https://example.com/docmaps/10.1101/abc'

      const match = await Docmap.insert({
        groupId,
        manuscriptId,
        externalId,
        content: 'old',
      })

      const otherGroup = await Docmap.insert({
        groupId: otherGroupId,
        manuscriptId,
        externalId,
        content: 'old',
      })

      const count = await Docmap.patchByExternalId(externalId, groupId, {
        content: 'new',
      })

      expect(count).toBe(1)
      expect((await Docmap.findById(match.id)).content).toBe('new')
      expect((await Docmap.findById(otherGroup.id)).content).toBe('old')
    })
  })
})
