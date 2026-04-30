import styled from 'styled-components'
import PropTypes from 'prop-types'
import Color from 'color'
import { th } from '@coko/client'
import { Trans, useTranslation } from 'react-i18next'
import CardCollection, { Card } from './CardCollection'
import ConcentricStepsChart from './ConcentricStepsChart'
import DurationsChart from './DurationsChart'
import Tooltip from './Tooltip'
import { color } from '../../../theme'

const ChartCard = styled(Card)`
  align-items: center;
  display: flex;
  flex-direction: column;
  /* stylelint-disable-next-line declaration-block-no-redundant-longhand-properties */
  flex-wrap: wrap;
  justify-content: center;
`

const BigNumbersCard = styled(ChartCard)`
  width: 150px;
`

const CardHeader = styled.div`
  color: ${color.brand1.base};
  font-size: 120%;
  margin-top: 1em;
  text-align: center;

  :first-child {
    margin-top: 0;
  }
`

const BigNumber = styled.div`
  font-size: 300%;
  line-height: 120%;
`

const NoteCenter = styled.div`
  text-align: center;
  width: 100%;
`

const Note = styled.div`
  color: ${color.gray50};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`

const Container = styled.div`
  display: flex;
  flex-direction: row;
`

const StatsContainer = styled.div`
  min-width: 19em;
`

const Stat = styled.div`
  margin-bottom: 0.75em;
`

const StatTitle = styled.div`
  display: inline-block;
  text-align: right;
  vertical-align: top;
  width: 11em;
`

const StatContent = styled.div`
  display: inline-block;
  padding-left: 1em;
  vertical-align: top;
  width: 5.5em;
`

const getBarColor = (
  barIndex,
  barsCount,
  lightness = 0.6,
  saturation = 0.6,
) => {
  const baseHue = 243
  const targetHue = 22

  const hue =
    barIndex === 0
      ? baseHue
      : baseHue + ((targetHue - baseHue) * barIndex) / (barsCount - 1)

  return Color.hsl(hue, saturation * 100, lightness * 100).hex()
}

const to1Dp = value => Math.round(value * 10) / 10

const getDaysStringTo1Dp = valueDays => {
  const roundedDays = to1Dp(valueDays)

  return (
    <Trans
      count={roundedDays}
      i18nKey="reportsPage.summaryInfo.roundedDays"
      values={{ days: roundedDays }}
    />
  )
}

