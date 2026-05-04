/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */

/* stylelint-disable color-function-notation, alpha-value-notation */

import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { useMutation } from '@apollo/client/react'
import { useTranslation } from 'react-i18next'
import EditMessageModal from './EditMessageModal'
import { ConfirmationModal } from '../../../component-modal/src/ConfirmationModal'
import { DELETE_MESSAGE, UPDATE_MESSAGE } from '../../../../queries'
import { Ellipsis } from './style'
import color from '../../../../theme/color'
import IsolatedMessageWithDetails from './IsolatedMessageWithDetails'
import { LooseColumn } from '../../../shared'

const DropdownContainer = styled.div`
  background-color: ${color.backgroundA};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: absolute;
  right: 0;
  top: -4px;
  width: 145px;
  z-index: 1000;
`

const DropdownItem = styled.div`
  color: ${color.text};
  cursor: pointer;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  padding: 6px 14px;

  &:hover {
    background-color: ${color.gray97};
  }
`

const ChatPostDropdown = ({
  show,
  message,
  currentUser = {},
  onDropdownHide = () => {},
}) => {
  const { globalRoles = [], groupRoles = [] } = currentUser
  const [isOpen, setIsOpen] = useState(show)
  const [isEditingMessage, setIsEditingMessage] = useState(false)
  const [isDeletingMessage, setIsDeletingMessage] = useState(false)

  const [deleteMessage] = useMutation(DELETE_MESSAGE)
  const [updateMessage] = useMutation(UPDATE_MESSAGE)

  const isAdmin = globalRoles.includes('admin')
  const isAuthor = message.user.username === currentUser.username
  const isGroupAdmin = groupRoles.includes('groupAdmin')
  const canDeletePost = isAuthor || isAdmin || isGroupAdmin
  const canEditPost = isAuthor
  const { t } = useTranslation()

  const handleEditConfirmation = async editedMessage => {
    try {
      await updateMessage({
        variables: {
          messageId: message.id,
          content: editedMessage,
        },
        // eslint-disable-next-line no-shadow
        update: (cache, { data: { updateMessage } }) => {
          cache.modify({
            id: cache.identify({
              __typename: 'Message',
              id: message.id,
            }),
            fields: {
              content: () => updateMessage.content,
            },
          })
        },
      })

      setIsEditingMessage(false)
    } catch (error) {
      console.error('Error updating message:', error)
    }
  }

  const handleDeleteConfirmation = async () => {
    try {
      await deleteMessage({
        variables: {
          messageId: message.id,
        },
        update: cache => {
          const cacheKey = cache.identify({
            id: message.id,
            __typename: 'Message',
          })

          cache.evict({ id: cacheKey })
        },
      })
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const hideDropdown = () => {
    setIsOpen(false)
    onDropdownHide()
  }

  const dropdownRef = useRef(null)

  useEffect(() => {
    setIsOpen(show)

    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        hideDropdown()
      }
    }

    window.addEventListener('click', handleClickOutside)

    return () => {
      window.removeEventListener('click', handleClickOutside)
    }
  }, [show])

  return (
    <>
      {isOpen && (
        <DropdownContainer ref={dropdownRef}>
          <Ellipsis
            className="dropdown-ellipsis"
            onClick={() => hideDropdown()}
          />
          <div>
            {canEditPost && (
              <DropdownItem onClick={() => setIsEditingMessage(true)}>
                {t('chat.edit')}
              </DropdownItem>
            )}
            {canDeletePost && (
              <DropdownItem onClick={() => setIsDeletingMessage(true)}>
                {t('chat.delete')}
              </DropdownItem>
            )}
          </div>
        </DropdownContainer>
      )}
      <ConfirmationModal
        closeModal={() => setIsDeletingMessage(false)}
        confirmationAction={handleDeleteConfirmation}
        confirmationButtonText={t('chat.delete')}
        isOpen={isDeletingMessage}
        message={
          <LooseColumn>
            {t(
              'modals.deleteMessage.Are you sure you want to delete this message?',
            )}
            <IsolatedMessageWithDetails message={message} />
          </LooseColumn>
        }
      />
      {isEditingMessage && (
        <EditMessageModal
          close={() => setIsEditingMessage(false)}
          message={message}
          onConfirm={handleEditConfirmation}
        />
      )}
    </>
  )
}

export default ChatPostDropdown
