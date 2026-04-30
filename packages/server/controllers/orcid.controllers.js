const axios = require('axios')
const { config } = require('@coko/server')
const OrcidStrategy = require('passport-orcid')
const get = require('lodash/get')

const {
  clientUrl,
  serverUrl,
  createJWT,
  useTransaction,
  logger,
  request,
} = require('@coko/server')

const { Config, Group, Identity, Team, TeamMember, User } = require('../models')
const seekEvent = require('../services/notification.service')

const ORCID_API =
  /*
  config.get('auth-orcid').useSandboxedOrcid &&
  config.get('auth-orcid').useSandboxedOrcid.toLowerCase() === 'true'
    ? 'https://pub.sandbox.orcid.org/v3.0'
    : */ 'https://pub.orcid.org/v3.0'

const orcidValidate = async orcidId => {
  const isUrl = orcidId.startsWith('http://') || orcidId.startsWith('https://')
  const url = isUrl ? orcidId : `${ORCID_API}/${orcidId}`

  try {
    const response = await axios.get(url, {
      headers: {
        Accept: 'application/json',
      },
    })

    return response.status === 200
  } catch (error) {
    const { status, statusText } = error?.response || {}

    if (!status) throw new Error('Network Error')
    if (status === 404) return false
    throw new Error(`Error: ${status} - ${statusText}`)
  }
}

const addUserToAdminAndGroupAdminTeams = async (
  userId,
  groupId,
  options = {},
) => {
  const { trx } = options

  const groupAdminTeam = await Team.query(trx).findOne({
    role: 'groupAdmin',
    objectId: groupId,
    objectType: 'Group',
  })

  const adminTeam = await Team.query(trx).findOne({
    role: 'admin',
    global: true,
  })

  await TeamMember.query(trx).insert({ userId, teamId: adminTeam.id })
  await TeamMember.query(trx).insert({ userId, teamId: groupAdminTeam.id })
}

const addUserToUserTeam = async (userId, groupId) => {
  const userTeam = await Team.query().findOne({
    role: 'user',
    objectId: groupId,
    objectType: 'Group',
  })

  await TeamMember.query().insert({ userId, teamId: userTeam.id })
}

const addUserToGroupAdminTeam = async (userId, groupId, options = {}) => {
  const { trx } = options

  const groupAdminTeam = await Team.query(trx).findOne({
    role: 'groupAdmin',
    objectId: groupId,
    objectType: 'Group',
  })

  await TeamMember.query(trx).insert({ userId, teamId: groupAdminTeam.id })
}

const createOrcidStrategy = () => {
  const orcidBackURL = `${serverUrl}/auth/orcid/callback`

  return new OrcidStrategy(
    {
      sandbox:
        config.get('auth-orcid').useSandboxedOrcid &&
        config.get('auth-orcid').useSandboxedOrcid.toLowerCase() === 'true',
      scope: '/authenticate',
      // this works here only with webpack dev server's proxy (ie. clientUrl/auth -> serverUrl/auth)
      // or when the server and client are served from the same url
      callbackURL: orcidBackURL,
      passReqToCallback: true,
      ...config.get('auth-orcid'),
    },
    async (req, accessToken, refreshToken, params, profile, done) => {
      const urlParams = new URLSearchParams(req.query.state)
      const groupId = urlParams.get('group_id')

      // convert oauth response into a user object
      let user
      let firstLogin = false

      const activeConfig = await Config.getCached(groupId)

      try {
        user = await User.query()
          .joinRelated('identities')
          .where('identities.identifier', params.orcid)
          .where('identities.type', 'orcid')
          .throwIfNotFound()
          .first()
      } catch (err) {
        // swallow not found error
        if (err.name !== 'NotFoundError') {
          done(err)
          return
        }
      }

      let usersCountString
      let groupUsersCount

      try {
        usersCountString = (await User.query().count())[0].count
        groupUsersCount = await User.query()
          .joinRelated('teams')
          .where({ 'teams.objectId': groupId })
          .resultSize()
      } catch (err) {
        logger.error(err)
      }

      // TODO: Update the user details on every login, asynchronously
      try {
        await useTransaction(async trx => {
          if (!user) {
            user = await User.query(trx).insert({
              username: params.name,
            })

            const identity = await Identity.query(trx).insert({
              identifier: params.orcid,
              oauth: { accessToken, refreshToken },
              type: 'orcid',
              isDefault: true,
              userId: user.id,
            })

            if (
              usersCountString === '0' ||
              activeConfig.formData.user.isAdmin
            ) {
              await addUserToAdminAndGroupAdminTeams(user.id, groupId, {
                trx,
              })
            }

            // Do another request to the ORCID API for aff/name
            const userDetails = await fetchUserDetails(user, { trx })

            await identity.$query(trx).patchAndFetch({
              name: `${userDetails.firstName || ''} ${
                userDetails.lastName || ''
              }`,
              aff: userDetails.institution || '',
            })

            await user.$query(trx).patchAndFetch({
              email: userDetails.email || null,
            })

            firstLogin = true
          } else if (groupUsersCount === 0) {
            const isAlreadyAdmin = await Team.query(trx)
              .withGraphJoined('members')
              .findOne({
                userId: user.id,
                objectId: null,
                global: true,
                role: 'admin',
              })

            if (!isAlreadyAdmin) {
              await addUserToAdminAndGroupAdminTeams(user.id, groupId, {
                trx,
              })
            } else {
              await addUserToGroupAdminTeam(user.id, groupId, { trx })
            }
          }
        })
      } catch (err) {
        done(err)
        return
      }

      done(null, { ...user, firstLogin, groupId })
    },
  )
}

