import { InMemoryCache, concat } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

import { startClient } from '@coko/client'

import { makeTheme } from './theme'
import routes from './Pages'

import './i18n'

const cacheConfig = {
  typePolicies: {
    Query: {
      fields: {
        tasks: {
          merge(existing, incoming) {
            return incoming
          },
        },
      },
    },
    ManuscriptMeta: {
      keyFields: ['manuscriptId'],
    },
    Manuscript: {
      fields: {
        formFieldsToPublish: {
          merge(existing, incoming) {
            return incoming
          },
        },
        tasks: {
          merge(existing, incoming) {
            return incoming
          },
        },
      },
    },
    ThreadedDiscussion: {
      fields: {
        threads: {
          merge(existing, incoming) {
            return incoming
          },
        },
      },
    },
    DiscussionThread: {
      fields: {
        comments: {
          merge(existing, incoming) {
            return incoming
          },
        },
      },
    },
    ThreadComment: {
      fields: {
        commentVersions: {
          merge(existing, incoming) {
            return incoming
          },
        },
      },
    },
    User: {
      fields: {
        teams: {
          merge(existing, incoming) {
            return incoming
          },
        },
      },
    },
    CurrentRole: {
      fields: {
        roles: {
          merge(existing, incoming) {
            return incoming
          },
        },
      },
    },
    File: {
      fields: {
        roles: {
          merge(existing, incoming) {
            return incoming
          },
        },
      },
    },
  },
}

const groupLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'group-id': localStorage.getItem('groupId') || null,
    },
  }
})

const makeApolloConfig = originalConfig => {
  const link = concat(groupLink, originalConfig.link)

  return {
    link,
    cache: new InMemoryCache(cacheConfig),
  }
}

const theme = makeTheme()

startClient(routes, theme, { makeApolloConfig })
