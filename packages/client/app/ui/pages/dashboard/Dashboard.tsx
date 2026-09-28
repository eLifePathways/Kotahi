import { useEffect, useRef, useState, type ReactNode } from 'react'
import styled, { css } from 'styled-components'
import { AnimatePresence, m } from 'framer-motion'
import { th, grid, Link as UILink, Result } from '@coko/client'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { Spinner } from '../../../components/shared/Spinner'
import CommsErrorBanner from '../../../components/shared/CommsErrorBanner'
import Badge from '../../shared/Badge'
import Page from '../../shared/Page'
import {
  Activity,
  ArrowRight,
  Broom,
  ChevronLeft,
  ChevronRight,
  Close,
} from '../../base/Icons'

/**
 * TO DO
 * - test task action cards
 * - worth reusing code between this and card grid?
 * - use translations for ui elements
 * - accessibility
 * - css variables
 * - New submission button
 * - Is there any configuration related to the dashboard?
 * - Back to dashboard links
 * - Limit activity list
 */

/**
 * Future cases:
 * - when an invitation expires or a reviewer declines an invitation, the editor might need to invite someone else, which is an action to take
 * - if we add the concept of minimum amount of reviews, we could tell an editor that there aren't enough reviews pending / reviewers invited for this manuscript
 * - if we add review deadlines, we could tell a reviwer that their review is overdue or close to overdue (can this functionality be done as a task?)
 * - stale manuscripts: no activity for N days
 * - unread chat messages (if we keep chat)
 */

// #region constants
type ActionType =
  | 'authorSubmit'
  | 'authorRevise'
  | 'authorSubmitRevision'
  | 'reviewerRespond'
  | 'reviewerSubmit'
  | 'editorDecide'
  | 'taskAlmostOverdue'
  | 'taskOverdue'

type ActionColor = 'colorPrimary' | 'colorWarning' | 'colorError'

type ActionTypeData = {
  label: string
  color: ActionColor
}

const actionTypes: Record<ActionType, ActionTypeData> = {
  authorSubmit: {
    label: 'Submit',
    color: 'colorPrimary',
  },
  authorRevise: {
    label: 'Revise',
    color: 'colorWarning',
  },
  authorSubmitRevision: {
    label: 'Submit revision',
    color: 'colorWarning',
  },
  reviewerRespond: {
    label: 'Review invitation',
    color: 'colorWarning',
  },
  reviewerSubmit: {
    label: 'Review',
    color: 'colorPrimary',
  },
  editorDecide: {
    label: 'Decide on',
    color: 'colorPrimary',
  },
  taskAlmostOverdue: {
    label: 'Task almost overdue',
    color: 'colorWarning',
  },
  taskOverdue: {
    label: 'Task overdue',
    color: 'colorError',
  },
}

type ActionSummaryPhrase = (count: number) => string

const actionSummaryPhrases: Record<ActionType, ActionSummaryPhrase> = {
  authorSubmit: count =>
    `${count} submission${count === 1 ? '' : 's'} pending completion`,
  authorRevise: count =>
    `${count} manuscript${count === 1 ? '' : 's'} pending revision`,
  authorSubmitRevision: count =>
    `${count} revision${count === 1 ? '' : 's'} pending submission`,
  reviewerRespond: count =>
    `${count} reviewer invitation${count === 1 ? '' : 's'} waiting on you`,
  reviewerSubmit: count => `${count} review${count === 1 ? '' : 's'} pending`,
  editorDecide: count =>
    `${count} editor decision${count === 1 ? '' : 's'} pending`,
  taskAlmostOverdue: count =>
    `${count} task${count === 1 ? '' : 's'} almost overdue`,
  taskOverdue: count => `${count} task${count === 1 ? '' : 's'} overdue`,
}

const joinWithAnd = (items: string[]): string => {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return items.join(' and ')

  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1)

const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

dayjs.extend(relativeTime)

