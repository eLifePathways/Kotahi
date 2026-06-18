import { gql } from '@apollo/client'

export const GET_EVENTS = gql`
  query GetEvents {
    events {
      name
      active
      notifications {
        id
        event
        notificationType
        emailTemplateId
        ccEmails
        subject
        isDefault
        groupId
        displayName
        recipient
        active
        delay
      }
    }
  }
`

export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($input: CreateNotificationInput!) {
    createNotification(input: $input) {
      id
      event
      notificationType
      emailTemplateId
      ccEmails
      subject
      isDefault
      groupId
      displayName
      recipient
      active
      delay
    }
  }
`

export const UPDATE_NOTIFICATION = gql`
  mutation UpdateNotification($id: ID!, $input: UpdateNotificationInput!) {
    updateNotification(id: $id, input: $input) {
      id
      event
      notificationType
      emailTemplateId
      ccEmails
      subject
      isDefault
      groupId
      displayName
      recipient
      active
      delay
    }
  }
`

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`

export const SET_EVENT_ACTIVE = gql`
  mutation SetEventActive($name: String!) {
    setEventActive(name: $name)
  }
`

export const SET_NOTIFICATION_ACTIVE = gql`
  mutation SetNotificationActive($id: ID!) {
    setNotificationActive(id: $id) {
      id
      event
      notificationType
      emailTemplateId
      ccEmails
      subject
      isDefault
      groupId
      displayName
      recipient
      active
      delay
    }
  }
`
