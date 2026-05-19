const {
  channelUsersForMention,
  deleteUser,
  expandChat,
  getCurrentUser,
  getUser,
  getUsers,
  isUserOnline,
  paginatedUsers,
  profilePicture,
  searchUsers,
  sendEmail,
  setGlobalRole,
  setGroupRole,
  updateEmail,
  updateLanguage,
  updateMenuUI,
  updateRecentTab,
  updateUser,
  updateUsername,
  userIdentities,
} = require('../../../controllers/user.controllers')

module.exports = {
  Query: {
    async channelUsersForMention(_, { channelId }, ctx) {
      return channelUsersForMention(channelId, ctx.req.headers['group-id'])
    },

    async currentUser(_, __, ctx) {
      return getCurrentUser(ctx.userId, ctx.req.headers['group-id'])
    },

    async paginatedUsers(_, { sort, offset, limit }, ctx) {
      return paginatedUsers(
        ctx.userId,
        ctx.req.headers['group-id'],
        sort,
        offset,
        limit,
      )
    },

    async searchUsers(_, { teamId, query }) {
      return searchUsers(teamId, query)
    },

    async user(_, { id }, ctx) {
      return getUser(id, ctx.req.headers['group-id'])
    },

    async users(_, __, ctx) {
      return getUsers(ctx.req.headers['group-id'])
    },
  },

  Mutation: {
    async deleteUser(_, { id }, ctx) {
      return deleteUser(id, ctx.req.headers['group-id'])
    },

    async expandChat(_, { state }, ctx) {
      return expandChat(ctx.userId, state)
    },

    async sendEmail(_, { input }, ctx) {
      return sendEmail(input, ctx)
    },

    async setGlobalRole(_, { userId, role, shouldEnable }, ctx) {
      return setGlobalRole(
        userId,
        ctx.req.headers['group-id'],
        role,
        shouldEnable,
      )
    },

    async setGroupRole(_, { userId, role, shouldEnable }, ctx) {
      return setGroupRole(
        userId,
        ctx.req.headers['group-id'],
        role,
        shouldEnable,
      )
    },

    async updateEmail(_, { id, email }) {
      return updateEmail(id, email)
    },

    async updateLanguage(_, { id, preferredLanguage }) {
      return updateLanguage(id, preferredLanguage)
    },

    async updateMenuUI(_, { expanded }, ctx) {
      return updateMenuUI(ctx.userId, expanded)
    },

    async updateRecentTab(_, { tab }, ctx) {
      return updateRecentTab(ctx.userId, tab)
    },

    async updateUser(_, { id, input }) {
      return updateUser(id, input)
    },

    async updateUsername(_, { id, username }) {
      return updateUsername(id, username)
    },
  },

  User: {
    async defaultIdentity(user, _, ctx) {
      // TODO: Cypress test 002 fails with this optimisation. Needs further investigation
      if (user.defaultIdentity && user.defaultIdentity.id && user.email) {
        const { id, name, aff, type, identifier } = user.defaultIdentity
        const { email } = user
        return { id, name, aff, email, type, identifier }
      }

      if (!ctx?.loaders) return null
      return ctx.loaders.User.defaultIdentitiesLoader.load(user.id)
    },

    async identities(parent) {
      return userIdentities(parent)
    },

    async isOnline(parent) {
      return isUserOnline(parent)
    },

    async profilePicture(parent) {
      return profilePicture(parent)
    },
  },
}
