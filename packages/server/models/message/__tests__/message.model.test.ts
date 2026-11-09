import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager } from '@coko/server'

import Message from '../message.model'
import Channel from '../../channel/channel.model'
import Group from '../../group/group.model'
import User from '../../user/user.model'

/** Ensures consecutive inserts get distinct created timestamps */
const tick = async (): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, 5)
  })

describe('Message model', () => {
  let channelId: string
  let otherChannelId: string
  let userId: string

  const postMessages = async (
    count: number,
    toChannelId = channelId,
  ): Promise<Message[]> => {
    const messages: Message[] = []

    for (let i = 0; i < count; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await tick()

      messages.push(
        // eslint-disable-next-line no-await-in-loop
        await Message.insert({
          channelId: toChannelId,
          userId,
          content: `message ${i}`,
        }),
      )
    }

    return messages
  }

  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
    const group = await Group.insert({})
    channelId = (await Channel.insert({ groupId: group.id, topic: 'One' })).id

    otherChannelId = (await Channel.insert({ groupId: group.id, topic: 'Two' }))
      .id

    userId = (await User.insert({ username: 'poster' })).id
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  describe('findPageInChannel', () => {
    it('returns the newest messages with their user, and the total count', async () => {
      const messages = await postMessages(3)
      await postMessages(1, otherChannelId)

      const { messages: page, totalCount } = await Message.findPageInChannel(
        channelId,
        { first: 2 },
      )

      expect(page.map(m => m.id)).toEqual([messages[2].id, messages[1].id])
      expect(page[0].user.username).toBe('poster')
      expect(totalCount).toBe(3)
    })

    it('only returns messages created before the given date', async () => {
      const messages = await postMessages(3)

      const { messages: page, totalCount } = await Message.findPageInChannel(
        channelId,
        { first: 10, createdBefore: messages[2].created },
      )

      expect(page.map(m => m.id)).toEqual([messages[1].id, messages[0].id])
      expect(totalCount).toBe(2)
    })
  })

  describe('countCreatedAfter', () => {
    it('counts the messages in the channel created after the date', async () => {
      const messages = await postMessages(3)
      await postMessages(1, otherChannelId)

      expect(
        await Message.countCreatedAfter(channelId, messages[0].created),
      ).toBe(2)
    })
  })

  describe('findFirstCreatedAfter', () => {
    it('returns the id of the oldest message in the channel created after the date', async () => {
      const messages = await postMessages(3)

      const first = await Message.findFirstCreatedAfter(
        channelId,
        messages[0].created,
      )

      expect(first?.id).toBe(messages[1].id)
      expect(
        await Message.findFirstCreatedAfter(channelId, messages[2].created),
      ).toBeUndefined()
    })
  })

  describe('hasUserPostedInChannels', () => {
    it('is true only if the user posted in one of the channels', async () => {
      const otherUser = await User.insert({})
      await postMessages(1)

      expect(await Message.hasUserPostedInChannels(userId, [channelId])).toBe(
        true,
      )
      expect(
        await Message.hasUserPostedInChannels(userId, [otherChannelId]),
      ).toBe(false)
      expect(
        await Message.hasUserPostedInChannels(otherUser.id, [channelId]),
      ).toBe(false)
    })
  })
})
