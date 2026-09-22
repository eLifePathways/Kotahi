import { useEffect, useRef, useState, type ReactNode } from 'react'
import styled from 'styled-components'
import { th, grid, Link as UILink } from '@coko/client'

import Badge from '../../shared/Badge'
import { ArrowRight, ChevronLeft, ChevronRight } from '../../base/Icons'

/**
 * TO DO
 * - worth reusing code between this and card grid?
 * - use translations for ui elements
 * - accessibility
 * - css variables
 * - Change "Good morning" to "Welcome back" or "Hi". You don't know the time of day.
 * - Table card data: it shouldn't be dynamic, but fixed to these three tables
 * - I can map submit, review, decide to the tables, but tasks overdue depends
 *    on what role you have on that manuscript. That needs to be derived at the
 *    page lebel.
 * - Implement notifications and the ability to dismiss them. Be careful with
 *    the roles that should have access to these notification.
 *    - reviewer accepts invitation
 *    - reviewer reject invitation
 *    - reviewer completed review
 *    - decision was made on your manuscript
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
// #endregion styled

// #region Greeting
type GreetingProps = {
  userName: string
  actionCardData: ActionCardItem[]
}

const Greeting = (props: GreetingProps): ReactNode => {
  const { userName, actionCardData } = props
  const totalActionCount = actionCardData.length

  if (totalActionCount === 0) {
    return (
      <GreetingCard>
        <GreetingSalutation>Good morning, {userName}</GreetingSalutation>
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
      <GreetingSalutation>Good morning, {userName}</GreetingSalutation>
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
}

const ACTION_CARD_LIST_SCROLL_STEP = 300

const Dashboard = (props: DashboardProps): ReactNode => {
  const {
    userName,
    actionCardData,
    submissionsData,
    reviewData,
    editingQueueData,
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
                descriptionLabel="Edit"
                totalCount={editingQueueData.totalCount}
                typeLabel="Editor"
              />
            </Link>
          </li>
        </TableCardGrid>
      </div>
    </Wrapper>
  )
}
// #endregion Dashboard

export default Dashboard
