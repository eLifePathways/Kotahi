/* eslint-disable react-hooks/exhaustive-deps */

import { useLazyQuery, useMutation } from '@apollo/client/react'
import { useEffect } from 'react'
import {
  CREATE_NOTIFICATION,
  DELETE_NOTIFICATION,
  GET_EVENTS,
  SET_EVENT_ACTIVE,
  SET_NOTIFICATION_ACTIVE,
  UPDATE_NOTIFICATION,
} from '../graphql/graphql'
import { safeCall } from '../../../shared/generalUtils'

const useNotifications = (options = {}) => {
  const { onFetch, onCreate, onDelete, onUpdate, onSetNotificationActive } =
    options

  const [getEvents, eventsData] = useLazyQuery(GET_EVENTS, {
    fetchPolicy: 'network-only',
    onCompleted: ({ events }) => safeCall(onFetch)(events),
  })

  const [create] = useMutation(CREATE_NOTIFICATION, {
    fetchPolicy: 'no-cache',
    refetchQueries: [{ query: GET_EVENTS }],
    onCompleted: ({ createNotification }) =>
      safeCall(onCreate)(createNotification),
  })

  const [remove] = useMutation(DELETE_NOTIFICATION, {
    fetchPolicy: 'no-cache',
    refetchQueries: [{ query: GET_EVENTS }],
    onCompleted: ({ deleteNotification }) =>
      safeCall(onDelete)(deleteNotification),
  })

  const [update] = useMutation(UPDATE_NOTIFICATION, {
    fetchPolicy: 'no-cache',
    refetchQueries: [{ query: GET_EVENTS }],
    onCompleted: ({ updateNotification }) =>
      safeCall(onUpdate)(updateNotification),
  })

  const [setEventActive] = useMutation(SET_EVENT_ACTIVE, {
    fetchPolicy: 'no-cache',
    refetchQueries: [{ query: GET_EVENTS }],
  })

  const [setNotificationActiveMutation] = useMutation(SET_NOTIFICATION_ACTIVE, {
    fetchPolicy: 'network-only',
    refetchQueries: [{ query: GET_EVENTS }],
    onCompleted: ({ setNotificationActive }) =>
      safeCall(onSetNotificationActive)(setNotificationActive),
  })

  useEffect(() => {
    getEvents()
  }, [])

  return {
    getEvents,
    eventsData,
    createNotification: create,
    deleteNotification: remove,
    updateNotification: update,
    setEventActive,
    setNotificationActive: setNotificationActiveMutation,
  }
}

export default useNotifications
