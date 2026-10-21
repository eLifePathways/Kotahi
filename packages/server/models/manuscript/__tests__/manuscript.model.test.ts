import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager, File } from '@coko/server'

import Manuscript from '../manuscript.model'
import Review from '../../review/review.model'
import Team from '../../team/team.model'
import User from '../../user/user.model'
import TeamMember from '../../teamMember/teamMember.model'
import Invitation from '../../invitation/invitation.model'
import Group from '../../group/group.model'
import Config from '../../config/config.model'

describe('Manuscript model', () => {
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

  it('gets reviews', async () => {
    const manuscript = await Manuscript.insert({})

    const reviewerOne = await User.insert({})
    const reviewerTwo = await User.insert({})
    const reviewerThree = await User.insert({})

    const reviewOne = await Review.insert({
      manuscriptId: manuscript.id,
      userId: reviewerOne.id,
    })

    const reviewTwo = await Review.insert({
      manuscriptId: manuscript.id,
      userId: reviewerTwo.id,
    })

    const reviewThree = await Review.insert({
      manuscriptId: manuscript.id,
      userId: reviewerThree.id,
    })

    const reviewerTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'reviewer',
      displayName: 'Reviewers',
    })

    await Team.addMember(reviewerTeam.id, reviewerOne.id, { status: 'invited' })
    await Team.addMember(reviewerTeam.id, reviewerTwo.id, {
      status: 'accepted',
    })
    await Team.addMember(reviewerTeam.id, reviewerThree.id, {
      status: 'accepted',
    })

    const reviews = await manuscript.getReviews()

    expect(reviews).toHaveLength(3)
    expect(reviews[0].id).toBe(reviewOne.id)
    expect(reviews[1].id).toBe(reviewTwo.id)
    expect(reviews[2].id).toBe(reviewThree.id)

    const invitedReviews = await manuscript.getReviews(['invited'])

    expect(invitedReviews).toHaveLength(1)
    expect(invitedReviews[0].id).toBe(reviewOne.id)

    const acceptedReviews = await manuscript.getReviews(['accepted'])

    expect(acceptedReviews).toHaveLength(2)
    expect(acceptedReviews[0].id).toBe(reviewTwo.id)
    expect(acceptedReviews[1].id).toBe(reviewThree.id)

    const allReviews = await manuscript.getReviews(['invited', 'accepted'])
    expect(allReviews).toHaveLength(3)
  })

  it('adds a reviewer', async () => {
    const manuscriptOne = await Manuscript.insert({})
    const reviewerOne = await User.insert({})
    const reviewerTwo = await User.insert({})

    let reviewerTeamOne = await Manuscript.addReviewer(
      manuscriptOne.id,
      reviewerOne.id,
      null,
      true,
    )

    expect(reviewerTeamOne.role).toBe('collaborativeReviewer')

    let reviewerTeamOneMembers = await TeamMember.query().where({
      teamId: reviewerTeamOne.id,
    })

    expect(reviewerTeamOneMembers.length).toBe(1)
    expect(reviewerTeamOneMembers[0].status).toBe('invited')

    reviewerTeamOne = await Manuscript.addReviewer(
      manuscriptOne.id,
      reviewerTwo.id,
      null,
      true,
    )

    reviewerTeamOneMembers = await TeamMember.query().where({
      teamId: reviewerTeamOne.id,
    })

    expect(reviewerTeamOneMembers.length).toBe(2)

    const manuscriptThree = await Manuscript.insert({})

    const reviewerThree = await User.insert({
      email: 'reviewer3@email.com',
      username: 'Reviewer Three',
    })

    const editor = await User.insert({})

    const inviteThree = await Invitation.insert({
      manuscriptId: manuscriptThree.id,
      toEmail: reviewerThree.email!,
      status: 'UNANSWERED',
      invitedPersonType: 'REVIEWER',
      invitedPersonName: reviewerThree.username,
      senderId: editor.id,
    })

    const reviewerTeamThree = await Manuscript.addReviewer(
      manuscriptThree.id,
      reviewerThree.id,
      inviteThree.id,
      false,
    )

    expect(reviewerTeamThree.role).toBe('reviewer')

    const reviewerTeamThreeMembers = await TeamMember.query().where({
      teamId: reviewerTeamThree.id,
    })

    expect(reviewerTeamThreeMembers.length).toBe(1)
    expect(reviewerTeamThreeMembers[0].status).toBe('accepted')
  })

  it('finds an editor image file by source hash', async () => {
    const manuscript = await Manuscript.insert({})
    const otherManuscript = await Manuscript.insert({})

    const storedObjects = [
      {
        type: 'original',
        key: 'abc.png',
        mimetype: 'image/png',
        extension: 'png',
        size: 1,
      },
    ]

    const image = await File.insert({
      name: 'abc.png',
      tags: ['manuscriptImage'],
      objectId: manuscript.id,
      meta: { sourceHash: 'hash-1' },
      storedObjects,
    })

    // Same hash, but wrong tag or wrong manuscript
    await File.insert({
      name: 'abc.png',
      tags: ['supplementary'],
      objectId: manuscript.id,
      meta: { sourceHash: 'hash-2' },
      storedObjects,
    })
    await File.insert({
      name: 'abc.png',
      tags: ['manuscriptImage'],
      objectId: otherManuscript.id,
      meta: { sourceHash: 'hash-3' },
      storedObjects,
    })

    const found = await Manuscript.findImageFileBySourceHash(
      manuscript.id,
      'hash-1',
    )

    expect(found?.id).toBe(image.id)

    expect(
      await Manuscript.findImageFileBySourceHash(manuscript.id, 'hash-2'),
    ).toBeUndefined()
    expect(
      await Manuscript.findImageFileBySourceHash(manuscript.id, 'hash-3'),
    ).toBeUndefined()
    expect(
      await Manuscript.findImageFileBySourceHash(manuscript.id, 'missing'),
    ).toBeUndefined()
  })

  it('points the new version source at its own copies of the images', async () => {
    const group = await Group.insert({})

    await Config.query().insert({
      active: true,
      groupId: group.id,
      formData: { submission: {} },
    })

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      submission: {},
    })

    const image = await File.insert({
      name: 'abc.png',
      tags: ['manuscriptImage'],
      objectId: manuscript.id,
      storedObjects: [
        {
          type: 'original',
          key: 'abc.png',
          mimetype: 'image/png',
          extension: 'png',
          size: 1,
        },
      ],
    })

    await Manuscript.query()
      .findById(manuscript.id)
      .patch({
        meta: {
          source: `<p><img src="x" data-fileid="${image.id}" /></p>`,
        },
      })

    const original = await Manuscript.query().findById(manuscript.id)
    const newVersion = await original.createNewVersion()

    const copies = await File.query().where({ objectId: newVersion.id })

    expect(copies).toHaveLength(1)
    expect(copies[0].id).not.toBe(image.id)

    expect(newVersion.meta.source).toBe(
      `<p><img src="x" data-fileid="${copies[0].id}" /></p>`,
    )
  })
})
