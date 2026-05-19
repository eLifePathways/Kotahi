import { gql } from '@apollo/client'

export default {
  deleteManuscriptMutation: gql`
    mutation DeleteManuscript($id: ID!) {
      deleteManuscript(id: $id)
    }
  `,
  reviewerResponseMutation: gql`
    mutation ReviewerResponse(
      $currentUserId: ID!
      $action: String
      $teamId: ID!
    ) {
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
    mutation CreateManuscript($input: ManuscriptInput) {
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
    mutation CreateNewTaskAlerts($groupId: ID!) {
      createNewTaskAlerts(groupId: $groupId)
    }
  `,
  removeTaskAlertsForCurrentUserMutation: gql`
    mutation RemoveTaskAlertsForCurrentUser {
      removeTaskAlertsForCurrentUser
    }
  `,
  updateTab: gql`
    mutation UpdateRecentTab($tab: String) {
      updateRecentTab(tab: $tab) {
        id
        recentTab
      }
    }
  `,
  updateChatUI: gql`
    mutation ExpandChat($state: Boolean!) {
      expandChat(state: $state) {
        id
        chatExpanded
      }
    }
  `,
  updateMenu: gql`
    mutation UpdateMenu($expanded: Boolean!) {
      updateMenuUI(expanded: $expanded) {
        id
        menuPinned
      }
    }
  `,
}
