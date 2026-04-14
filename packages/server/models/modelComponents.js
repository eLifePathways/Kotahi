/**
 * For use by config/components.js
 */

const modelPaths = [
  'articleImportHistory',
  'articleImportSources',
  'articleTemplate',
  'blacklistEmail',
  'channel',
  'channelMember',
  'cmsFileTemplate',
  'cmsLayout',
  'cmsPage',
  'coarNotification',
  'config',
  'docmap',
  'emailTemplate',
  'file',
  'form',
  'group',
  'identity',
  'invitation',
  'manuscript',
  'message',
  'notificationDigest',
  'notificationUserOption',
  'publishedArtifact',
  'publishingCollection',
  'review',
  'task',
  'taskAlert',
  'taskEmailNotification',
  'taskEmailNotificationLog',
  'team',
  'teamMember',
  'threadedDiscussion',
  'token',
  'user',
  'collaborative-doc',
  'notification',
].map(name => `./models/${name}`)

module.exports = modelPaths
