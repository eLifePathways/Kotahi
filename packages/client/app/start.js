import { InMemoryCache, concat } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

import { startClient } from '@coko/client'

import { makeTheme } from './theme'
import routes from './DefaultPage'

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
        teams: {
          merge(existing, incoming) {
            return incoming
          },
        },
        authorFeedback: {
          merge(existing, incoming) {
            return { ...existing, ...incoming }
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
        storedObjects: {
          // storedObjects entries have no `id`, so Apollo can't normalize
          // them individually. Different queries (e.g. the manuscript
          // query vs the asset manager's file list query) select different
          // subsets of storedObjects fields, keyed by `type`. Without this
          // merge, whichever query writes last wins outright and silently
          // drops fields the other query needs, forcing it to refetch.
          merge(existing = [], incoming = []) {
            const merged = [...existing]

            incoming.forEach(incomingItem => {
              const index = merged.findIndex(
                item => item.type === incomingItem.type,
              )

              if (index > -1) {
                merged[index] = { ...merged[index], ...incomingItem }
              } else {
                merged.push(incomingItem)
              }
            })

            return merged
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
