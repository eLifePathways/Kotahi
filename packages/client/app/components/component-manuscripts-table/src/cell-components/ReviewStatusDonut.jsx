/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { th } from '@coko/client'
import { Chart } from 'react-google-charts'
import { countBy } from 'lodash'
import i18next from 'i18next'
import { getMembersOfTeam } from '../../../../shared/manuscriptUtils'
import reviewStatuses from '../../../../../config/journal/review-status'
import localizeReviewFilterOptions from '../../../../shared/localizeReviewFilterOptions'

const Root = styled.div`
  font-family: ${th('fontReviewer')};
  font-size: 0.9em;
  height: 6em;
  position: relative;
  width: 6em;

  .google-visualization-tooltip {
    pointer-events: none;
  }
`

const chartOptions = {
  pieHole: 0.5,
  pieSliceText: 'none',
  legend: 'none',
  chartArea: {
    width: '100%',
    height: '80%',
  },
  tooltip: {
    isHtml: true,
    ignoreBounds: true,
  },
  is3D: false,
  width: '100%',
  height: '100%',
}

const CenterLabel = styled.div`
  font-size: ${th('fontSizeBase')};
  left: 50%;
  pointer-events: none;
  position: absolute;
  text-align: center;
  top: 50%;
  transform: translate(-50%, -50%);
`

const invitationStatusMapping = {
  UNANSWERED: 'invited',
  REJECTED: 'rejected',
}

const header = [
  { type: 'string', id: 'Status' },
  { type: 'number', id: 'Count' },
  { type: 'string', role: 'tooltip', p: { html: true } },
]

// TODO Refactor to use recharts instead of react-google-charts
const ReviewStatusDonut = ({ manuscript }) => {
  const statusOptions = {}

  const LocalizedReviewFilterOptions = localizeReviewFilterOptions(
    reviewStatuses,
    i18next.t,
  )

  LocalizedReviewFilterOptions.forEach(item => {
    statusOptions[item.value] = { text: item.label, color: item.color }
  })

  const filterInvitedUsers = reviewer => {
    if (reviewer.status === 'invited') {
      const foundInvitation = manuscript.invitations.find(
        invitation =>
          invitation.toEmail === reviewer.user.email &&
          invitation.status === 'UNANSWERED' &&
          ['REVIEWER', 'COLLABORATIVE_REVIEWER'].includes(
            invitation.invitedPersonType,
          ),
      )

      if (foundInvitation) {
        return false
      }
    }

    return true
  }

  // Filter out invitations that have already been answered
  // from the invitation list
  const filteredReviewerMembers = getMembersOfTeam(
    manuscript,
    'reviewer',
  ).filter(filterInvitedUsers)

  const reviewerStatuses = filteredReviewerMembers.map(({ status }) => status)

  const reviewerUserIds = filteredReviewerMembers
    .map(({ user }) => user.id)
    .filter(Boolean)

  const filteredCollaborativeMembers = getMembersOfTeam(
    manuscript,
    'collaborativeReviewer',
  ).filter(filterInvitedUsers)

  const collaborativeReviewerStatuses = filteredCollaborativeMembers.map(
    ({ status }) => status,
  )

  const collaborativeReviewerUserIds = filteredCollaborativeMembers.map(
    ({ user }) => user.id,
  )

  const invitationStatuses = (manuscript.invitations || []) // email invites
    .filter(
      ({ invitedPersonType, status, user }) =>
        status in invitationStatusMapping &&
        ['REVIEWER', 'COLLABORATIVE_REVIEWER'].includes(invitedPersonType) &&
        !reviewerUserIds.includes(user?.id) &&
        !collaborativeReviewerUserIds.includes(user?.id),
    )
    .map(({ status }) => invitationStatusMapping[status])

  const allStatuses = [
    ...reviewerStatuses,
    ...collaborativeReviewerStatuses,
    ...invitationStatuses,
  ]

  const statusCounts = countBy(allStatuses)
  const statusTooltips = {}
  Object.keys(statusCounts).forEach(status => {
    const count = statusCounts[status]
    const { text } = statusOptions[status]
    statusTooltips[status] =
      `<div style="min-width: 10em; padding: 5px 15px; font-size: ${th(
        'fontSizeBase',
      )}; color: ${th('colorText')};">${text}: ${count}</div>`
  })

  const statusColors = Object.keys(statusCounts).map(
    status => statusOptions[status].color,
  )

  const data = [
    header,
    ...Object.keys(statusCounts).map(status => [
      statusOptions[status].text,
      statusCounts[status],
      statusTooltips[status],
    ]),
  ]

  const options = {
    ...chartOptions,
    colors: statusColors,
  }

  const totalStatusCount = allStatuses.length

  return totalStatusCount > 0 ? (
    <Root>
      <Chart chartType="PieChart" data={data} options={options} />
      <CenterLabel>
        {totalStatusCount > 9 ? '9+' : totalStatusCount}
      </CenterLabel>
    </Root>
  ) : (
    'N/A'
  )
}

export default ReviewStatusDonut
