import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager } from '@coko/server'

import CmsPage from '../cmsPage.model'
import Group from '../../group/group.model'

describe('CmsPage model', () => {
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

  describe('findInGroupWithFlaxConfig', () => {
    it("returns the group's pages ordered by title, with only the requested config", async () => {
      const group = await Group.insert({})
      const otherGroup = await Group.insert({})

      const headerConfig = { shownInMenu: true, sequenceIndex: 1 }
      const footerConfig = { shownInMenu: false, sequenceIndex: 2 }

      await CmsPage.insert({
        groupId: group.id,
        title: 'Beta',
        url: '/beta',
        content: 'secret',
        flaxHeaderConfig: headerConfig,
        flaxFooterConfig: footerConfig,
      })

      await CmsPage.insert({
        groupId: group.id,
        title: 'Alpha',
        url: '/alpha',
        content: '',
        flaxHeaderConfig: headerConfig,
        flaxFooterConfig: footerConfig,
      })

      await CmsPage.insert({
        groupId: otherGroup.id,
        title: 'Other',
        url: '/other',
        content: '',
        flaxHeaderConfig: headerConfig,
        flaxFooterConfig: footerConfig,
      })

      const pages = await CmsPage.findInGroupWithFlaxConfig(
        group.id,
        'flaxHeaderConfig',
      )

      expect(pages.map(p => p.title)).toEqual(['Alpha', 'Beta'])
      expect(pages[1].url).toBe('/beta')
      expect(pages[1].flaxHeaderConfig).toEqual(headerConfig)
      expect(pages[1].flaxFooterConfig).toBeUndefined()
      expect(pages[1].content).toBeUndefined()
    })
  })
})
