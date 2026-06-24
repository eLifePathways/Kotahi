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
    updated
    status
    isShared
    user {
      id
      username
      defaultIdentity {
        id
        identifier
      }
      profilePicture
      isOnline
    }
  }
`

export const CREATE_TEAM = gql`
  mutation CreateTeam($input: TeamInput!) {
    createTeam(input: $input) {
      ${teamFields}
    }
  }
`

export const UPDATE_TEAM = gql`
  mutation UpdateTeam($id: ID!, $input: TeamInput) {
    updateTeam(id: $id, input: $input) {
      ${teamFields}
    }
  }
`

export const ASSIGN_USER_AS_AUTHOR = gql`
  mutation AssignUserAsAuthor($manuscriptId: ID!, $userId: ID!, $invitationId: ID!) {
    assignUserAsAuthor(manuscriptId: $manuscriptId, userId: $userId, invitationId: $invitationId ) {
      ${teamFields}
    }
  }
`

export const ASSIGN_USER_AS_REVIEWER = gql`
  mutation AddReviewer($manuscriptId: ID!, $userId: ID!, $invitationId: ID, $isCollaborative: Boolean!) {
    addReviewer(manuscriptId: $manuscriptId, userId: $userId, invitationId: $invitationId, isCollaborative: $isCollaborative ) {
      ${teamFields}
    }
  }
`

export const UPDATE_REVIEWER_STATUS = gql`
  mutation UpdateReviewerTeamMemberStatus($manuscriptId: ID!, $status: String) {
    updateReviewerTeamMemberStatus(
      manuscriptId: $manuscriptId
      status: $status
    ) {
      id
      status
    }
  }
`

export const UPDATE_TEAM_MEMBER = gql`
  mutation UpdateTeamMember($id: ID!, $input: String) {
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

export const UPDATE_COLLABORATIVE_TEAM_MEMBER = gql`
  mutation UpdateCollaborativeTeamMembers($manuscriptId: ID!, $input: String) {
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

export const ASSIGN_AUTHOR_FOR_PROOFING = gql`
  mutation AssignAuthorForProofingManuscript($id: ID!) {
    assignAuthorForProofingManuscript(id: $id) {
      id
      status
    }
  }
`

export const SET_GLOBAL_ROLE = gql`
  mutation SetGlobalRole(
    $userId: ID!
    $role: String!
    $shouldEnable: Boolean!
  ) {
    setGlobalRole(userId: $userId, role: $role, shouldEnable: $shouldEnable) {
      id
      groupRoles
      globalRoles
    }
  }
`

export const SET_GROUP_ROLE = gql`
  mutation SetGroupRole($userId: ID!, $role: String!, $shouldEnable: Boolean!) {
    setGroupRole(userId: $userId, role: $role, shouldEnable: $shouldEnable) {
      id
      groupRoles
      globalRoles
    }
  }
`

export const ADD_REVIEWER = gql`
  mutation AddReviewer($manuscriptId: ID!, $userId: ID!, $isCollaborative: Boolean!) {
    addReviewer(manuscriptId: $manuscriptId, userId: $userId, isCollaborative: $isCollaborative) {
      ${teamFields}
    }
  }
`

export const REMOVE_AUTHOR = gql`
  mutation RemoveAuthor($manuscriptId: ID!, $userId: ID!) {
    removeAuthor(manuscriptId: $manuscriptId, userId: $userId) {
      ${teamFields}
    }
  }
`

export const REMOVE_REVIEWER = gql`
  mutation RemoveReviewer($manuscriptId: ID!, $userId: ID!) {
    removeReviewer(manuscriptId: $manuscriptId, userId: $userId) {
      ${teamFields}
    }
  }
`

export const NEW_TEAM_FRAGMENT = gql`
  fragment NewTeam on Team {
    id
    role
    members {
      id
      user {
        id
      }
    }
  }
`
