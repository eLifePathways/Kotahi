/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */

import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Action } from '../../pubsweet'
import { UserAvatar } from '../../component-avatar/src'
import {
  UserCombo,
  Primary,
  Secondary,
  UserInfo,
  Row,
  Cell,
  LastCell,
  MinimalSelect,
} from '../../shared'
import { ConfirmationModal } from '../../component-modal/src/ConfirmationModal'
import { convertTimestampToDateString } from '../../../shared/dateUtils'

const User = ({
  user,
  currentUser,
  deleteUser,
  setGlobalRole,
  setGroupRole,
}) => {
  const { t } = useTranslation()
  const roleOptions = []

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [roleConfirm, setRoleConfirm] = useState(null)

  const [roles, setRoles] = useState([])

  const isGroupAdmin = !!roles.find(r => r.value === 'groupAdmin')
  const isGroupManager = !!roles.find(r => r.value === 'groupManager')

  if (
    currentUser.globalRoles.includes('admin') &&
    !user.groupRoles.includes('groupManager') &&
    !user.groupRoles.includes('groupAdmin') &&
    !user.globalRoles.includes('admin')
  )
    roleOptions.push({
      value: 'user',
      label: t('common.roles.User'),
      scope: 'group',
      // We don't let someone unassign themselves from 'user' role unless they're also an admin
      isFixed:
        user.id === currentUser.id &&
        !currentUser.globalRoles.includes('admin'),
    })

  roleOptions.push(
    {
      value: 'groupManager',
      label: t('common.roles.Group Manager'),
      scope: 'group',
      // We don't let someone unassign themselves from 'groupManager' role unless they're also an admin
      isFixed:
        ((user.id === currentUser.id || isGroupAdmin) &&
          !currentUser.globalRoles.includes('admin')) ||
        (currentUser.globalRoles.includes('admin') && isGroupAdmin),
    },
    {
      value: 'groupAdmin',
      label: t('common.roles.Group Admin'),
      scope: 'group',
      // We don't let someone unassign themselves from 'groupAdmin' role unless they're also an admin
      isFixed:
        ((user.id === currentUser.id || isGroupManager) &&
          !currentUser.globalRoles.includes('admin')) ||
        (currentUser.globalRoles.includes('admin') && isGroupManager),
    },
    {
      value: 'admin',
      label: t('common.roles.Admin'),
      scope: 'global',
      // We don't let someone unassign themselves from 'admin' role;
      // and non-admins can't assign/unassign admin role
      isFixed:
        user.id === currentUser.id ||
        !currentUser.globalRoles.includes('admin'),
    },
  )

  useEffect(
    () =>
      setRoles(
        roleOptions.filter(
          option =>
            user.groupRoles.includes(option.value) ||
            user.globalRoles.includes(option.value),
        ),
      ),
    [user.groupRoles, user.globalRoles],
  )

  const onChangeRoles = (changedRoles, actionMeta) => {
    const differingRole = actionMeta.removedValue || actionMeta.option
    const isAdding = actionMeta.action === 'select-option'
    if (!differingRole) return

    const setFunc =
      differingRole.scope === 'global' ? setGlobalRole : setGroupRole

    setRoleConfirm({
      action: () => {
        setFunc({
          variables: {
            userId: user.id,
            role: differingRole.value,
            shouldEnable: isAdding,
          },
        })
        setRoles(changedRoles)
      },
      message: (
        <p>
          {isAdding ? (
            <Trans i18nKey="modals.assignUserRole.text">
              {{ role: differingRole.label }} {{ user: user.username }}
            </Trans>
          ) : (
            <Trans i18nKey="modals.removeUserRole.text">
              {{ role: differingRole.label }} {{ user: user.username }}
            </Trans>
          )}
        </p>
      ),
    })
  }

  return (
    <Row>
      <Cell>
        <UserCombo>
          <UserAvatar user={user} />
          <UserInfo>
            <Primary>{user?.username}</Primary>
            <Secondary>{`ORCID: ${user?.defaultIdentity.identifier}`}</Secondary>
          </UserInfo>
        </UserCombo>
      </Cell>
      <Cell>{convertTimestampToDateString(user.created)}</Cell>
      <Cell>
        {user.lastOnline ? convertTimestampToDateString(user.lastOnline) : '-'}
      </Cell>
      <Cell>
        <MinimalSelect
          captureMenuScroll
          isClearable={false}
          isMulti
          menuPortalTarget={document.querySelector('body')}
          noOptionsMessage={() => t('common.noOption')}
          onChange={onChangeRoles}
          options={roleOptions.filter(x => !x.isFixed)}
          placeholder={t('usersTable.None')}
          value={roles}
        />
        <ConfirmationModal
          cancelButtonText={t('usersTable.Cancel')}
          closeModal={() => setRoleConfirm(null)}
          confirmationAction={roleConfirm?.action}
          confirmationButtonText={t('usersTable.Yes')}
          isOpen={!!roleConfirm}
          message={roleConfirm?.message}
        />
      </Cell>
      <LastCell>
        {/* 
        Only admins can delete a user or groupManager; 
        admins cannot delete themselves; 
        groupManagers can only remove users with `user` or `groupManager` roles from a group */}
        {currentUser.globalRoles.includes('admin') &&
          currentUser.id !== user.id && (
            <Action onClick={() => setIsConfirmingDelete(true)}>
              {t('usersTable.Delete')}
            </Action>
          )}
      </LastCell>
      <ConfirmationModal
        cancelButtonText={t('modals.deleteUser.Cancel')}
        closeModal={() => setIsConfirmingDelete(false)}
        confirmationAction={() => deleteUser({ variables: { id: user.id } })}
        confirmationButtonText={t('modals.deleteUser.Delete')}
        isOpen={isConfirmingDelete}
        message={t('modals.deleteUser.Permanently delete user', {
          userName: user.username,
        })}
      />
    </Row>
  )
}

export default User