const relativeTimeFrom = (isoDate: string): string => dayjs(isoDate).fromNow()
// #endregion constants

// #region main-styles
const Wrapper = styled.div`
  background: ${th('colorWallpaper')};
  display: flex;
  flex-direction: column;
  gap: ${grid(5)};
`

const Link = styled(UILink)`
  display: block;
  height: 100%;
`

const IconWrapper = styled.div`
  position: absolute;
  right: ${grid(3)};
  bottom: ${grid(2)};

  opacity: 0;
  transition: opacity 0.3s ease;

  > span[role='img'] {
    font-size: 2rem;
    color: ${th('colorPrimary')};
  }
`

const Card = styled.div`
  background-color: ${th('colorBackground')};
  padding: ${grid(5)};
  border-radius: ${th('borderRadius')};
  box-shadow: ${th('boxShadow')};
  transition: box-shadow 0.2s ease;
  position: relative;

  &:hover,
  ${Link}:focus & {
    box-shadow: 0 0 0 3px ${th('colorPrimary')};
  }

  &:hover ${IconWrapper}, ${Link}:focus & ${IconWrapper} {
    opacity: 1;
  }
`
// #endregion main-styles

// #region greeting-card
const GreetingCard = styled.div`
  background-color: ${th('colorPrimary')};
  color: ${th('colorTextReverse')};
  padding: ${grid(6)};
  border-radius: ${th('borderRadius')};

  display: flex;
  flex-direction: column;
  gap: ${grid(1)};
`

const GreetingSalutation = styled.div``

const GreetingHeadline = styled.div`
  font-weight: bold;
  font-size: ${th('fontSizeHeading4')};
`

const GreetingDetail = styled.div``

type GreetingProps = {
  userName: string
  actionCardData: ActionCardItem[]
}

const Greeting = (props: GreetingProps): ReactNode => {
  const { userName, actionCardData } = props
  const totalActionCount = actionCardData.length
  const timeBasedGreeting = getTimeBasedGreeting()

  if (totalActionCount === 0) {
    return (
      <GreetingCard>
        <GreetingSalutation>
          {timeBasedGreeting}, {userName}
        </GreetingSalutation>
        <GreetingHeadline>You&apos;re all caught up</GreetingHeadline>
        <GreetingDetail>
          There&apos;s nothing that needs your attention right now.
        </GreetingDetail>
      </GreetingCard>
    )
  }

  const countsByType = actionCardData.reduce<
    Partial<Record<ActionType, number>>
  >((acc, item) => {
    acc[item.type] = (acc[item.type] ?? 0) + 1
    return acc
  }, {})

  const summarySentences = (
    Object.entries(countsByType) as [ActionType, number][]
  ).map(([type, count]) => actionSummaryPhrases[type](count))

  return (
    <GreetingCard>
      <GreetingSalutation>
        {timeBasedGreeting}, {userName}
      </GreetingSalutation>
      <GreetingHeadline>
        You have {totalActionCount} item{totalActionCount === 1 ? '' : 's'} that
        need{totalActionCount === 1 ? 's' : ''} attention
      </GreetingHeadline>
      <GreetingDetail>
        {capitalize(joinWithAnd(summarySentences))}.
      </GreetingDetail>
    </GreetingCard>
  )
}
// #endregion greeting-card

// #region acrion-cards
const ActionCardWrapper = styled.div<{ color: ActionColor }>`
  background-color: ${th('colorBackground')};
  padding: ${grid(5)} ${grid(5)} ${grid(10)};
  border-radius: ${th('borderRadius')};
  box-shadow: ${th('boxShadow')};
  position: relative;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${th('boxShadow')};
  }

  &:hover ${IconWrapper}, ${Link}:focus & ${IconWrapper} {
    opacity: 1;
  }

  flex-shrink: 0;
  width: 250px;
  height: 100%;
  border-left: 6px solid ${(props): string => props.theme[props.color]};
`

