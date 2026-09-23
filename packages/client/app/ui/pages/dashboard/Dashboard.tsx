import { useEffect, useRef, useState, type ReactNode } from 'react'
import styled from 'styled-components'
import { AnimatePresence, m } from 'framer-motion'
import { th, grid, Link as UILink } from '@coko/client'

import Badge from '../../shared/Badge'
import { ArrowRight, ChevronLeft, ChevronRight, Close } from '../../base/Icons'

/**
 * TO DO
 * - worth reusing code between this and card grid?
 * - use translations for ui elements
 * - accessibility
 * - css variables
 * - I can map submit, review, decide to the tables, but tasks overdue depends
 *    on what role you have on that manuscript. That needs to be derived at the
 *    page lebel.
 * - Implement notifications and the ability to dismiss them. Be careful with
 *    the roles that should have access to these notification.
 *    - reviewer accepts invitation
 *    - reviewer reject invitation
 *    - reviewer completed review
 *    - decision was made on your manuscript
 *    - you were added / removed as an editor / author
 */

/**
 * - Not completed: status === 'new' + submittedDate IS NULL
 * - Needs revision: status === 'revise'
 * - Decision needed by editor: no dedicated field exists. Closest proxy is decision IS NULL AND status !== 'new' (submitted but no decision recorded yet), or checking there's no Review row with isDecision: true via Manuscript.getDecisions. Worth flagging as an assumption since it's inferred, not an explicit flag.
 * - Review invitation not responded to: TeamMember.status === 'invited' (or Invitation.status === 'UNANSWERED') — there's already a query, manuscriptsUserHasCurrentRoleIn(reviewerStatus: 'invited', wantedRoles: ['reviewer']), built for exactly this.
 * - Review accepted but not completed: same mechanism, reviewerStatus IN ('accepted', 'inProgress').
 * - Task overdue: fully built already — manuscriptHasOverdueTasksForUser / GraphQL field hasOverdueTasksForUser, plus a TaskAlert/userHasTaskAlerts query that's essentially a ready-made "needs attention" signal.
 */

/**
 * user_notifications table (not yet built) — for events that don't fit
 * "needs attention" but are still worth surfacing (reviewer accepted/
 * declined, review completed, decision made). Dismissed via row delete,
 * same idiom as TaskAlert — no dismissed/read boolean.
 * - id: uuid, PK
 * - user_id: uuid, NOT NULL, FK -> users.id, ON DELETE CASCADE (recipient;
 *    one row per user per event, no uniqueness constraint beyond id, so a
 *    user can have multiple rows for the same manuscript)
 * - group_id: uuid, NOT NULL, FK -> groups.id, ON DELETE CASCADE (mirrors
 *    Task.groupId; needed even when manuscript_id is set, so notifications
 *    can be scoped/filtered per group without joining through manuscripts)
 * - manuscript_id: uuid, NULLABLE, FK -> manuscripts.id, ON DELETE CASCADE
 *    (nullable for future non-manuscript events, mirrors Task.manuscriptId)
 * - event_type: text, NOT NULL (reviewerAccepted | reviewerDeclined |
 *    reviewCompleted | decisionMade | ...)
 * - data: jsonb, NOT NULL, default {} (snapshot of whatever's needed to
 *    render the message, so it doesn't depend on relations that may have
 *    since changed, e.g. a reviewer removed from the team)
 * - created: timestamptz, NOT NULL, default now()
 * - updated: timestamptz, NULLABLE (kept for convention; nothing mutates a row)
 */

/**
 * Future cases:
 * - when an invitation expires or a reviewer declines an invitation, the editor might need to invite someone else, which is an action to take
 * - we could maybe have a list of dismissable notifications (eg. reviewer declined) to draw your attention to that instead of bundling it under needs attnetion
 * - other dismissable notification could be along the lines of "decision made" for your submission
 * - if we add the concept of minimum amount of reviews, we could tell an editor that there aren't enough reviews pending / reviewers invited for this manuscript
 * - if we add review deadlines, we could tell a reviwer that their review is overdue or close to overdue (can this functionality be done as a task?)
 * - stale manuscripts: no activity for N days
 * - unread chat messages (if we keep chat)
 */

// #region constants
type ActionType =
  | 'authorSubmit'
  | 'authorRevise'
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

  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1)

const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const NOTIFICATION_ANIMATION_DURATION = 0.2
// #endregion constants

// #region styled
const Wrapper = styled.div`
  background: ${th('colorWallpaper')};
  padding: ${grid(2)};
  display: flex;
  flex-direction: column;
  gap: ${grid(4)};
`

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
  color: ${th('colorTextPlaceholder')};
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
  margin: 0 auto;
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

  border: none;
  border-radius: ${th('borderRadius')};
  background-color: ${th('colorPrimary')};
  box-shadow: ${th('boxShadow')};
  color: ${th('colorTextReverse')};
  cursor: pointer;

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

const NotificationsWrapper = styled.div`
  padding: 0 ${grid(1)};
`

const NotificationSectionLabel = styled.div`
  font-weight: bold;
  font-size: ${th('fontSizeHeading6')};
  margin-bottom: ${grid(2)};
`

const NotificationList = styled.ul`
  display: flex;
  flex-direction: column;

  list-style: none;
  margin: 0;
  padding: 0;
`

