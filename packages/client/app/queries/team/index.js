import { gql } from '@apollo/client'

/*
Queries and mutations related to modifying properties relating to teams 
*/

const teamFields = `
  id
  displayName
  role
  objectId
  objectType
  members {
    id
    user {
      id
      username
    }
  }
`

export const CREATE_TEAM_MUTATION = gql`
  mutation($input: TeamInput!) {
    createTeam(input: $input) {
      ${teamFields}
    }
  }
`

export const UPDATE_TEAM_MUTATION = gql`
  mutation($id: ID!, $input: TeamInput) {
    updateTeam(id: $id, input: $input) {
      ${teamFields}
    }
  }
`

export const ASSIGN_USER_AS_AUTHOR = gql`
mutation($manuscriptId: ID!, $userId: ID!, $invitationId: ID!) {
  assignUserAsAuthor(manuscriptId: $manuscriptId, userId: $userId, invitationId: $invitationId ) {
    ${teamFields}
  }
}`

export const ASSIGN_USER_AS_REVIEWER = gql`
mutation($manuscriptId: ID!, $userId: ID!, $invitationId: ID, $isCollaborative: Boolean!) {
  addReviewer(manuscriptId: $manuscriptId, userId: $userId, invitationId: $invitationId, isCollaborative: $isCollaborative ) {
    ${teamFields}
  }
}`

export const UPDATE_REVIEWER_STATUS_MUTATION = gql`
  mutation ($manuscriptId: ID!, $status: String) {
    updateReviewerTeamMemberStatus(
      manuscriptId: $manuscriptId
      status: $status
    ) {
      id
      status
    }
  }
`

export const updateTeamMemberMutation = gql`
  mutation ($id: ID!, $input: String) {
    updateTeamMember(id: $id, input: $input) {
      id
      user {
        id
        username
        profilePicture
        isOnline
      }
      status
      isShared
    }
  }
`

export const updateCollaborativeTeamMemberMutation = gql`
  mutation ($manuscriptId: ID!, $input: String) {
    updateCollaborativeTeamMembers(manuscriptId: $manuscriptId, input: $input) {
      id
      user {
        id
        username
        profilePicture
        isOnline
      }
      status
      isShared
    }
  }
`
