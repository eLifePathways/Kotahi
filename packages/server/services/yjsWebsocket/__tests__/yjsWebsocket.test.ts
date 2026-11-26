import type { AddressInfo } from 'net'

import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { WebSocket, type WebSocketServer } from 'ws'
import { db, config, createJWT, migrationManager } from '@coko/server'

import DbTestUtils from '../../../models/DbTestUtils'
import CollaborativeDoc from '../../../models/collaborative-doc/collaborativeDoc.model'
import Group from '../../../models/group/group.model'
import Manuscript from '../../../models/manuscript/manuscript.model'
import Review from '../../../models/review/review.model'
import Team from '../../../models/team/team.model'
import User from '../../../models/user/user.model'

import startYjsWebsocket from '../yjsWebsocket'

const UNAUTHORISED_CLOSE_CODE = 4401
const MESSAGE_SYNC = 0

// createJWT only reads `id` and `username`, but is typed with @coko/server's own User
const tokenFor = (user: User): string =>
  createJWT({ id: user.id, username: user.username } as Parameters<
    typeof createJWT
  >[0])

type ConnectionResult =
  | { type: 'message'; firstByte: number }
  | { type: 'close'; code: number }

/** Connects and resolves with whichever comes first: a message from the server or the socket closing. */
const connect = (url: string): Promise<ConnectionResult> =>
  new Promise((resolve, reject) => {
    const socket = new WebSocket(url)

    socket.on('message', (data: Buffer) => {
      resolve({ type: 'message', firstByte: data[0] })
      socket.close()
    })

    socket.on('close', code => resolve({ type: 'close', code }))
    socket.on('error', reject)
  })

const waitForCollaborativeDoc = async (
  objectId: string,
): Promise<CollaborativeDoc | undefined> => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    const doc = await CollaborativeDoc.findOne({ objectId })
    if (doc) return doc
    // eslint-disable-next-line no-await-in-loop
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
  }

  return undefined
}

describe('Yjs websocket server access', () => {
  let server: WebSocketServer
  let baseUrl: string

  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()

    // Listen on a free port rather than the configured one
    server = startYjsWebsocket({ port: 0 })

    await new Promise(resolve => {
      server.on('listening', resolve)
    })

    const { port } = server.address() as AddressInfo
    baseUrl = `ws://127.0.0.1:${port}`
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
  })

  afterAll(async () => {
    if (server) {
      server.clients.forEach(client => client.terminate())

      await new Promise(resolve => {
        server.close(resolve)
      })
    }

    await DbTestUtils.clearDb()
  })

  type SetupResult = {
    manuscript: Manuscript
    review: Review
    reviewer: User
    editor: User
    groupManager: User
    stranger: User
  }

  const setup = async (): Promise<SetupResult> => {
    const group = await Group.insert({})

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      shortId: 1,
    })

    const review = await Review.insert({
      manuscriptId: manuscript.id,
      isDecision: false,
      isCollaborative: true,
      jsonData: '{}',
    })

    const addTeamMember = async (
      role: string,
      displayName: string,
      objectId: string,
      objectType: string,
    ): Promise<User> => {
      const team = await Team.insert({
        objectId,
        objectType,
        role,
        displayName,
      })

      const user = await User.insert({})
      await Team.addMember(team.id, user.id)
      return user
    }

    const reviewer = await addTeamMember(
      'collaborativeReviewer',
      'Collaborative Reviewers',
      manuscript.id,
      'manuscript',
    )

    const editor = await addTeamMember(
      'editor',
      'Editor',
      manuscript.id,
      'manuscript',
    )

    const groupManager = await addTeamMember(
      'groupManager',
      'Group Manager',
      group.id,
      'group',
    )

    const stranger = await User.insert({})

    return { manuscript, review, reviewer, editor, groupManager, stranger }
  }

  const reviewUrl = (reviewId: string, query = ''): string =>
    `${baseUrl}/${reviewId}${query ? `?${query}` : ''}`

  it('refuses a connection without a token', async () => {
    const { review } = await setup()

    expect(await connect(reviewUrl(review.id, 'groupId=x'))).toEqual({
      type: 'close',
      code: UNAUTHORISED_CLOSE_CODE,
    })
  })

  it('refuses a connection with no query string at all', async () => {
    const { review } = await setup()

    expect(await connect(reviewUrl(review.id))).toEqual({
      type: 'close',
      code: UNAUTHORISED_CLOSE_CODE,
    })
  })

  it('refuses a connection with an invalid token', async () => {
    const { review } = await setup()

    expect(await connect(reviewUrl(review.id, 'token=not-a-jwt'))).toEqual({
      type: 'close',
      code: UNAUTHORISED_CLOSE_CODE,
    })
  })

  it('refuses a logged-in user with no role on the manuscript', async () => {
    const { review, stranger } = await setup()
    const token = tokenFor(stranger)

    expect(await connect(reviewUrl(review.id, `token=${token}`))).toEqual({
      type: 'close',
      code: UNAUTHORISED_CLOSE_CODE,
    })
  })

  it('refuses a document that is not a collaborative review', async () => {
    const { manuscript, reviewer } = await setup()

    const review = await Review.insert({
      manuscriptId: manuscript.id,
      isDecision: false,
      isCollaborative: false,
      jsonData: '{}',
    })

    const token = tokenFor(reviewer)

    expect(await connect(reviewUrl(review.id, `token=${token}`))).toEqual({
      type: 'close',
      code: UNAUTHORISED_CLOSE_CODE,
    })
  })

  it.each(['reviewer', 'editor', 'groupManager'] as const)(
    'lets the %s sync the review',
    async role => {
      const users = await setup()
      const token = tokenFor(users[role])

      expect(
        await connect(reviewUrl(users.review.id, `token=${token}`)),
      ).toEqual({ type: 'message', firstByte: MESSAGE_SYNC })
    },
  )

  it('stores the document against the manuscript group, not the one in the URL', async () => {
    const { manuscript, review, reviewer } = await setup()
    const token = tokenFor(reviewer)

    await connect(
      reviewUrl(
        review.id,
        `token=${token}&groupId=00000000-0000-4000-8000-000000000000&objectType=User`,
      ),
    )

    const doc = await waitForCollaborativeDoc(review.id)

    expect(doc?.groupId).toBe(manuscript.groupId)
    expect(doc?.objectType).toBe('Review')
  })
})
