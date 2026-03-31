const fs = require('fs')
const path = require('path')
const merge = require('lodash/merge')

const anyStyleResolvers = require('./anyStyle/anyStyle.resolvers')
const articleTemplatesResolvers = require('./articleTemplates/articleTemplates.resolvers')
const channelResolvers = require('./channel/channel.resolvers')
const cmsResolvers = require('./cms/cms.resolvers')
const coarResolvers = require('./coar/coar.resolvers')
const configResolvers = require('./config/config.resolvers')
const docmapResolvers = require('./docmap/docmap.resolvers')
const emailTemplateResolvers = require('./emailTemplate/emailTemplate.resolvers')
const fileResolvers = require('./file/file.resolvers')
const flaxResolvers = require('./flax/flax.resolvers')
const formResolvers = require('./form/form.resolvers')
const groupResolvers = require('./group/group.resolvers')
const handlebarsResolvers = require('./handlebars/handlebars.resolvers')
const invitationResolvers = require('./invitation/invitation.resolvers')
const jatsResolvers = require('./jats/jats.resolvers')
const localContextResolvers = require('./localContext/localContext.resolvers')
const manuscriptResolvers = require('./manuscript/manuscript.resolvers')
const messageResolvers = require('./message/message.resolvers')
const notificationResolvers = require('./notification/notification.resolvers')
const notificationUserOptionResolvers = require('./notificationUserOption/notificationUserOption.resolvers')
const openAiResolvers = require('./openAi/openAi.resolvers')
const orcidResolvers = require('./orcid/orcid.resolvers')
const payloadVerifierResolvers = require('./payloadVerifier/payloadVerifier.resolvers')
const pdfExportResolvers = require('./pdfExport/pdfExport.resolvers')
const publishedArtifactResolvers = require('./publishedArtifact/publishedArtifact.resolvers')
const publishingCollectionResolvers = require('./publishingCollection/publishingCollection.resolvers')
const referenceResolvers = require('./reference/reference.resolvers')
const reportResolvers = require('./report/report.resolvers')
const reviewResolvers = require('./review/review.resolvers')
const rorResolvers = require('./ror/ror.resolvers')
const taskResolvers = require('./task/task.resolvers')
const teamResolvers = require('./team/team.resolvers')
const threadedDiscussionResolvers = require('./threadedDiscussion/threadedDiscussion.resolvers')
const userResolvers = require('./user/user.resolvers')
const xsweetResolvers = require('./xsweet/xsweet.resolvers')

const typeDefFilePaths = [
  'anyStyle/anyStyle.graphql',
  'articleImportHistory/articleImportHistory.graphql',
  'articleImportSources/articleImportSources.graphql',
  'articleTemplates/articleTemplates.graphql',
  'channel/channel.graphql',
  'cms/cms.graphql',
  'coar/coar.graphql',
  'config/config.graphql',
  'docmap/docmap.graphql',
  'emailTemplate/emailTemplate.graphql',
  'file/file.graphql',
  'flax/flax.graphql',
  'form/form.graphql',
  'group/group.graphql',
  'handlebars/handlebars.graphql',
  'invitation/invitation.graphql',
  'jats/jats.graphql',
  'localContext/localContext.graphql',
  'manuscript/manuscript.graphql',
  'message/message.graphql',
  'notification/notification.graphql',
  'notificationUserOption/notificationUserOption.graphql',
  'openAi/openAi.graphql',
  'orcid/orcid.graphql',
  'payloadVerifier/payloadVerifier.graphql',
  'pdfExport/pdfExport.graphql',
  'publishedArtifact/publishedArtifact.graphql',
  'publishingCollection/publishingCollection.graphql',
  'reference/reference.graphql',
  'report/report.graphql',
  'review/review.graphql',
  'ror/ror.graphql',
  'task/task.graphql',
  'team/team.graphql',
  'threadedDiscussion/threadedDiscussion.graphql',
  'user/user.graphql',
  'xsweet/xsweet.graphql',
]

const createTotalTypeDefs = paths => {
  return paths
    .map(p => fs.readFileSync(path.join(__dirname, p), 'utf-8'))
    .join(' ')
}

const typeDefs = createTotalTypeDefs(typeDefFilePaths)

const resolvers = merge(
  {},
  anyStyleResolvers,
  articleTemplatesResolvers,
  channelResolvers,
  cmsResolvers,
  coarResolvers,
  configResolvers,
  docmapResolvers,
  emailTemplateResolvers,
  fileResolvers,
  flaxResolvers,
  formResolvers,
  groupResolvers,
  handlebarsResolvers,
  invitationResolvers,
  jatsResolvers,
  localContextResolvers,
  manuscriptResolvers,
  messageResolvers,
  notificationResolvers,
  notificationUserOptionResolvers,
  openAiResolvers,
  orcidResolvers,
  payloadVerifierResolvers,
  pdfExportResolvers,
  publishedArtifactResolvers,
  publishingCollectionResolvers,
  referenceResolvers,
  reportResolvers,
  reviewResolvers,
  rorResolvers,
  taskResolvers,
  teamResolvers,
  threadedDiscussionResolvers,
  userResolvers,
  xsweetResolvers,
)

module.exports = {
  typeDefs,
  resolvers,
}