const ActionCardLabel = styled.div`
  font-weight: bold;
  margin-bottom: ${grid(1)};
`

const ActionCardTitle = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  color: ${th('colorTextMuted')};
  text-align: justify;
  hyphens: auto;
  margin-bottom: ${grid(2)};
`

const ActionCardList = styled.ul`
  display: flex;
  gap: ${grid(3)};
  overflow-x: auto;
  width: 100%;

  list-style: none;
  margin: calc(-1 * ${grid(1)}) auto;
  padding: ${grid(1)};

  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* old Edge/IE */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari */
  }
`

const ActionCardListWrapper = styled.div`
  position: relative;
`

const ScrollFade = styled.div<{ $side: 'left' | 'right' }>`
  width: ${grid(9)};
  pointer-events: none;

  position: absolute;
  top: 0;
  bottom: 0;
  /* left 0 or right 0 */
  ${(props): string => props.$side}: 0;

  opacity: 0.6;
  background: linear-gradient(
    to ${({ $side }): string => ($side === 'left' ? 'right' : 'left')},
    ${th('colorWallpaper')},
    transparent
  );
`

const ScrollButton = styled.button<{ $side: 'left' | 'right' }>`
  position: absolute;
  /* left 0.5rem or right 0.5rem */
  ${(props): string => props.$side}: 0.5rem;
  top: 50%;
  transform: translateY(-50%);

  display: flex;
  align-items: center;
  justify-content: center;

  width: ${grid(10)};
  height: ${grid(10)};

  border-radius: ${th('borderRadius')};
  background-color: ${th('colorPrimary')};
  box-shadow: ${th('boxShadow')};
  color: ${th('colorTextReverse')};

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 0 0 2px ${th('colorPrimary')};
    transform: translateY(-50%) scale(1.05);
  }

  > span[role='img'] {
    font-size: 1.25rem;
  }
`

type ActionCardProps = {
  type: ActionType
  shortId: string
  title: string
}

const TITLE_LENGTH_LIMIT = 55

const ActionCard = (props: ActionCardProps): ReactNode => {
  const { type, shortId, title } = props
  const { label, color } = actionTypes[type]

  const trimmedTitle =
    title.length > TITLE_LENGTH_LIMIT
      ? `${title.slice(0, TITLE_LENGTH_LIMIT)}...`
      : title

  return (
    <ActionCardWrapper color={color}>
      <ActionCardLabel>
        {label} #{shortId}
      </ActionCardLabel>

      <ActionCardTitle>{trimmedTitle}</ActionCardTitle>

      <IconWrapper>
        <ArrowRight aria-hidden />
      </IconWrapper>
    </ActionCardWrapper>
  )
}
// #endregion action-cards

// #region table-cards
const TableCardCount = styled.div`
  font-size: 3em;
  font-weight: bold;
`

const TableCardDescription = styled.div`
  font-weight: bold;
`

const TableCardAttention = styled.div`
  font-size: ${th('fontSizeBaseSmaller')};
`

const TableCardGrid = styled.ul`
  display: grid;
  gap: ${grid(3)};
  grid-template-columns: repeat(auto-fit, minmax(${grid(50)}, 1fr));

  list-style: none;
  margin: 0 auto;
  padding: 0 ${grid(1)};
`

type TableCardProps = {
  typeLabel: string
  descriptionLabel: string
  totalCount: number
  attentionCount: number
}

const TableCard = (props: TableCardProps): ReactNode => {
  const { typeLabel, descriptionLabel, totalCount, attentionCount } = props

  return (
    <Card>
      <div>
        <Badge small variant="primary">
          {typeLabel}
        </Badge>
      </div>

      <TableCardCount>{totalCount}</TableCardCount>
      <TableCardDescription>{descriptionLabel}</TableCardDescription>
      <TableCardAttention>
        {attentionCount} need{attentionCount === 1 && 's'} attention
      </TableCardAttention>

      <IconWrapper>
        <ArrowRight aria-hidden />
      </IconWrapper>
    </Card>
  )
}
// #endregion table-cards

// #region notifications
const NotificationsWrapper = styled.div`
  padding: ${grid(3)} ${grid(5)};
  margin: 0 ${grid(1)};
  background-color: ${th('colorBackground')};
  border-radius: ${th('borderRadius')};
  box-shadow: ${th('boxShadow')};
