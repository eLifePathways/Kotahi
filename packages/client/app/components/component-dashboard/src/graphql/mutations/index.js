import { gql } from '@apollo/client'

export default {
  deleteManuscriptMutation: gql`
    mutation ($id: ID!) {
      deleteManuscript(id: $id)
    }
  `,
  reviewerResponseMutation: gql`
    mutation ($currentUserId: ID!, $action: String, $teamId: ID!) {
      reviewerResponse(
        currentUserId: $currentUserId
        action: $action
        teamId: $teamId
      ) {
        id
        role
        displayName
        objectId
        objectType
        members {
          id
          user {
            id
            username
          }
          status
        }
      }
    }
  `,
  createManuscriptMutation: gql`
    mutation ($input: ManuscriptInput) {
      createManuscript(input: $input) {
        id
        created
        manuscriptVersions {
          id
        }
        teams {
          id
          role
          displayName
          objectId
          objectType
          members {
            id
            user {
              id
              username
            }
            status
          }
        }
        status
        reviews {
          open
          created
          user {
            id
            username
          }
        }
        meta {
          manuscriptId
          history {
            type
            date
          }
        }
      }
    }
  `,
  createNewTaskAlertsMutation: gql`
    mutation ($groupId: ID!) {
      createNewTaskAlerts(groupId: $groupId)
    }
  `,
  removeTaskAlertsForCurrentUserMutation: gql`
    mutation {
      removeTaskAlertsForCurrentUser
    }
  `,
  updateTab: gql`
    mutation ($tab: String) {
      updateRecentTab(tab: $tab) {
        id
        recentTab
      }
    }
  `,
  updateChatUI: gql`
    mutation ($state: Boolean!) {
      expandChat(state: $state) {
        id
        chatExpanded
      }
    }
  `,
  updateMenu: gql`
    mutation ($expanded: Boolean!) {
      updateMenuUI(expanded: $expanded) {
        id
        menuPinned
      }
    }
  `,
}
