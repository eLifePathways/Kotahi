import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager } from '@coko/server'

import Review from '../review.model'
import Manuscript from '../../manuscript/manuscript.model'
import Team from '../../team/team.model'
import User from '../../user/user.model'

const addCollaborativeTeam = async (
  manuscriptId: string,
  userIds: string[],
): Promise<void> => {
  const team = await Team.insert({
    objectId: manuscriptId,
    objectType: 'manuscript',
    role: 'collaborativeReviewer',
    displayName: 'Collaborative Reviewers',
  })

  for (const userId of userIds) {
    // eslint-disable-next-line no-await-in-loop
    await Team.addMember(team.id, userId)
  }
}

describe('Review model', () => {
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

  it('gets the users of solo and collaborative reviews', async () => {
    const manuscript = await Manuscript.insert({})
    const otherManuscript = await Manuscript.insert({})
    const solo = await User.insert({ username: 'Solo' })
    const collabOne = await User.insert({ username: 'Collab one' })
    const collabTwo = await User.insert({ username: 'Collab two' })

    await addCollaborativeTeam(manuscript.id, [collabOne.id, collabTwo.id])

    const reviews = [
      { manuscriptId: manuscript.id, userId: solo.id, isCollaborative: false },
      { manuscriptId: manuscript.id, userId: null, isCollaborative: true },
      // No collaborative team on this manuscript
      { manuscriptId: otherManuscript.id, userId: null, isCollaborative: true },
      // Imported reviews may reference users that don't exist
      {
        manuscriptId: manuscript.id,
        userId: '5b2f5c4e-0c2a-4b7e-9d0e-6f1d2c3b4a59',
        isCollaborative: false,
      },
      { manuscriptId: manuscript.id, userId: null, isCollaborative: false },
    ]

    const usersOfReviews = await Review.getUsersOfReviews(reviews)

    expect(usersOfReviews.map(users => users.map(u => u.id).sort())).toEqual([
      [solo.id],
      [collabOne.id, collabTwo.id].sort(),
      [],
      [],
      [],
    ])
  })

  it('orders reviews by username, then id', async () => {
    const manuscript = await Manuscript.insert({})
    const zed = await User.insert({ username: 'zed' })
    const amy = await User.insert({ username: 'Amy' })

    const zedReview = await Review.insert({
      manuscriptId: manuscript.id,
      userId: zed.id,
    })

    const amyReview = await Review.insert({
      manuscriptId: manuscript.id,
      userId: amy.id,
    })

    const ordered = await Review.orderReviewPerUsername([zedReview, amyReview])

    expect(ordered.map(r => r.id)).toEqual([amyReview.id, zedReview.id])
    expect(ordered.map(r => r.username)).toEqual(['Amy', 'zed'])
  })
})
