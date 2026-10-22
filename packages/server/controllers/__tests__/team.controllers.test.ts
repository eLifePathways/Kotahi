import {
  describe,
  beforeAll,
  beforeEach,
  afterAll,
  it,
  expect,
  vi,
} from 'vitest'
import {
  db,
  config,
  DbTestUtils,
  migrationManager,
  jobManager,
} from '@coko/server'

import Group from '../../models/group/group.model'
import User from '../../models/user/user.model'
import Manuscript from '../../models/manuscript/manuscript.model'
import Team from '../../models/team/team.model'
import Channel from '../../models/channel/channel.model'
import { createTeam, updateTeam } from '../team.controllers'

const createManuscriptChannels = async (
  manuscriptId: string,
  groupId: string,
): Promise<void> => {
  await Channel.insert([
    { manuscriptId, groupId, topic: 'Manuscript discussion', type: 'all' },
    { manuscriptId, groupId, topic: 'Editorial discussion', type: 'editorial' },
  ])
}

describe('team.controllers events', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.spyOn(jobManager, 'sendToQueue').mockResolvedValue(undefined)
    await DbTestUtils.clearDb()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  describe('createTeam', () => {
    it('emits addedAsEditor for each editor member added to a new team', async () => {
      const group = await Group.insert({})
      const manuscript = await Manuscript.insert({
        groupId: group.id,
        shortId: 111,
      })

      await createManuscriptChannels(manuscript.id, group.id)

      const editorUser = await User.insert({})

      await createTeam(
        {
          role: 'editor',
          displayName: 'Editor',
          objectId: manuscript.id,
          objectType: 'manuscript',
          members: [{ user: { id: editorUser.id } }],
        },
        group.id,
      )

      expect(jobManager.sendToQueue).toHaveBeenCalledTimes(1)

      expect(jobManager.sendToQueue).toHaveBeenCalledWith('event-queue', {
        eventType: 'addedAsEditor',
        userId: editorUser.id,
        groupId: group.id,
        manuscriptId: manuscript.id,
        shortId: manuscript.shortId,
      })
    })

    it('does not emit an event for a non-editorial role', async () => {
      const group = await Group.insert({})
      const manuscript = await Manuscript.insert({
        groupId: group.id,
        shortId: 112,
      })

      await createManuscriptChannels(manuscript.id, group.id)

      const authorUser = await User.insert({})

      await createTeam(
        {
          role: 'author',
          displayName: 'Author',
          objectId: manuscript.id,
          objectType: 'manuscript',
          members: [{ user: { id: authorUser.id } }],
        },
        group.id,
      )

      expect(jobManager.sendToQueue).not.toHaveBeenCalled()
    })
  })

  describe('updateTeam', () => {
    it('emits addedAsEditor for a newly added editor member', async () => {
      const group = await Group.insert({})
      const manuscript = await Manuscript.insert({
        groupId: group.id,
        shortId: 113,
      })

      await createManuscriptChannels(manuscript.id, group.id)

      const existingEditor = await User.insert({})
      const newEditor = await User.insert({})

      const team = await Team.insert({
        objectId: manuscript.id,
        objectType: 'manuscript',
        role: 'editor',
        displayName: 'Editor',
      })

      await Team.addMember(team.id, existingEditor.id)

      await updateTeam(
        team.id,
        {
          role: 'editor',
          displayName: 'Editor',
          objectId: manuscript.id,
          objectType: 'manuscript',
          members: [
            { user: { id: existingEditor.id } },
            { user: { id: newEditor.id } },
          ],
        },
        group.id,
      )

      expect(jobManager.sendToQueue).toHaveBeenCalledTimes(1)

      expect(jobManager.sendToQueue).toHaveBeenCalledWith('event-queue', {
        eventType: 'addedAsEditor',
        userId: newEditor.id,
        groupId: group.id,
        manuscriptId: manuscript.id,
        shortId: manuscript.shortId,
      })
    })

    it('emits removedAsEditor for a removed editor member', async () => {
      const group = await Group.insert({})
      const manuscript = await Manuscript.insert({
        groupId: group.id,
        shortId: 114,
      })

      await createManuscriptChannels(manuscript.id, group.id)

      const remainingEditor = await User.insert({})
      const removedEditor = await User.insert({})

      const team = await Team.insert({
        objectId: manuscript.id,
        objectType: 'manuscript',
        role: 'editor',
        displayName: 'Editor',
      })

      await Team.addMember(team.id, remainingEditor.id)
      await Team.addMember(team.id, removedEditor.id)

      await updateTeam(
        team.id,
        {
          role: 'editor',
          displayName: 'Editor',
          objectId: manuscript.id,
          objectType: 'manuscript',
          members: [{ user: { id: remainingEditor.id } }],
        },
        group.id,
      )

      expect(jobManager.sendToQueue).toHaveBeenCalledTimes(1)

      expect(jobManager.sendToQueue).toHaveBeenCalledWith('event-queue', {
        eventType: 'removedAsEditor',
        userId: removedEditor.id,
        groupId: group.id,
        manuscriptId: manuscript.id,
        shortId: manuscript.shortId,
      })
    })
  })
})