const SummaryReport = ({
  startDate,
  endDate,
  avgPublishTimeDays,
  avgReviewTimeDays,
  unsubmittedCount,
  submittedCount,
  unassignedCount,
  reviewInvitedCount,
  reviewInviteAcceptedCount,
  reviewedCount,
  rejectedCount,
  revisingCount,
  acceptedCount,
  publishedCount,
  publishedTodayCount,
  avgPublishedDailyCount,
  avgInProgressDailyCount,
  durationsData,
  reviewAvgsTrace,
  completionAvgsTrace,
}) => {
  const { t } = useTranslation()

  const getEditorsConcentricBarChartData = () => {
    const data = [
      {
        name: t('reportsPage.All manuscripts'),
        value: unsubmittedCount + submittedCount,
      },
      { name: t('reportsPage.Submitted'), value: submittedCount },
      {
        name: t('reportsPage.Editor assigned'),
        value: submittedCount - unassignedCount,
      },
      {
        name: t('reportsPage.Decision complete'),
        value: rejectedCount + revisingCount + acceptedCount,
      },
      { name: t('reportsPage.Accepted'), value: acceptedCount },
      { name: t('reportsPage.Published'), value: publishedCount },
    ]

    const barColors = data.map((_, i) => getBarColor(i, data.length, 0.6))

    const labelColors = data.map((_, i) =>
      getBarColor(i, data.length, 0.3, 1.0),
    )

    return { data, barColors, labelColors }
  }

  const getReviewersConcentricBarChartData = () => {
    const data = [
      {
        name: t('reportsPage.All manuscripts'),
        value: unsubmittedCount + submittedCount,
      },
      { name: t('reportsPage.Reviewer invited'), value: reviewInvitedCount },
      {
        name: t('reportsPage.Invite accepted'),
        value: reviewInviteAcceptedCount,
      },
      { name: t('reportsPage.Review completed'), value: reviewedCount },
    ]

    const barColors = data.map((_, i) => getBarColor(i, data.length, 0.6))

    const labelColors = data.map((_, i) =>
      getBarColor(i, data.length, 0.3, 1.0),
    )

    return { data, barColors, labelColors }
  }

  return (
    <Container>
      <CardCollection style={{ width: 950, height: 680 }}>
        <ChartCard>
          <CardHeader>{t('reportsPage.Editors workflow')}</CardHeader>
          <ConcentricStepsChart {...getEditorsConcentricBarChartData()} />
        </ChartCard>
        <ChartCard>
          <CardHeader>{t('reportsPage.Reviewers workflow')}</CardHeader>
          <ConcentricStepsChart {...getReviewersConcentricBarChartData()} />
        </ChartCard>
        <BigNumbersCard>
          <CardHeader>
            {t('reportsPage.Manuscripts published today')}
            <Tooltip content={t('reportsPage.From midnight local time')} />
          </CardHeader>
          <BigNumber>{publishedTodayCount}</BigNumber>
          <NoteCenter>
            {t('reportsPage.Average')} {to1Dp(avgPublishedDailyCount)}
            <Tooltip content="Based on the selected date range" />
          </NoteCenter>
          <CardHeader>{t('reportsPage.Manuscripts in progress')}</CardHeader>
          <BigNumber>{revisingCount}</BigNumber>
          <NoteCenter>
            {t('reportsPage.Average')} {to1Dp(avgInProgressDailyCount)}
            <Tooltip
              content={t('reportsPage.Based on the selected date range')}
            />
          </NoteCenter>
        </BigNumbersCard>
        <ChartCard>
          <CardHeader>{t('reportsPage.reviwingAndEditing')}</CardHeader>
          <DurationsChart
            completionAvgsTrace={completionAvgsTrace}
            durationsData={durationsData}
            endDate={endDate}
            reviewAvgsTrace={reviewAvgsTrace}
            startDate={startDate}
          />
        </ChartCard>
      </CardCollection>
      <StatsContainer>
        <Card>
          <Stat>
            <StatTitle>
              {t('reportsPage.summaryInfo.Average time to publish')}
              <Note>
                {t('reportsPage.summaryInfo.From submission to published')}
              </Note>
            </StatTitle>
            <StatContent>{getDaysStringTo1Dp(avgPublishTimeDays)}</StatContent>
          </Stat>
          <Stat>
            <StatTitle>
              {t('reportsPage.summaryInfo.Average time to review')}
            </StatTitle>
            <StatContent>{getDaysStringTo1Dp(avgReviewTimeDays)}</StatContent>
          </Stat>
          <Stat>
            <StatTitle>{t('msStatus.new')}</StatTitle>
            <StatContent>{unsubmittedCount}</StatContent>
          </Stat>
          <Stat>
            <StatTitle>{t('msStatus.submitted')}</StatTitle>
            <StatContent>{submittedCount}</StatContent>
          </Stat>
          <Stat>
            <StatTitle>{t('reportsPage.summaryInfo.unassigned')}</StatTitle>
            <StatContent>{unassignedCount}</StatContent>
          </Stat>
          <Stat>
            <StatTitle>{t('reportsPage.summaryInfo.reviewed')}</StatTitle>
            <StatContent>{reviewedCount}</StatContent>
          </Stat>
          <Stat>
            <StatTitle>{t('msStatus.rejected')}</StatTitle>
            <StatContent>{rejectedCount}</StatContent>
          </Stat>
          <Stat>
            <StatTitle>
              {t('reportsPage.summaryInfo.awaitingRevision')}
            </StatTitle>
            <StatContent>{revisingCount}</StatContent>
          </Stat>
          <Stat>
            <StatTitle>{t('msStatus.accepted')}</StatTitle>
            <StatContent>{acceptedCount}</StatContent>
          </Stat>
          <Stat>
            <StatTitle>{t('msStatus.published')}</StatTitle>
            <StatContent>{publishedCount}</StatContent>
          </Stat>
        </Card>
      </StatsContainer>
    </Container>
  )
}

SummaryReport.propTypes = {
  startDate: PropTypes.number.isRequired,
  endDate: PropTypes.number.isRequired,
  avgPublishTimeDays: PropTypes.number.isRequired,
  avgReviewTimeDays: PropTypes.number.isRequired,
  unsubmittedCount: PropTypes.number.isRequired,
  submittedCount: PropTypes.number.isRequired,
  unassignedCount: PropTypes.number.isRequired,
  reviewInvitedCount: PropTypes.number.isRequired,
  reviewInviteAcceptedCount: PropTypes.number.isRequired,
  reviewedCount: PropTypes.number.isRequired,
  rejectedCount: PropTypes.number.isRequired,
  revisingCount: PropTypes.number.isRequired,
  acceptedCount: PropTypes.number.isRequired,
  publishedCount: PropTypes.number.isRequired,
  publishedTodayCount: PropTypes.number.isRequired,
  avgPublishedDailyCount: PropTypes.number.isRequired,
  avgInProgressDailyCount: PropTypes.number.isRequired,
  durationsData: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.number.isRequired,
      reviewDuration: PropTypes.number,
      fullDuration: PropTypes.number,
    }).isRequired,
  ).isRequired,
  reviewAvgsTrace: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
  ).isRequired,
  completionAvgsTrace: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
  ).isRequired,
}

export default SummaryReport
