import { useEffect, useRef, useState, type ReactNode } from 'react'
import styled, { css } from 'styled-components'
import { AnimatePresence, m } from 'framer-motion'
import { th, grid, Link as UILink, Result } from '@coko/client'
import { useTranslation } from 'react-i18next'
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
 * - worth reusing code between this and card grid?
 * - server-side tests
 * - fix cypress tests
 * - playwright tests - dashboard & keyboard navigation
 * = playwright tests - table keyboard navigation
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
  labelKey: string
  color: ActionColor
}

const actionTypes: Record<ActionType, ActionTypeData> = {
  authorSubmit: {
    labelKey: 'dashboardPage.actionCards.types.authorSubmit',
    color: 'colorPrimary',
  },
  authorRevise: {
    labelKey: 'dashboardPage.actionCards.types.authorRevise',
    color: 'colorWarning',
  },
  authorSubmitRevision: {
    labelKey: 'dashboardPage.actionCards.types.authorSubmitRevision',
    color: 'colorWarning',
  },
  reviewerRespond: {
    labelKey: 'dashboardPage.actionCards.types.reviewerRespond',
    color: 'colorWarning',
  },
  reviewerSubmit: {
    labelKey: 'dashboardPage.actionCards.types.reviewerSubmit',
    color: 'colorPrimary',
  },
  editorDecide: {
    labelKey: 'dashboardPage.actionCards.types.editorDecide',
    color: 'colorPrimary',
  },
  taskAlmostOverdue: {
    labelKey: 'dashboardPage.actionCards.types.taskAlmostOverdue',
    color: 'colorWarning',
  },
  taskOverdue: {
    labelKey: 'dashboardPage.actionCards.types.taskOverdue',
    color: 'colorError',
  },
}

const actionSummaryKeys: Record<ActionType, string> = {
  authorSubmit: 'dashboardPage.greeting.actionSummary.authorSubmit',
  authorRevise: 'dashboardPage.greeting.actionSummary.authorRevise',
  authorSubmitRevision:
    'dashboardPage.greeting.actionSummary.authorSubmitRevision',
  reviewerRespond: 'dashboardPage.greeting.actionSummary.reviewerRespond',
  reviewerSubmit: 'dashboardPage.greeting.actionSummary.reviewerSubmit',
  editorDecide: 'dashboardPage.greeting.actionSummary.editorDecide',
  taskAlmostOverdue: 'dashboardPage.greeting.actionSummary.taskAlmostOverdue',
  taskOverdue: 'dashboardPage.greeting.actionSummary.taskOverdue',
}

const joinWithAnd = (items: string[], andWord: string): string => {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return items.join(` ${andWord} `)

  return `${items.slice(0, -1).join(', ')} ${andWord} ${items[items.length - 1]}`
}

const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1)