const NotificationRow = styled(m.li)`
  display: flex;
  align-items: stretch;
  background-color: ${th('colorBackground')};
  border-radius: ${th('borderRadius')};
  box-shadow: ${th('boxShadow')};
  overflow: hidden;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 0 0 3px ${th('colorPrimary')};
  }
`

const NotificationLink = styled(UILink)`
  display: flex;
  align-items: center;
  flex-grow: 1;
  padding: ${grid(3)} 0 ${grid(3)} ${grid(4)};
`

const DismissButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: ${grid(3)} ${grid(4)} ${grid(3)};

  border: none;
  background: none;
  color: ${th('colorTextPlaceholder')};
  cursor: pointer;

  &:hover {
    color: ${th('colorText')};
  }
`
// #endregion styled

// #region Greeting
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
// #endregion <name> Greeting

// #region ActionCard
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
// #endregion ActionCard

// #region TableCard
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
        <Badge small variant="success">
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
// #endregion TableCard

// #region Notification
type NotificationEventType =
  | 'reviewerAcceptedInvitation'
  | 'reviewerRejectedInvitation'
  | 'reviewerCompletedReview'
  | 'decisionMade'
  | 'addedAsReviewer'
  | 'removedAsReviewer'
  | 'addedAsEditor'
  | 'removedAsEditor'
  | 'addedAsHandlingEditor'
  | 'removedAsHandlingEditor'
  | 'addedAsSeniorEditor'
  | 'removedAsSeniorEditor'

type NotificationMessage = (shortId: string) => string

// TODO: adjust wording, and run through translations
const notificationMessages: Record<NotificationEventType, NotificationMessage> =
  {
    reviewerAcceptedInvitation: shortId =>
      `A reviewer accepted your invitation for manuscript #${shortId}.`,
    reviewerRejectedInvitation: shortId =>
      `A reviewer declined your invitation for manuscript #${shortId}.`,
    reviewerCompletedReview: shortId =>
      `A review was completed for manuscript #${shortId}.`,
    decisionMade: shortId => `A decision was made on manuscript #${shortId}.`,
    addedAsReviewer: shortId =>
      `You were added as a reviewer on manuscript #${shortId}.`,
    removedAsReviewer: shortId =>
      `You were removed as a reviewer from manuscript #${shortId}.`,
    addedAsEditor: shortId =>
      `You were added as an editor on manuscript #${shortId}.`,
    removedAsEditor: shortId =>
      `You were removed as an editor from manuscript #${shortId}.`,
    addedAsHandlingEditor: shortId =>
      `You were added as the handling editor on manuscript #${shortId}.`,
    removedAsHandlingEditor: shortId =>
      `You were removed as the handling editor from manuscript #${shortId}.`,
    addedAsSeniorEditor: shortId =>
      `You were added as the senior editor on manuscript #${shortId}.`,
    removedAsSeniorEditor: shortId =>
      `You were removed as the senior editor from manuscript #${shortId}.`,
  }

type NotificationItem = {
  id: string
  shortId: string
  href: string
  eventType: NotificationEventType
}

type NotificationProps = NotificationItem & {
  onDismiss: (id: string) => void
}

const notificationRowMotionProps = {
  layout: true,
  initial: { opacity: 0, height: 0, marginBottom: 0 },
  animate: { opacity: 1, height: 'auto', marginBottom: '8px' },
  exit: { opacity: 0, height: 0, marginBottom: 0 },
  transition: { duration: NOTIFICATION_ANIMATION_DURATION },
}

const Notification = (props: NotificationProps): ReactNode => {
  const { id, shortId, href, eventType, onDismiss } = props
  const message = notificationMessages[eventType](shortId)

  return (
    <NotificationRow {...notificationRowMotionProps}>
      <NotificationLink to={href}>{message}</NotificationLink>

      <DismissButton
        aria-label="Dismiss notification"
        onClick={(): void => onDismiss(id)}
        type="button"
      >
        <Close aria-hidden />
      </DismissButton>
    </NotificationRow>
  )
}
// #endregion Notification

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
  userName: string
  actionCardData: ActionCardItem[]
  submissionsData: TableCardData
  reviewData: TableCardData
  editingQueueData: TableCardData
  notifications: NotificationItem[]
  onDismissNotification: (id: string) => void
}

const ACTION_CARD_LIST_SCROLL_STEP = 300

const Dashboard = (props: DashboardProps): ReactNode => {
  const {
    userName,
    actionCardData,
    submissionsData,
    reviewData,
    editingQueueData,
    notifications,
    onDismissNotification,
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
    <Wrapper>
      <Greeting actionCardData={actionCardData} userName={userName} />

      {actionCardData.length > 1 && (
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
                descriptionLabel="My submissions"
                totalCount={submissionsData.totalCount}
                typeLabel="Author"
              />
            </Link>
          </li>

          <li>
            <Link to={reviewData.href}>
              <TableCard
                attentionCount={reviewData.attentionCount}
                descriptionLabel="My reviews"
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

      {notifications.length > 0 && (
        <NotificationsWrapper>
          <NotificationSectionLabel>Activity</NotificationSectionLabel>
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
        </NotificationsWrapper>
      )}
    </Wrapper>
  )
}
// #endregion Dashboard

export default Dashboard
