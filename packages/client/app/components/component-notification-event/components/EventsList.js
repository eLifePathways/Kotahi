/* eslint-disable react/prop-types */

import { Clock, Plus, Power, Trash } from 'react-feather'
import styled from 'styled-components'
import { grid } from '@coko/client'
import { useTranslation } from 'react-i18next'
import { useBool, useString } from '../../../hooks/dataTypeHooks'
import {
  COLLAPSED_STATE_INIT,
  DRAFT_NOTIFICATION_SHAPE,
  FILTERS_LIST,
  T,
} from '../misc/constants'
import { ActionIcon, Col, Row } from '../misc/styleds'
import {
  ActionContainer as ActionsContainer,
  CleanButton,
  EmptyContainer,
  ListHeader,
  NavRoot,
  OptionListItem,
  OptionListItemButton,
  OptionsList,
} from '../../component-email-templates/misc/styleds'
import Each from '../../shared/Each'
import { arrIf } from '../../../shared/generalUtils'
import EventListControls from './EventListControls'
import { filterEventAndNotifications } from '../misc/helpers'
import { color } from '../../../theme'

const Root = styled(Col)`
  gap: 0;
  height: 100%;
  max-width: 30%;
  min-width: 30%;
  width: fit-content;
`

const StyledListHeader = styled(ListHeader)`
  background: none;
  border: none;
  color: var(--color-1);
  opacity: ${p => (p.$active ? 1 : 0.8)};
  overflow: hidden;
  padding-block: ${grid(1)};

  p {
    font-size: 14px;
    margin: 0;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: initial;
    white-space: nowrap;
  }
`

const EventSource = styled.div`
  --color-1: ${p => (p.$inactive ? '#888' : '#555')};
  background: #f4f5f7;
  border-bottom: 1px solid #ccc;
  border-left: 1px solid #ccc;
  color: var(--color-1);
  display: flex;
  justify-content: space-between;
  padding: 0 ${grid(0.5)};
  width: 100%;
`

const Nav = styled(NavRoot)`
  height: 100%;
  width: 100%;

  ::-webkit-scrollbar {
    width: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #999;
    border-radius: 2px;
  }

  ::-webkit-scrollbar-track {
    background: #ddd;
  }
`

const ListWrapper = styled(Col)`
  gap: 0;
  height: fit-content;
  z-index: 9;
`

const NotificationsList = styled(OptionsList)`
  opacity: ${p => (p.$active ? 1 : 0.5)};

  > :last-child {
    border-bottom-color: #ccc;
  }
`

const Actions = styled(ActionsContainer)`
  align-items: center;
  gap: 0;
  justify-content: center;
  padding-inline: ${grid(1.5)};

  svg {
    aspect-ratio: 1 / 1;
    height: 16px;
    pointer-events: none;
    stroke: #555;
  }
`

const StyledListItem = styled(OptionListItem)`
  background: ${p => (!p.$selected ? '#fbfbfb' : '#fff')};
  border-color: #ddd;
  /* border-left-color: ${p => (!p.$selected ? '#ccc' : 'transparent')}; */
  padding: ${grid(1.5)} ${grid(2.5)};
`

const ActionButton = styled(ActionIcon)`
  border: none;
  padding: 0;

  svg {
    fill: #fff0;
    height: 16px;
    width: 16px;
  }
`

const ListItemActionsContainer = styled(Row)`
  align-items: center;
  gap: 8px;
  width: fit-content;
`

const OptionButton = styled(OptionListItemButton)`
  p {
    text-decoration-color: ${color.error.base};
    text-decoration-style: double;
  }
`

const NotificationItem = ({
  isInactive,
  isSelected,
  handleDelete,
  toggleActive,
  selected,
  notification,
}) => {
  const { t } = useTranslation()
  const { delay, displayName, event, id, isDefault } = notification
  const name = displayName || t(T[event])

  return (
    <StyledListItem $selected={isSelected}>
      <OptionButton
        $warning={isInactive}
        onClick={() => {
          if (!notification.id && isInactive) return
          selected.set(notification)
        }}
        title={name}
      >
        <p>{name}</p>
      </OptionButton>
      {id && (
        <ListItemActionsContainer>
          {delay ? (
            <ActionButton $color="#555">
              <Clock />
            </ActionButton>
          ) : null}
          {!isDefault && (
            <ActionButton
              $color="#555"
              onClick={e => {
                e.stopPropagation()
                handleDelete(notification.id)
              }}
              title={t('common.Delete')}
            >
              <Trash />
            </ActionButton>
          )}
          <ActionButton
            $color={isInactive ? color.error.base : color.success.base}
            $disabled={!notification.emailTemplateId || !notification.recipient}
            onClick={e => {
              e.stopPropagation()
              toggleActive(notification.id)
            }}
            title={isInactive ? t('common.Activate') : t('common.Deactivate')}
          >
            <Power />
          </ActionButton>
        </ListItemActionsContainer>
      )}
    </StyledListItem>
  )
}