`

const NotificationsHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: ${grid(2)};
  border-bottom: 1px solid ${th('colorBorder')};
  padding: ${grid(2)} ${grid(1)};
`

const NotificationsHeaderLabel = styled.div`
  font-weight: bold;
  font-size: ${th('fontSizeHeading6')};
`

const ClearAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${grid(1)};
  color: ${th('colorTextMuted')};
  transition: color 0.2s ease;

  &:hover {
    color: ${th('colorPrimary')};
  }
`

const ClearAllLabel = styled.span`
  text-box: trim-both cap alphabetic;
`

const NotificationsEmptyIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  height: ${grid(11)};
  width: ${grid(11)};
  border-radius: 50%;

  font-size: 1.2rem;
  background-color: ${th('colorBackgroundHue')};
  color: ${th('colorTextMuted')};
`

const NotificationsEmptyState = styled(Result)`
  padding: ${grid(3)} 0 ${grid(2)};

  .ant-result-icon {
    margin-bottom: ${grid(3)};
  }

  .ant-result-title {
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: ${grid(1)};
    color: ${th('colorTextMuted')};
  }

  .ant-result-subtitle {
    color: ${th('colorTextMuted')};
  }
`

const NotificationList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0;

  list-style: none;
  margin: 0;
  padding: 0;
`

const NotificationRow = styled(m.li)`
  overflow: hidden;
`

const DismissButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  padding: ${grid(1)};
  color: ${th('colorTextMuted')};

  opacity: 0;
  transition: opacity 0.2s ease;
`

const NotificationRowContent = styled.div`
  display: flex;
  align-items: stretch;
  padding: ${grid(2)} ${grid(1)};
  transition: background-color 0.2s ease;

  &:hover,
  &:focus-within {
    background-color: ${th('colorBackgroundHue')};
  }

  &:hover {
    ${DismissButton} {
      opacity: 1;
      cursor: pointer;
    }
  }
`

const notificationLinkStyles = css`
  display: flex;
  align-items: center;
  flex-grow: 1;
  gap: ${grid(2)};
`

const NotificationLink = styled(UILink)`
  ${notificationLinkStyles}
`

const NotificationText = styled.div`
  ${notificationLinkStyles}
`

const NotificationTimestamp = styled.span`
  flex-shrink: 0;
  white-space: nowrap;
  color: ${th('colorTextMuted')};
  font-size: ${th('fontSizeBaseSmall')};
`

const ManuscriptReference = styled.span`
  color: ${th('colorPrimary')};
`

type NotificationEventType =
  | 'addedAsEditor'
  | 'addedAsHandlingEditor'
  | 'addedAsReviewer'
  | 'addedAsSeniorEditor'
  | 'decisionMade'
  | 'removedAsEditor'
  | 'removedAsHandlingEditor'
  | 'removedAsReviewer'
  | 'removedAsSeniorEditor'
  | 'reviewerAcceptedInvitation'
  | 'reviewerCompletedReview'
  | 'reviewerRejectedInvitation'
  | 'revisionSubmitted'

