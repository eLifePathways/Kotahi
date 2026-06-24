/* eslint-disable */

const Manuscript = require('../manuscript.model')
const Review = require('../../review/review.model')
const Team = require('../../team/team.model')
const User = require('../../user/user.model')

const { clearDb } = require('../../../scripts/resetDb')
const TeamMember = require('../../teamMember/teamMember.model')
const Invitation = require('../../invitation/invitation.model')

describe('Manuscript model', () => {
  beforeEach(async () => {
    await clearDb()
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

    const invitedReviews = await manuscript.getReviews('invited')

    expect(invitedReviews).toHaveLength(1)
    expect(invitedReviews[0].id).toBe(reviewOne.id)

    const acceptedReviews = await manuscript.getReviews('accepted')

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
      toEmail: reviewerThree.email,
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
})
