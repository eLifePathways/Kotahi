/**
 * Only the model files
 */

const ArticleImportHistory = require('./articleImportHistory/articleImportHistory.model')
const ArticleImportSources = require('./articleImportSources/articleImportSources.model')
const ArticleTemplate = require('./articleTemplate/articleTemplate.model')
const BlacklistEmail = require('./blacklistEmail/blacklistEmail.model')
const Channel = require('./channel/channel.model')
const ChannelMember = require('./channelMember/channelMember.model')
const CmsFileTemplate = require('./cmsFileTemplate/cmsFileTemplate.model')
const CmsLayout = require('./cmsLayout/cmsLayout.model')
const CmsPage = require('./cmsPage/cmsPage.model')
const CoarNotification = require('./coarNotification/coarNotification.model')
const CollaborativeDoc = require('./collaborative-doc/collaborativeDoc.model')
const Config = require('./config/config.model')
const Docmap = require('./docmap/docmap.model')
const EmailTemplate = require('./emailTemplate/emailTemplate.model')
const File = require('./file/file.model')
const Form = require('./form/form.model')
const Group = require('./group/group.model')
const Identity = require('./identity/identity.model')
const Invitation = require('./invitation/invitation.model')
const Manuscript = require('./manuscript/manuscript.model')
const Message = require('./message/message.model')
const Notification = require('./notification/notification.model')
const NotificationDigest = require('./notificationDigest/notificationDigest.model')
const NotificationUserOption = require('./notificationUserOption/notificationUserOption.model')
const PublishedArtifact = require('./publishedArtifact/publishedArtifact.model')
const PublishingCollection = require('./publishingCollection/publishingCollection.model')
const Review = require('./review/review.model')
const Task = require('./task/task.model')
const TaskAlert = require('./taskAlert/taskAlert.model')
const TaskEmailNotification = require('./taskEmailNotification/taskEmailNotification.model')
const TaskEmailNotificationLog = require('./taskEmailNotificationLog/taskEmailNotificationLog.model')
const Team = require('./team/team.model')
const TeamMember = require('./teamMember/teamMember.model')
const ThreadedDiscussion = require('./threadedDiscussion/threadedDiscussion.model')
const Token = require('./token/token.model')
const User = require('./user/user.model')

module.exports = {
  ArticleImportHistory,
  ArticleImportSources,
  ArticleTemplate,
  BlacklistEmail,
  Channel,
  ChannelMember,
  CmsFileTemplate,
  CmsLayout,
  CmsPage,
  CoarNotification,
  CollaborativeDoc,
  Config,
  Docmap,
  EmailTemplate,
  File,
  Form,
  Group,
  Identity,
  Invitation,
  Manuscript,
  Message,
  Notification,
  NotificationDigest,
  NotificationUserOption,
  PublishedArtifact,
  PublishingCollection,
  Review,
  Task,
  TaskAlert,
  TaskEmailNotification,
  TaskEmailNotificationLog,
  Team,
  TeamMember,
  ThreadedDiscussion,
  Token,
  User,
}