// convert API date object into Date
const toDate = date => {
  if (date === null) return new Date()

  const year = date.year.value
  const month = parseInt((date.month && date.month.value) || '1', 10) - 1
  const day = (date.day && date.day.value) || 1
  return new Date(year, month, day)
}

const orcidRequest = (identity, endpoint) => {
  const apiRoot =
    config.get('auth-orcid').useSandboxedOrcid &&
    config.get('auth-orcid').useSandboxedOrcid.toLowerCase() === 'true'
      ? 'https://pub.sandbox.orcid.org/v3.0'
      : 'https://pub.orcid.org/v3.0'

  return request({
    method: 'get',
    url: `${apiRoot}/${identity.identifier}/${endpoint}`,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${identity.oauth.accessToken}`,
    },
  })
}

const fetchUserDetails = async (user, options = {}) => {
  const { trx } = options

  const identity = await Identity.query(trx).findOne({
    userId: user.id,
    type: 'orcid',
  })

  logger.debug('processing response from orcid api')

  const [personResponse, employmentsResponse] = await Promise.all([
    orcidRequest(identity, 'person'),
    orcidRequest(identity, 'employments'),
  ])

  const firstName = get(personResponse, 'body.name.given-names.value')
  const lastName = get(personResponse, 'body.name.family-name.value')
  const email = get(personResponse, 'body.emails.email[0].email')

  const employments = get(employmentsResponse, 'body.employment-summary')

  const institution =
    employments && employments.length
      ? // sort by most recently ended
        employments
          .sort((a, b) => toDate(a['end-date']) - toDate(b['end-date']))
          .pop().organization.name
      : null

  logger.debug(`fetchUserDetails returning:
    first: ${firstName},
    last: ${lastName},
    email: ${email},
    institution: ${institution}`)

  return {
    firstName,
    lastName,
    email,
    institution,
  }
}

const handleOrcidOAuthResponse = async user => {
  const { id, username, groupId, isFirstLogin } = user

  const jwt = createJWT({ id, username })

  const group = await Group.query().findOne({
    id: groupId,
    isArchived: false,
  })

  if (!group) {
    throw new Error(`Group not found or archived!`)
  }

  const isAlreadyAdmin = await Team.query().withGraphJoined('members').findOne({
    userId: user.id,
    objectId: null,
    global: true,
    role: 'admin',
  })

  const activeConfig = await Config.getCached(groupId)

  // Based on configuration User Management -> All users are assigned Group Manager and Admin roles flag
  if (activeConfig.formData.user.isAdmin && !isAlreadyAdmin)
    await addUserToAdminAndGroupAdminTeams(user.id, groupId)

  const groupManagerTeam = await Team.query()
    .withGraphJoined('members')
    .select('role')
    .findOne({
      userId: user.id,
      objectId: groupId,
      objectType: 'Group',
      role: 'groupManager',
    })

  const isGroupManager = !!groupManagerTeam

  const userTeam = await Team.query()
    .withGraphJoined('members')
    .select('role')
    .findOne({
      userId: user.id,
      objectId: groupId,
      objectType: 'Group',
      role: 'user',
    })

  const isGroupUser = !!userTeam

  if (!isGroupUser) await addUserToUserTeam(user.id, groupId)

  let redirectionUrl
  const urlFrag = `/${group.name}`

  if (isFirstLogin) {
    redirectionUrl = `${urlFrag}/profile`
  } else if (isGroupManager) {
    redirectionUrl = `${urlFrag}${activeConfig.formData.dashboard.loginRedirectUrl}`
  } else {
    redirectionUrl = `${urlFrag}/dashboard`
  }

  if (isFirstLogin) {
    seekEvent('user-first-login', {
      user,
      groupId,
    })
  }

  const res = `${clientUrl}${urlFrag}/login?token=${jwt}&redirectUrl=${redirectionUrl}`

  return res
}

module.exports = {
  createOrcidStrategy,
  fetchUserDetails,
  handleOrcidOAuthResponse,
  orcidValidate,
}
