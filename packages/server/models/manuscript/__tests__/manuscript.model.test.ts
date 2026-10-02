import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager } from '@coko/server'

import Manuscript from '../manuscript.model'
import Review from '../../review/review.model'
import Team from '../../team/team.model'
import User from '../../user/user.model'
import TeamMember from '../../teamMember/teamMember.model'
import Invitation from '../../invitation/invitation.model'

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

  describe('userIsReviewerOfAnyVersion', () => {
    it('is true for a reviewer of the manuscript', async () => {
      const manuscript = await Manuscript.insert({})
      const reviewer = await User.insert({})
      await Manuscript.addReviewer(manuscript.id, reviewer.id, null, false)

      expect(
        await Manuscript.userIsReviewerOfAnyVersion(manuscript.id, reviewer.id),
      ).toBe(true)
    })

    it('is true for a collaborative reviewer of the manuscript', async () => {
      const manuscript = await Manuscript.insert({})
      const reviewer = await User.insert({})
      await Manuscript.addReviewer(manuscript.id, reviewer.id, null, true)

      expect(
        await Manuscript.userIsReviewerOfAnyVersion(manuscript.id, reviewer.id),
      ).toBe(true)
    })

    // regression check
    it('is false for a first version when the user only reviews another first version', async () => {
      const manuscriptA = await Manuscript.insert({})
      const manuscriptB = await Manuscript.insert({})
      const reviewer = await User.insert({})
      await Manuscript.addReviewer(manuscriptA.id, reviewer.id, null, false)

      expect(
        await Manuscript.userIsReviewerOfAnyVersion(
          manuscriptB.id,
          reviewer.id,
        ),
      ).toBe(false)
    })

    it('is true for a first version when the user reviews a later version', async () => {
      const firstVersion = await Manuscript.insert({})

      const secondVersion = await Manuscript.insert({
        parentId: firstVersion.id,
      })

      const reviewer = await User.insert({})
      await Manuscript.addReviewer(secondVersion.id, reviewer.id, null, false)

      expect(
        await Manuscript.userIsReviewerOfAnyVersion(
          firstVersion.id,
          reviewer.id,
        ),
      ).toBe(true)
    })

    it('is true for a later version when the user reviews the first version', async () => {
      const firstVersion = await Manuscript.insert({})

      const secondVersion = await Manuscript.insert({
        parentId: firstVersion.id,
      })

      const reviewer = await User.insert({})
      await Manuscript.addReviewer(firstVersion.id, reviewer.id, null, false)

      expect(
        await Manuscript.userIsReviewerOfAnyVersion(
          secondVersion.id,
          reviewer.id,
        ),
      ).toBe(true)
    })

    it('is true for a later version when the user reviews a sibling version', async () => {
      const firstVersion = await Manuscript.insert({})

      const secondVersion = await Manuscript.insert({
        parentId: firstVersion.id,
      })

      const thirdVersion = await Manuscript.insert({
        parentId: firstVersion.id,
      })

      const reviewer = await User.insert({})
      await Manuscript.addReviewer(secondVersion.id, reviewer.id, null, false)

      expect(
        await Manuscript.userIsReviewerOfAnyVersion(
          thirdVersion.id,
          reviewer.id,
        ),
      ).toBe(true)
    })

    it('is false for a later version of a different manuscript', async () => {
      const manuscriptA = await Manuscript.insert({})
      const manuscriptB = await Manuscript.insert({})

      const manuscriptBSecondVersion = await Manuscript.insert({
        parentId: manuscriptB.id,
      })

      const reviewer = await User.insert({})
      await Manuscript.addReviewer(manuscriptA.id, reviewer.id, null, false)

      expect(
        await Manuscript.userIsReviewerOfAnyVersion(
          manuscriptBSecondVersion.id,
          reviewer.id,
        ),
      ).toBe(false)
    })

    it('is false for a member of a non-reviewer team', async () => {
      const manuscript = await Manuscript.insert({})
      const author = await User.insert({})

      const authorTeam = await Team.insert({
        objectId: manuscript.id,
        objectType: 'manuscript',
        role: 'author',
        displayName: 'Author',
      })

      await Team.addMember(authorTeam.id, author.id)

      expect(
        await Manuscript.userIsReviewerOfAnyVersion(manuscript.id, author.id),
      ).toBe(false)
    })

    it('is false when the manuscript does not exist', async () => {
      const manuscript = await Manuscript.insert({})
      const reviewer = await User.insert({})
      await Manuscript.addReviewer(manuscript.id, reviewer.id, null, false)

      expect(
        await Manuscript.userIsReviewerOfAnyVersion(
          '00000000-0000-0000-0000-000000000000',
          reviewer.id,
        ),
      ).toBe(false)
    })
  })
})