const getTimeBasedGreetingKey = (): string => {
  const hour = new Date().getHours()

  if (hour < 12) return 'dashboardPage.greeting.goodMorning'
  if (hour < 18) return 'dashboardPage.greeting.goodAfternoon'
  return 'dashboardPage.greeting.goodEvening'
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
  const { t } = useTranslation()
  const totalActionCount = actionCardData.length
  const timeBasedGreeting = t(getTimeBasedGreetingKey())

  if (totalActionCount === 0) {
    return (
      <GreetingCard>
        <GreetingSalutation>
          {timeBasedGreeting}, {userName}
        </GreetingSalutation>
        <GreetingHeadline>
          {t('dashboardPage.greeting.allCaughtUp')}
        </GreetingHeadline>
        <GreetingDetail>
          {t('dashboardPage.greeting.nothingNeedsAttention')}
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
  ).map(([type, count]) => t(actionSummaryKeys[type], { count }))

  const summarySentence = capitalize(
    joinWithAnd(summarySentences, t('dashboardPage.greeting.and')),
  )

  return (
    <GreetingCard>
      <GreetingSalutation>
        {timeBasedGreeting}, {userName}
      </GreetingSalutation>
      <GreetingHeadline>
        {t('dashboardPage.greeting.itemsNeedAttention', {
          count: totalActionCount,
        })}
      </GreetingHeadline>
      <GreetingDetail>{`${summarySentence}.`}</GreetingDetail>
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
  const { t } = useTranslation()
  const { labelKey, color } = actionTypes[type]
  const label = t(labelKey)

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
  const { t } = useTranslation()

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
        {t('dashboardPage.tableCards.needsAttention', {
          count: attentionCount,
        })}
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

  &:focus-visible {
    outline: 2px solid ${th('colorPrimary')};
    outline-offset: 2px;
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

const NotificationsOverflowNote = styled.div`
  padding: ${grid(2)} ${grid(1)} 0;
  text-align: right;
  color: ${th('colorTextMuted')};
  font-size: ${th('fontSizeBaseSmall')};
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

  &:focus-visible {
    outline: 2px solid ${th('colorPrimary')};
    outline-offset: 2px;
  }
`

const NotificationRowContent = styled.div`
  display: flex;
  align-items: stretch;
  padding: ${grid(2)} ${grid(1)};
  transition: background-color 0.2s ease;

  &:hover,
  &:focus-within {
    background-color: ${th('colorBackgroundHue')};
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

const notificationMessageKeys: Record<NotificationEventType, string> = {
  addedAsEditor: 'dashboardPage.activity.notifications.addedAsEditor',
  addedAsHandlingEditor:
    'dashboardPage.activity.notifications.addedAsHandlingEditor',
  addedAsReviewer: 'dashboardPage.activity.notifications.addedAsReviewer',
  addedAsSeniorEditor:
    'dashboardPage.activity.notifications.addedAsSeniorEditor',
  decisionMade: 'dashboardPage.activity.notifications.decisionMade',
  removedAsEditor: 'dashboardPage.activity.notifications.removedAsEditor',
  removedAsHandlingEditor:
    'dashboardPage.activity.notifications.removedAsHandlingEditor',
  removedAsReviewer: 'dashboardPage.activity.notifications.removedAsReviewer',
  removedAsSeniorEditor:
    'dashboardPage.activity.notifications.removedAsSeniorEditor',
  reviewerAcceptedInvitation:
    'dashboardPage.activity.notifications.reviewerAcceptedInvitation',
  reviewerCompletedReview:
    'dashboardPage.activity.notifications.reviewerCompletedReview',
  reviewerRejectedInvitation:
    'dashboardPage.activity.notifications.reviewerRejectedInvitation',
  revisionSubmitted: 'dashboardPage.activity.notifications.revisionSubmitted',
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
  const { t } = useTranslation()
  const messagePrefix = t(notificationMessageKeys[eventType])

  let manuscriptReference: ReactNode = t(
    'dashboardPage.activity.manuscriptReference',
    { shortId },
  )

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
          aria-label={t('dashboardPage.activity.dismissNotification')}
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
  submissionsData?: TableCardData
  reviewData?: TableCardData
  editingQueueData?: TableCardData
  notifications: NotificationItem[]
  notificationsLoading?: boolean
  notificationsError?: unknown
  notificationsTotalCount: number
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
    notificationsTotalCount,
    onDismissNotification,
    onDismissAllNotifications,
  } = props

  const { t } = useTranslation()
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
    <Page title={t('dashboardPage.Dashboard')}>
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
                    aria-label={t('dashboardPage.actionCards.scrollLeft')}
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
                    aria-label={t('dashboardPage.actionCards.scrollRight')}
                    onClick={scrollActionListRight}
                    type="button"
                  >
                    <ChevronRight aria-hidden />
                  </ScrollButton>
                </>
              )}
            </ActionCardListWrapper>
          )}

          {(submissionsData || reviewData || editingQueueData) && (
            <div>
              <TableCardGrid>
                {submissionsData && (
                  <li>
                    <Link to={submissionsData.href}>
                      <TableCard
                        attentionCount={submissionsData.attentionCount}
                        descriptionLabel={t('dashboardPage.My Submissions')}
                        totalCount={submissionsData.totalCount}
                        typeLabel={t('dashboardPage.tableCards.author')}
                      />
                    </Link>
                  </li>
                )}

                {reviewData && (
                  <li>
                    <Link to={reviewData.href}>
                      <TableCard
                        attentionCount={reviewData.attentionCount}
                        descriptionLabel={t('dashboardPage.To Review')}
                        totalCount={reviewData.totalCount}
                        typeLabel={t('dashboardPage.tableCards.reviewer')}
                      />
                    </Link>
                  </li>
                )}

                {editingQueueData && (
                  <li>
                    <Link to={editingQueueData.href}>
                      <TableCard
                        attentionCount={editingQueueData.attentionCount}
                        descriptionLabel={t(
                          "dashboardPage.Manuscripts I'm editor of",
                        )}
                        totalCount={editingQueueData.totalCount}
                        typeLabel={t('dashboardPage.tableCards.editor')}
                      />
                    </Link>
                  </li>
                )}
              </TableCardGrid>
            </div>
          )}

          <NotificationsWrapper>
            <NotificationsHeader>
              <NotificationsHeaderLabel>
                {t('dashboardPage.activity.title')}
              </NotificationsHeaderLabel>

              {notifications.length > 0 && (
                <ClearAllButton
                  onClick={onDismissAllNotifications}
                  type="button"
                >
                  <Broom aria-hidden />
                  <ClearAllLabel>
                    {t('dashboardPage.activity.clearAll')}
                  </ClearAllLabel>
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
              notificationsTotalCount > notifications.length && (
                <NotificationsOverflowNote>
                  {t('dashboardPage.activity.showingOfTotal', {
                    shown: notifications.length,
                    total: notificationsTotalCount,
                  })}
                </NotificationsOverflowNote>
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
                  subTitle={t('dashboardPage.activity.activityWillAppearHere')}
                  title={t('dashboardPage.activity.noActivityYet')}
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
