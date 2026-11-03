import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager } from '@coko/server'

import EmailTemplate from '../emailTemplate.model'
import Group from '../../group/group.model'

const emailContent = (
  description: string,
  subject: string,
): EmailTemplate['emailContent'] => ({
  description,
  subject,
  body: '<p>Body</p>',
  cc: '',
  ccEditors: false,
})

describe('EmailTemplate model', () => {
  let groupId: string
  let otherGroupId: string

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

  describe('findByDescription', () => {
    it('finds templates of the group and type with the description', async () => {
      const match = await EmailTemplate.insert({
        groupId,
        emailTemplateType: 'manuscript',
        emailContent: emailContent('Reviewer invitation', 'Subject'),
      })

      await EmailTemplate.insert({
        groupId,
        emailTemplateType: 'system',
        emailContent: emailContent('Reviewer invitation', 'Subject'),
      })

      await EmailTemplate.insert({
        groupId: otherGroupId,
        emailTemplateType: 'manuscript',
        emailContent: emailContent('Reviewer invitation', 'Subject'),
      })

      await EmailTemplate.insert({
        groupId,
        emailTemplateType: 'manuscript',
        emailContent: emailContent('Author invitation', 'Subject'),
      })

      const found = await EmailTemplate.findByDescription(
        groupId,
        'manuscript',
        'Reviewer invitation',
      )

      expect(found.map(t => t.id)).toEqual([match.id])
    })
  })

  describe('patchBySubject', () => {
    it('patches the templates of the group with the subject', async () => {
      const match = await EmailTemplate.insert({
        groupId,
        emailTemplateType: 'manuscript',
        emailContent: emailContent('One', 'Old subject'),
      })

      const otherSubject = await EmailTemplate.insert({
        groupId,
        emailTemplateType: 'manuscript',
        emailContent: emailContent('Two', 'Another subject'),
      })

      const otherGroup = await EmailTemplate.insert({
        groupId: otherGroupId,
        emailTemplateType: 'manuscript',
        emailContent: emailContent('Three', 'Old subject'),
      })

      const count = await EmailTemplate.patchBySubject(groupId, 'Old subject', {
        emailTemplateType: 'system',
      })

      expect(count).toBe(1)
      expect((await EmailTemplate.findById(match.id)).emailTemplateType).toBe(
        'system',
      )
      expect(
        (await EmailTemplate.findById(otherSubject.id)).emailTemplateType,
      ).toBe('manuscript')
      expect(
        (await EmailTemplate.findById(otherGroup.id)).emailTemplateType,
      ).toBe('manuscript')
    })
  })
})