const notificationMessages: Record<NotificationEventType, string> = {
  addedAsEditor: 'You were added as an editor on',
  addedAsHandlingEditor: 'You were added as the handling editor on',
  addedAsReviewer: 'You were added as a reviewer on',
  addedAsSeniorEditor: 'You were added as the senior editor on',
  decisionMade: 'A decision was made on',
  removedAsEditor: 'You were removed as an editor from',
  removedAsHandlingEditor: 'You were removed as the handling editor from',
  removedAsReviewer: 'You were removed as a reviewer from',
  removedAsSeniorEditor: 'You were removed as the senior editor from',
  reviewerAcceptedInvitation: 'A reviewer accepted your invitation for',
  reviewerCompletedReview: 'A review was completed for',
  reviewerRejectedInvitation: 'A reviewer declined your invitation for',
  revisionSubmitted: 'A revision was submitted for',
}

type NotificationItem = {
  id: string
  shortId: string
  href?: string
  eventType: NotificationEventType
  created: string
}

type NotificationProps = NotificationItem & {
  onDismiss: (id: string) => void
}

const notificationRowMotionProps = {
  layout: true,
  initial: { opacity: 0, height: 0, marginBottom: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0, marginBottom: 0 },
  transition: { duration: 0.2 },
}

const Notification = (props: NotificationProps): ReactNode => {
  const { id, shortId, href, eventType, created, onDismiss } = props
  const messagePrefix = notificationMessages[eventType]

  let manuscriptReference: ReactNode = `manuscript #${shortId}`

  if (href) {
    manuscriptReference = (
      <ManuscriptReference>{manuscriptReference}</ManuscriptReference>
    )
  }

  const content = (
    <>
      <span>
        {messagePrefix} {manuscriptReference}.
      </span>
      <NotificationTimestamp>{relativeTimeFrom(created)}</NotificationTimestamp>
    </>
  )

  let messageElement = <NotificationText>{content}</NotificationText>

  if (href) {
    messageElement = <NotificationLink to={href}>{content}</NotificationLink>
  }

  return (
    <NotificationRow {...notificationRowMotionProps}>
      <NotificationRowContent>
        {messageElement}

        <DismissButton
          aria-label="Dismiss notification"
          onClick={(): void => onDismiss(id)}
          type="button"
        >
          <Close aria-hidden />
        </DismissButton>
      </NotificationRowContent>
    </NotificationRow>
  )
}
// #endregion notifications

// #region Dashboard
type ActionCardItem = ActionCardProps & {
  id: string
  href: string
}

type TableCardData = {
  totalCount: number
  attentionCount: number
  href: string
}

type DashboardProps = {
  loading: boolean
  error?: unknown
  userName: string
  actionCardData: ActionCardItem[]
  submissionsData: TableCardData
  reviewData: TableCardData
  editingQueueData: TableCardData
  notifications: NotificationItem[]
  notificationsLoading?: boolean
  notificationsError?: unknown
  onDismissNotification: (id: string) => void
  onDismissAllNotifications: () => void
}

const ACTION_CARD_LIST_SCROLL_STEP = 300