const EventsList = ({
  events,
  collapsedState,
  handleDelete,
  toggleActive,
  handleActivate,
  selected,
}) => {
  const { t } = useTranslation()
  const search = useString()

  const collapseAll = useBool({
    start: COLLAPSED_STATE_INIT,
    onToggle: state => {
      const newCollapsedState = { ...collapsedState.state }
      Object.keys(newCollapsedState).forEach(k => {
        newCollapsedState[k] = state
      })
      collapsedState.update(newCollapsedState)
    },
  })

  const filter = useString({
    start: 'all',
    values: FILTERS_LIST,
  })

  const createDraft = ({ target }) => {
    const { event: eventName } = target.dataset
    collapsedState.update({ [eventName]: false })
    selected.set({
      ...DRAFT_NOTIFICATION_SHAPE,
      event: eventName,
    })
  }

  return (
    <Root>
      <EventListControls
        collapseAll={collapseAll}
        filterKey={filter}
        search={search}
      />
      <Nav>
        <EmptyContainer style={{ background: '#f9f9f9' }} />
        <ListWrapper>
          <Each
            of={events}
            render={ev => {
              const { active: isActive, name, notifications } = ev

              const { excludeEvent, filteredNotifications } =
                filterEventAndNotifications(
                  filter.state,
                  notifications,
                  isActive,
                )

              if (excludeEvent) return null

              const searchToLC = search.state.toLowerCase()
              const srcEventToLC = t(T[name]).toLowerCase()
              const searchMatches = srcEventToLC.includes(searchToLC)

              if (!searchMatches) return null

              const displayDraft =
                !selected.state.id && selected?.state?.event === name

              const toggleCollapse = () => {
                collapsedState.update({
                  [name]: !collapsedState.state[name],
                })
              }

              const hasEvents = notifications.length > 0
              const sourceIsActive = isActive && hasEvents

              const notificationsRender = [
                ...filteredNotifications,
                ...arrIf(displayDraft, DRAFT_NOTIFICATION_SHAPE),
              ]

              return (
                <>
                  <EventSource $inactive={!sourceIsActive}>
                    <StyledListHeader
                      $active={sourceIsActive}
                      onClick={toggleCollapse}
                      title={t(T[name])}
                    >
                      <p>{t(T[name])}</p>
                    </StyledListHeader>
                    <Actions>
                      <CleanButton
                        $hide={!isActive}
                        data-event={name}
                        onClick={createDraft}
                        title={t('common.Create')}
                      >
                        <Plus style={{ height: '15px' }} />
                      </CleanButton>
                      <CleanButton
                        $hide={!hasEvents}
                        onClick={() => hasEvents && handleActivate(name)}
                        title={
                          isActive
                            ? t('common.Deactivate')
                            : t('common.Activate')
                        }
                      >
                        <Power
                          style={{
                            strokeWidth: '2px',
                            stroke: sourceIsActive
                              ? color.success.base
                              : color.error.base,
                          }}
                        />
                      </CleanButton>
                    </Actions>
                  </EventSource>

                  <NotificationsList
                    $active={!!sourceIsActive}
                    $collapsed={collapsedState.state[name]}
                  >
                    <Each
                      of={notificationsRender}
                      render={item => {
                        const isInactive = !sourceIsActive || !item.active
                        const isSelected = item.id === selected.state.id
                        return (
                          <NotificationItem
                            handleDelete={handleDelete}
                            isInactive={isInactive}
                            isSelected={isSelected}
                            notification={item}
                            selected={selected}
                            toggleActive={toggleActive}
                          />
                        )
                      }}
                    />
                  </NotificationsList>
                </>
              )
            }}
          />
        </ListWrapper>
      </Nav>
    </Root>
  )
}

export default EventsList
