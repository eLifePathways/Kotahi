import { describe, afterEach, beforeAll, afterAll, it, expect } from 'vitest'
import gql from 'graphql-tag'
import {
  createGraphqlTestServer,
  migrationManager,
  db,
  config,
  DbTestUtils,
} from '@coko/server'

import { Group, User, UserNotification } from '../../../../models'

const USER_NOTIFICATIONS_QUERY = gql`
  query UserNotifications($limit: Int) {
    userNotifications(limit: $limit) {
      totalCount
      notifications {
        id
        eventType
      }
    }
  }
`

const DISMISS_NOTIFICATION_MUTATION = gql`
  mutation DismissUserNotification($id: ID!) {
    dismissUserNotification(id: $id)
  }
`

const DISMISS_ALL_NOTIFICATIONS_MUTATION = gql`
  mutation DismissAllUserNotifications {
    dismissAllUserNotifications
  }
`

type GroupHeader = {
  'group-id': string
}

type RequestReq = {
  headers: GroupHeader
}

type RequestContext = {
  userId: string
  req: RequestReq
}

const contextFor = (userId?: string, groupId?: string): RequestContext => ({
  userId,
  req: {
    headers: {
      'group-id': groupId,
    },
  },
})

describe('UserNotification API', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
  })

  afterEach(async () => {
    await DbTestUtils.clearDb()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  describe('userNotifications query', () => {
    it('returns real notification data with schema-correct field and enum values', async () => {
      const group = await Group.insert({})
      const user = await User.insert({})

      const notification = await UserNotification.insert({
        userId: user.id,
        groupId: group.id,
        eventType: 'addedAsEditor',
        data: {},
      })

      const gqlServer = await createGraphqlTestServer()

      const result = await gqlServer.executeOperation(
        { query: USER_NOTIFICATIONS_QUERY, variables: { limit: 10 } },
        { contextValue: contextFor(user.id, group.id) },
      )

      if (result.body.kind !== 'single') {
        throw new Error('Expected single result, got incremental')
      }

      expect(result.body.singleResult.errors).toBeUndefined()

      expect(result.body.singleResult.data?.userNotifications).toEqual({
        totalCount: 1,
        notifications: [{ id: notification.id, eventType: 'addedAsEditor' }],
      })
    })

    it('rejects unauthenticated requests', async () => {
      const group = await Group.insert({})

      const gqlServer = await createGraphqlTestServer()

      const result = await gqlServer.executeOperation(
        { query: USER_NOTIFICATIONS_QUERY },
        { contextValue: contextFor(undefined, group.id) },
      )

      if (result.body.kind !== 'single') {
        throw new Error('Expected single result, got incremental')
      }

      expect(result.body.singleResult.errors).toBeTruthy()
      expect(result.body.singleResult.data?.userNotifications).toBeFalsy()
    })
  })

  describe('dismissUserNotification mutation', () => {
    it('dismisses a notification owned by the caller', async () => {
      const group = await Group.insert({})
      const user = await User.insert({})

      const notification = await UserNotification.insert({
        userId: user.id,
        groupId: group.id,
        eventType: 'addedAsEditor',
        data: {},
      })

      const gqlServer = await createGraphqlTestServer()

      const result = await gqlServer.executeOperation(
        {
          query: DISMISS_NOTIFICATION_MUTATION,
          variables: { id: notification.id },
        },
        { contextValue: contextFor(user.id, group.id) },
      )

      if (result.body.kind !== 'single') {
        throw new Error('Expected single result, got incremental')
      }

      expect(result.body.singleResult.errors).toBeUndefined()
      expect(result.body.singleResult.data?.dismissUserNotification).toBe(true)

      expect(
        await UserNotification.query().findById(notification.id),
      ).toBeUndefined()
    })

    it('rejects dismissal by a user who does not own the notification', async () => {
      const group = await Group.insert({})
      const owner = await User.insert({})
      const otherUser = await User.insert({})

      const notification = await UserNotification.insert({
        userId: owner.id,
        groupId: group.id,
        eventType: 'addedAsEditor',
        data: {},
      })

      const gqlServer = await createGraphqlTestServer()

      const result = await gqlServer.executeOperation(
        {
          query: DISMISS_NOTIFICATION_MUTATION,
          variables: { id: notification.id },
        },
        { contextValue: contextFor(otherUser.id, group.id) },
      )

      if (result.body.kind !== 'single') {
        throw new Error('Expected single result, got incremental')
      }

      expect(result.body.singleResult.errors).toBeTruthy()

      expect(
        await UserNotification.query().findById(notification.id),
      ).toBeDefined()
    })
  })

  describe('dismissAllUserNotifications mutation', () => {
    it('dismisses all notifications for the authenticated user', async () => {
      const group = await Group.insert({})
      const user = await User.insert({})

      const notification = await UserNotification.insert({
        userId: user.id,
        groupId: group.id,
        eventType: 'addedAsEditor',
        data: {},
      })

      const gqlServer = await createGraphqlTestServer()

      const result = await gqlServer.executeOperation(
        { query: DISMISS_ALL_NOTIFICATIONS_MUTATION },
        { contextValue: contextFor(user.id, group.id) },
      )

      if (result.body.kind !== 'single') {
        throw new Error('Expected single result, got incremental')
      }

      expect(result.body.singleResult.errors).toBeUndefined()

      expect(result.body.singleResult.data?.dismissAllUserNotifications).toBe(
        true,
      )

      expect(
        await UserNotification.query().findById(notification.id),
      ).toBeUndefined()
    })

    it('rejects unauthenticated requests', async () => {
      const group = await Group.insert({})

      const gqlServer = await createGraphqlTestServer()

      const result = await gqlServer.executeOperation(
        { query: DISMISS_ALL_NOTIFICATIONS_MUTATION },
        { contextValue: contextFor(undefined, group.id) },
      )

      if (result.body.kind !== 'single') {
        throw new Error('Expected single result, got incremental')
      }

      expect(result.body.singleResult.errors).toBeTruthy()

      expect(
        result.body.singleResult.data?.dismissAllUserNotifications,
      ).toBeFalsy()
    })
  })
})
