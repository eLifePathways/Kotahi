import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, migrationManager } from '@coko/server'

import DbTestUtils from '../../DbTestUtils'
import ChannelMember from '../channelMember.model'
import Channel from '../../channel/channel.model'
import Group from '../../group/group.model'
import Manuscript from '../../manuscript/manuscript.model'
import User from '../../user/user.model'

describe('ChannelMember model', () => {
  let groupId: string

  const membersOf = async (channelId: string): Promise<ChannelMember[]> =>
    (await ChannelMember.find({ channelId })).result

  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
    groupId = (await Group.insert({})).id
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  describe('insertOrUpdateLastViewed', () => {
    it('inserts new members and updates lastViewed of existing ones', async () => {
      const channel = await Channel.insert({ groupId, topic: 'Topic' })
      const existingUser = await User.insert({})
      const newUser = await User.insert({})
      const oldDate = '2020-01-01T00:00:00.000Z'

      await ChannelMember.insert({
        channelId: channel.id,
        userId: existingUser.id,
        lastViewed: oldDate,
      })

      await ChannelMember.insertOrUpdateLastViewed([
        { channelId: channel.id, userId: existingUser.id, lastViewed: oldDate },
        {
          channelId: channel.id,
          userId: newUser.id,
          lastViewed: new Date().toISOString(),
        },
      ])

      const members = await membersOf(channel.id)

      expect(members.map(m => m.userId).sort()).toEqual(
        [existingUser.id, newUser.id].sort(),
      )

      const existing = members.find(m => m.userId === existingUser.id)

      expect(
        new Date(existing?.lastViewed as string).getTime(),
      ).toBeGreaterThan(new Date(oldDate).getTime())
    })
  })

  describe('deleteByChannelIds', () => {
    it('removes the members of the given channels only', async () => {
      const channel = await Channel.insert({ groupId, topic: 'One' })
      const otherChannel = await Channel.insert({ groupId, topic: 'Two' })
      const user = await User.insert({})

      await ChannelMember.insert({
        channelId: channel.id,
        userId: user.id,
        lastViewed: new Date().toISOString(),
      })
      await ChannelMember.insert({
        channelId: otherChannel.id,
        userId: user.id,
        lastViewed: new Date().toISOString(),
      })

      expect(await ChannelMember.deleteByChannelIds([channel.id])).toBe(1)
      expect(await membersOf(channel.id)).toHaveLength(0)
      expect(await membersOf(otherChannel.id)).toHaveLength(1)
    })
  })

  describe('deleteForUserInManuscriptChannels', () => {
    it("removes the user from the manuscript's channels of the given type", async () => {
      const manuscript = await Manuscript.insert({ groupId })
      const otherManuscript = await Manuscript.insert({ groupId })
      await Manuscript.createChannels(manuscript.id, groupId)
      await Manuscript.createChannels(otherManuscript.id, groupId)
      const user = await User.insert({})
      const otherUser = await User.insert({})

      const channels = await Manuscript.getChannels(manuscript.id)
      const otherChannels = await Manuscript.getChannels(otherManuscript.id)

      await Promise.all(
        [...channels, ...otherChannels].flatMap(channel =>
          [user, otherUser].map(u =>
            ChannelMember.insert({
              channelId: channel.id,
              userId: u.id,
              lastViewed: new Date().toISOString(),
            }),
          ),
        ),
      )

      const count = await ChannelMember.deleteForUserInManuscriptChannels(
        user.id,
        manuscript.id,
        'editorial',
      )

      expect(count).toBe(1)

      const editorial = channels.find(c => c.type === 'editorial')!
      const all = channels.find(c => c.type === 'all')!

      expect((await membersOf(editorial.id)).map(m => m.userId)).toEqual([
        otherUser.id,
      ])
      expect(await membersOf(all.id)).toHaveLength(2)

      await Promise.all(
        otherChannels.map(async channel =>
          expect(await membersOf(channel.id)).toHaveLength(2),
        ),
      )
    })
  })

  describe('findInChannelExcludingUser', () => {
    it('returns the other members of the channel', async () => {
      const channel = await Channel.insert({ groupId, topic: 'Topic' })
      const user = await User.insert({})
      const otherUser = await User.insert({})
      await ChannelMember.insert({
        channelId: channel.id,
        userId: user.id,
        lastViewed: new Date().toISOString(),
      })
      await ChannelMember.insert({
        channelId: channel.id,
        userId: otherUser.id,
        lastViewed: new Date().toISOString(),
      })

      const members = await ChannelMember.findInChannelExcludingUser(
        channel.id,
        user.id,
      )

      expect(members.map(m => m.userId)).toEqual([otherUser.id])
    })
  })

  describe('markViewed', () => {
    it('updates lastViewed and clears lastAlertTriggeredTime for the member', async () => {
      const channel = await Channel.insert({ groupId, topic: 'Topic' })
      const user = await User.insert({})
      const otherUser = await User.insert({})
      const oldDate = '2020-01-01T00:00:00.000Z'

      const member = await ChannelMember.insert({
        channelId: channel.id,
        userId: user.id,
        lastViewed: oldDate,
        lastAlertTriggeredTime: oldDate,
      })

      const otherMember = await ChannelMember.insert({
        channelId: channel.id,
        userId: otherUser.id,
        lastViewed: oldDate,
      })

      expect(await ChannelMember.markViewed(channel.id, user.id)).toBe(1)

      const updated = await ChannelMember.findById(member.id)
      const untouched = await ChannelMember.findById(otherMember.id)

      expect(new Date(updated.lastViewed as string).getTime()).toBeGreaterThan(
        new Date(oldDate).getTime(),
      )
      expect(updated.lastAlertTriggeredTime).toBeNull()
      expect(new Date(untouched.lastViewed as string).getTime()).toBe(
        new Date(oldDate).getTime(),
      )
    })
  })
})
