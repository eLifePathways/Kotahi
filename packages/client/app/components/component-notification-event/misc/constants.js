export const COLLAPSED_STATE_INIT = false

export const DRAFT_NOTIFICATION_SHAPE = {
  id: '',
  event: {},
  notificationType: 'email',
  recipient: '',
  emailTemplateId: '',
  ccEmails: [],
  displayName: 'New Notification',
  active: false,
  subject: '',
  isDefault: false, // means not recipient settable and not deletable
  delay: 0,
}

export const FILTERS_LIST = [
  'all',
  'active',
  'inactive',
  'activeEvents',
  'inactiveEvents',
  'delayed',
  // 'email',
]
/** "Notification Events" translations map */
export const T = {
  // Titles
  title: 'notificationPage.title',
  // Common
  save: 'common.Save',
  delete: 'common.Delete',
  update: 'common.Update',
  activate: 'common.Activate',
  deactivate: 'common.Deactivate',
  modified: 'common.Modified',
  // Event
  eventSettings: 'notificationPage.eventSettings.title',
  displayName: 'notificationPage.eventSettings.displayName',
  emailTemplateId: 'notificationPage.eventSettings.emailTemplate',
  delay: 'notificationPage.eventSettings.delay',
  notificationType: 'notificationPage.eventSettings.type',
  event: 'notificationPage.eventSettings.event',
  // Email Settings
  emailSettings: 'notificationPage.emailSettings.title',
  ccEmails: 'notificationPage.emailSettings.ccEmails',
  recipient: 'notificationPage.emailSettings.recipient',
  subject: 'notificationPage.emailSettings.subject',
  // Filters
  all: 'notificationPage.filters.all',
  active: 'notificationPage.filters.active',
  inactive: 'notificationPage.filters.inactive',
  delayed: 'notificationPage.filters.delayed',
  activeEvents: 'notificationPage.filters.activeEvents',
  inactiveEvents: 'notificationPage.filters.inactiveEvents',
  // Messages
  events: 'notificationPage.messages.events',
  noEvents: 'notificationPage.messages.noEvents',
  noSelectedEvent: 'notificationPage.messages.noSelectedEvent',
  // Event descriptions
  'manuscript-submit': 'notificationPage.eventDescriptions.manuscript-submit',
  'manuscript-new-version':
    'notificationPage.eventDescriptions.manuscript-new-version',
  'manuscript-import': 'notificationPage.eventDescriptions.manuscript-import',
  'manuscript-publish': 'notificationPage.eventDescriptions.manuscript-publish',
  // #endregion Manuscript
  // #region Review
  'review-invitation': 'notificationPage.eventDescriptions.review-invitation',
  'review-invitation-follow-up':
    'notificationPage.eventDescriptions.review-invitation-follow-up',
  'review-accepted': 'notificationPage.eventDescriptions.review-accepted',
  'review-rejected': 'notificationPage.eventDescriptions.review-rejected',
  'review-completed': 'notificationPage.eventDescriptions.review-completed',
  // #endregion Review
  // #region Collaborative Review
  'collaborative-review-invitation':
    'notificationPage.eventDescriptions.collaborative-review-invitation',
  'collaborative-review-invitation-follow-up':
    'notificationPage.eventDescriptions.collaborative-review-invitation-follow-up',
  'collaborative-review-accepted':
    'notificationPage.eventDescriptions.collaborative-review-accepted',
  'collaborative-review-rejected':
    'notificationPage.eventDescriptions.collaborative-review-rejected',
  'collaborative-review-lock':
    'notificationPage.eventDescriptions.collaborative-review-lock',
  'collaborative-review-unlock':
    'notificationPage.eventDescriptions.collaborative-review-unlock',
  // #endregion Collaborative Review
  // #region Author Invitation
  'author-invitation': 'notificationPage.eventDescriptions.author-invitation',
  'author-accepted': 'notificationPage.eventDescriptions.author-accepted',
  'author-rejected': 'notificationPage.eventDescriptions.author-rejected',
  'author-invitation-follow-up':
    'notificationPage.eventDescriptions.author-invitation-follow-up',
  // #endregion Author Invitation
  // #region Chat
  'chat-unread': 'notificationPage.eventDescriptions.chat-unread',
  'chat-mention': 'notificationPage.eventDescriptions.chat-mention',
  // #endregion Chat
  // #region Author Proofing
  'author-proofing-assign':
    'notificationPage.eventDescriptions.author-proofing-assign',
  'author-proofing-submit-feedback':
    'notificationPage.eventDescriptions.author-proofing-submit-feedback',
  // #endregion Author Proofing
  // #region Team assignment
  'team-editor-assigned':
    'notificationPage.eventDescriptions.team-editor-assigned',
  'team-editor-unassigned':
    'notificationPage.eventDescriptions.team-editor-unassigned',
  // #endregion Team assignment
  // #region User
  'user-first-login': 'notificationPage.eventDescriptions.user-first-login',
  'user-set-group-role':
    'notificationPage.eventDescriptions.user-set-group-role',
  'user-delete': 'notificationPage.eventDescriptions.user-delete',
  // #endregion User
  // #region Decision form
  'decision-form-make-decision':
    'notificationPage.eventDescriptions.decision-form-make-decision',
  'decision-form-make-decision-with-verdict':
    'notificationPage.eventDescriptions.decision-form-make-decision-with-verdict',
  'decision-form-complete-comment':
    'notificationPage.eventDescriptions.decision-form-complete-comment',
  // #endregion Decision form
}
