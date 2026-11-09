import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager } from '@coko/server'

import Form from '../form.model'
import Group from '../../group/group.model'

describe('Form model', () => {
  let groupId: string
  let otherGroupId: string

  const createForm = async (
    category: string,
    purpose: string,
    formGroupId = groupId,
  ): Promise<Form> =>
    Form.insert({
      groupId: formGroupId,
      category,
      purpose,
      structure: {
        name: `${category} ${purpose}`,
        description: null,
        haspopup: 'false',
        popuptitle: null,
        popupdescription: null,
        children: [],
      },
    })

  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
    groupId = (await Group.insert({})).id
    otherGroupId = (await Group.insert({})).id
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  describe('findActiveInGroup', () => {
    it("returns the group's active submission, review and decision forms", async () => {
      const submission = await createForm('submission', 'submit')
      const review = await createForm('review', 'review')
      const decision = await createForm('decision', 'decision')
      await createForm('submission', 'other')
      await createForm('submission', 'submit', otherGroupId)

      const forms = await Form.findActiveInGroup(groupId)

      expect(forms.map(f => f.id).sort()).toEqual(
        [submission.id, review.id, decision.id].sort(),
      )
    })
  })

  describe('deactivateOthersInCategory', () => {
    it("sets purpose to 'other' on the category's other forms in the group", async () => {
      const active = await createForm('review', 'review')
      const previouslyActive = await createForm('review', 'review')
      const otherCategory = await createForm('decision', 'decision')
      const otherGroup = await createForm('review', 'review', otherGroupId)

      const count = await Form.deactivateOthersInCategory(
        'review',
        groupId,
        active.id,
      )

      expect(count).toBe(1)

      const purposeOf = async (form: Form): Promise<string> =>
        (await Form.findById(form.id)).purpose

      expect(await purposeOf(active)).toBe('review')
      expect(await purposeOf(previouslyActive)).toBe('other')
      expect(await purposeOf(otherCategory)).toBe('decision')
      expect(await purposeOf(otherGroup)).toBe('review')
    })
  })
})
