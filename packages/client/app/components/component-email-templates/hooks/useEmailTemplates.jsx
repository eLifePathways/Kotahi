/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client/react'
import {
  GET_EMAIL_TEMPLATES,
  CREATE_EMAIL_TEMPLATE,
  DELETE_EMAIL_TEMPLATE,
  UPDATE_EMAIL_TEMPLATE,
} from '../../../queries'
import { safeCall } from '../../../shared/generalUtils'

/**
 * Custom hook for managing email templates using GraphQL queries and mutations.
 *
 * @param {Object} props - props.
 * @param {Function} props.onFetch - callback to trigger on onCompleted option for the emailTemplates query.
 * @param {Function} props.onCreate - callback to trigger on onCompleted option for the create mutation
 * @param {Function} props.onUpdate - callback to trigger on onCompleted option for the update mutation
 * @param {Function} props.onDelete - callback to trigger on onCompleted option for the delete mutation
 * @returns {Object} - The email templates data and functions to create, delete, and update email templates.
 */
const useEmailTemplates = ({ onFetch, onCreate, onUpdate, onDelete }) => {
  const [getTemplates, templatesData] = useLazyQuery(GET_EMAIL_TEMPLATES, {
    onCompleted: safeCall(onFetch),
  })

  const [createTemplate] = useMutation(CREATE_EMAIL_TEMPLATE, {
    refetchQueries: [{ query: GET_EMAIL_TEMPLATES }],
    onCompleted: safeCall(onCreate),
  })

  const [deleteTemplate] = useMutation(DELETE_EMAIL_TEMPLATE, {
    refetchQueries: [{ query: GET_EMAIL_TEMPLATES }],
    onCompleted: safeCall(onDelete),
  })

  const [updateTemplate] = useMutation(UPDATE_EMAIL_TEMPLATE, {
    refetchQueries: [{ query: GET_EMAIL_TEMPLATES }],
    onCompleted: safeCall(onUpdate),
  })

  useEffect(() => {
    getTemplates()
  }, [])

  return {
    templatesData,
    createTemplate,
    deleteTemplate,
    updateTemplate,
  }
}

export default useEmailTemplates
