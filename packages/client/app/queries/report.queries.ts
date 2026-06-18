import { gql } from '@apollo/client'

export const GET_REPORT_DATA = gql`
  query reportData(
    $startDate: DateTime
    $endDate: DateTime
    $groupId: ID!
    $timeZoneOffset: Int
  ) {
    summaryActivity(
      startDate: $startDate
      endDate: $endDate
      groupId: $groupId
      timeZoneOffset: $timeZoneOffset
    ) {
      avgPublishTimeDays
      avgReviewTimeDays
      unsubmittedCount
      submittedCount
      unassignedCount
      reviewInvitedCount
      reviewInviteAcceptedCount
      reviewedCount
      rejectedCount
      revisingCount
      acceptedCount
      publishedCount
      publishedTodayCount
      revisingNowCount
      avgPublishedDailyCount
      avgInProgressDailyCount
      durationsData {
        date
        reviewDuration
        fullDuration
      }
      reviewAvgsTrace {
        x
        y
      }
      completionAvgsTrace {
        x
        y
      }
    }
    manuscriptsActivity(
      startDate: $startDate
      endDate: $endDate
      groupId: $groupId
    ) {
      shortId
      entryDate
      title
      authors {
        id
        username
        email
        defaultIdentity {
          id
          identifier
        }
      }
      editors {
        id
        username
        email
        defaultIdentity {
          id
          identifier
        }
      }
      reviewers {
        id
        name
        status
      }
      status
      publishedDate
      versionReviewDurations
    }
    editorsActivity(
      startDate: $startDate
      endDate: $endDate
      groupId: $groupId
    ) {
      name
      assignedCount
      givenToReviewersCount
      revisedCount
      rejectedCount
      acceptedCount
      publishedCount
    }
    reviewersActivity(
      startDate: $startDate
      endDate: $endDate
      groupId: $groupId
    ) {
      name
      invitesCount
      declinedCount
      reviewsCompletedCount
      avgReviewDuration
      reccReviseCount
      reccAcceptCount
      reccRejectCount
    }
    authorsActivity(
      startDate: $startDate
      endDate: $endDate
      groupId: $groupId
    ) {
      name
      unsubmittedCount
      submittedCount
      rejectedCount
      revisionCount
      acceptedCount
      publishedCount
    }
  }
`