const Dashboard = (props: DashboardProps): ReactNode => {
  const {
    loading,
    error,
    userName,
    actionCardData,
    submissionsData,
    reviewData,
    editingQueueData,
    notifications,
    notificationsLoading,
    notificationsError,
    onDismissNotification,
    onDismissAllNotifications,
  } = props

  const actionCardListRef = useRef<HTMLUListElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const el = actionCardListRef.current
    if (!el) return undefined

    const updateCanScroll = (): void => {
      setCanScrollLeft(el.scrollLeft > 1)
      setCanScrollRight(el.scrollWidth - el.scrollLeft - el.clientWidth > 1)
    }

    updateCanScroll()
    el.addEventListener('scroll', updateCanScroll)
    window.addEventListener('resize', updateCanScroll)

    return (): void => {
      el.removeEventListener('scroll', updateCanScroll)
      window.removeEventListener('resize', updateCanScroll)
    }
  }, [actionCardData])

  const scrollActionListLeft = (): void => {
    actionCardListRef.current?.scrollBy({
      left: -ACTION_CARD_LIST_SCROLL_STEP,
      behavior: 'smooth',
    })
  }

  const scrollActionListRight = (): void => {
    actionCardListRef.current?.scrollBy({
      left: ACTION_CARD_LIST_SCROLL_STEP,
      behavior: 'smooth',
    })
  }

  return (
    <Page title="Dashboard">
      {loading && <Spinner />}
      {error && <CommsErrorBanner error={error} />}
      {!loading && !error && (
        <Wrapper>
          <Greeting actionCardData={actionCardData} userName={userName} />

          {actionCardData.length > 0 && (
            <ActionCardListWrapper>
              <ActionCardList ref={actionCardListRef}>
                {actionCardData.map((cardData: ActionCardItem) => {
                  const { id, href, ...rest } = cardData

                  return (
                    <li key={id}>
                      <Link to={href}>
                        <ActionCard {...rest} />
                      </Link>
                    </li>
                  )
                })}
              </ActionCardList>

              {canScrollLeft && (
                <>
                  <ScrollFade $side="left" />
                  <ScrollButton
                    $side="left"
                    aria-label="Scroll action list left"
                    onClick={scrollActionListLeft}
                    type="button"
                  >
                    <ChevronLeft aria-hidden />
                  </ScrollButton>
                </>
              )}

              {canScrollRight && (
                <>
                  <ScrollFade $side="right" />
                  <ScrollButton
                    $side="right"
                    aria-label="Scroll action list right"
                    onClick={scrollActionListRight}
                    type="button"
                  >
                    <ChevronRight aria-hidden />
                  </ScrollButton>
                </>
              )}
            </ActionCardListWrapper>
          )}

          <div>
            <TableCardGrid>
              <li>
                <Link to={submissionsData.href}>
                  <TableCard
                    attentionCount={submissionsData.attentionCount}
                    descriptionLabel="My Submissions"
                    totalCount={submissionsData.totalCount}
                    typeLabel="Author"
                  />
                </Link>
              </li>

              <li>
                <Link to={reviewData.href}>
                  <TableCard
                    attentionCount={reviewData.attentionCount}
                    descriptionLabel="Review Assignments"
                    totalCount={reviewData.totalCount}
                    typeLabel="Reviewer"
                  />
                </Link>
              </li>

              <li>
                <Link to={editingQueueData.href}>
                  <TableCard
                    attentionCount={editingQueueData.attentionCount}
                    descriptionLabel="Editing Queue"
                    totalCount={editingQueueData.totalCount}
                    typeLabel="Editor"
                  />
                </Link>
              </li>
            </TableCardGrid>
          </div>

          <NotificationsWrapper>
            <NotificationsHeader>
              <NotificationsHeaderLabel>Activity</NotificationsHeaderLabel>

              {notifications.length > 0 && (
                <ClearAllButton
                  onClick={onDismissAllNotifications}
                  type="button"
                >
                  <Broom aria-hidden />
                  <ClearAllLabel>Clear all</ClearAllLabel>
                </ClearAllButton>
              )}
            </NotificationsHeader>

            {notificationsLoading && <Spinner />}

            {notificationsError && (
              <CommsErrorBanner error={notificationsError} />
            )}

            {!notificationsLoading &&
              !notificationsError &&
              notifications.length > 0 && (
                <NotificationList>
                  <AnimatePresence initial={false}>
                    {notifications.map(notification => (
                      <Notification
                        key={notification.id}
                        {...notification}
                        onDismiss={onDismissNotification}
                      />
                    ))}
                  </AnimatePresence>
                </NotificationList>
              )}

            {!notificationsLoading &&
              !notificationsError &&
              notifications.length === 0 && (
                <NotificationsEmptyState
                  icon={
                    <NotificationsEmptyIcon>
                      <Activity aria-hidden />
                    </NotificationsEmptyIcon>
                  }
                  subTitle="Updates on your manuscripts will appear here."
                  title="No activity yet"
                />
              )}
          </NotificationsWrapper>
        </Wrapper>
      )}
    </Page>
  )
}
// #endregion Dashboard

export default Dashboard
