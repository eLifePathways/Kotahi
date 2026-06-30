// import Color from 'color'
// import generateMovingAverages from '../../server/reports/src/movingAverages'

// const day = 24 * 60 * 60 * 1000
// const week = 7 * day

// export const generateDurationsData = (startDate, endDate) => {
//   const durationsData = []
//   let prevDate = startDate

//   while (prevDate < endDate) {
//     const date = prevDate + Math.random() * Math.random() * 48 * 60 * 60 * 1000
//     if (date >= endDate) break

//     const reviewDuration = Math.random() * Math.random() * 15 + 0.5

//     const fullDuration =
//       reviewDuration + Math.random() * Math.random() * 9 + 0.5

//     if (reviewDuration * day + date < endDate) {
//       if (fullDuration * day + date < endDate)
//         durationsData.push({ date, reviewDuration, fullDuration })
//       else durationsData.push({ date, reviewDuration, fullDuration: null })
//     } else
//       durationsData.push({ date, reviewDuration: null, fullDuration: null })

//     prevDate = date
//   }

//   const [reviewAvgsTrace, completionAvgsTrace] = generateMovingAverages(
//     durationsData,
//     week,
//     day,
//   )

//   return {
//     durationsData,
//     startDate,
//     endDate,
//     reviewAvgsTrace,
//     completionAvgsTrace,
//   }
// }

// export const generateSummaryData = (startDate, endDate) => {
//   return {
//     startDate,
//     endDate,
//     avgPublishTimeDays: 8.765,
//     avgReviewTimeDays: 5.678,
//     unsubmittedCount: 12,
//     submittedCount: 34,
//     unassignedCount: 5,
//     reviewInvitedCount: 27,
//     reviewInviteAcceptedCount: 25,
//     reviewedCount: 18,
//     rejectedCount: 4,
//     revisingCount: 9,
//     acceptedCount: 5,
//     publishedCount: 4,
//     publishedTodayCount: 4,
//     avgPublishedDailyCount: 2.7,
//     avgInProgressDailyCount: 11.3,
//     ...generateDurationsData(startDate, endDate),
//   }
// }

// const personNames = [
//   'Joe Bloggs',
//   'Abigail Avery',
//   'Bernard Baker',
//   'Calvin Carter',
//   'Debbie Duke',
//   'Ed Eager',
//   'Frances Fitch',
//   'Gail Gorey',
//   'Hortense Hyatt',
//   'Ivor Inders',
//   'Jasper Jones',
//   'Kathe Koja',
//   'Lewis Lee',
//   'Martha Mann',
//   'Ned Nevis',
//   'Oscar Opie',
//   'Penny Pinter',
//   'Quentin Quell',
//   'Rachel Redmond',
//   'Sam Suiter',
//   'Tom Taylor',
//   'Ursula Underwood',
//   'Val Vincent',
//   'Wayne White',
//   'Xanthe Xavier',
//   'Yolande Yurginson',
//   'Zoe Ziff',
// ]

// const randomInt = max => Math.floor(Math.random() * max)
// const lowishRandomInt = max => Math.floor(Math.random() ** 2 * max)
// const highishRandomInt = max => Math.floor(Math.random() ** 0.5 * max)
// const randomName = () => personNames[randomInt(personNames.length)]

// const randomReviewerStatus = () =>
//   ['invited', 'accepted', 'rejected', 'completed'][randomInt(4)]

// export const generateResearchObjectsData = () => {
//   const result = []

//   for (let i = 0; i < 50; i += 1) {
//     result.push({
//       id: (1234 + i).toString(),
//       entryDate: '2021-05-10',
//       title: `Manuscript ${1234 + i}`,
//       authors: [{ username: randomName() }],
//       editors: [{ username: randomName() }, { username: randomName() }],
//       reviewers: [
//         { name: randomName(), status: randomReviewerStatus() },
//         { user: randomName(), status: randomReviewerStatus() },
//         { username: randomName(), status: randomReviewerStatus() },
//       ],
//       status: 'Reviewed',
//       publishedDate: '2021-05-23',
//       versionReviewDurations: [1.23, 4.56, 7.89, null],
//     })
//   }

//   return result
// }

// export const generateEditorsData = () => {
//   const result = []

//   for (let i = 0; i < 50; i += 1) {
//     const assignedCount = highishRandomInt(40)
//     const givenToReviewersCount = highishRandomInt(assignedCount + 1)
//     const rejectedCount = lowishRandomInt(givenToReviewersCount + 1)

//     const acceptedCount = highishRandomInt(
//       givenToReviewersCount - rejectedCount + 1,
//     )

//     result.push({
//       name: randomName(),
//       assignedCount,
//       givenToReviewersCount,
//       revisedCount: randomInt(givenToReviewersCount + 1),
//       rejectedCount,
//       acceptedCount,
//       publishedCount: highishRandomInt(acceptedCount + 1),
//     })
//   }

//   return result
// }

// export const generateReviewersData = () => {
//   const result = []

//   for (let i = 0; i < 50; i += 1) {
//     const invitesCount = lowishRandomInt(8)
//     const declinedCount = lowishRandomInt(invitesCount + 1)

//     const reviewsCompletedCount = highishRandomInt(
//       invitesCount - declinedCount + 1,
//     )

//     const reccReviseCount = randomInt(reviewsCompletedCount + 1)

//     const reccAcceptCount = highishRandomInt(
//       reviewsCompletedCount - reccReviseCount + 1,
//     )

//     result.push({
//       name: randomName(),
//       invitesCount,
//       declinedCount,
//       reviewsCompletedCount,
//       avgReviewDuration:
//         reviewsCompletedCount > 0 ? lowishRandomInt(20) / 2 + 0.5 : 0,
//       reccReviseCount,
//       reccAcceptCount,
//       reccRejectCount:
//         reviewsCompletedCount - reccReviseCount - reccAcceptCount,
//     })
//   }

//   return result
// }

// export const generateAuthorsData = () => {
//   const result = []

//   for (let i = 0; i < 50; i += 1) {
//     const submittedCount = lowishRandomInt(3)
//     const rejectedCount = lowishRandomInt(submittedCount + 1)
//     const acceptedCount = randomInt(submittedCount - rejectedCount + 1)
//     result.push({
//       name: randomName(),
//       unsubmittedCount: Math.floor(Math.random() ** 4 * 10),
//       submittedCount,
//       rejectedCount,
//       revisionCount: randomInt(submittedCount - rejectedCount + 1),
//       acceptedCount,
//       publishedCount: highishRandomInt(acceptedCount + 1),
//     })
//   }

//   return result
// }

// const getBarColor = (
//   barIndex,
//   barsCount,
//   lightness = 0.6,
//   saturation = 0.6,
// ) => {
//   const baseHue = 243
//   const targetHue = 22

//   const hue =
//     barIndex === 0
//       ? baseHue
//       : baseHue + ((targetHue - baseHue) * barIndex) / (barsCount - 1)

//   return Color.hsl(hue, saturation * 100, lightness * 100).hex()
// }

// export const getEditorsConcentricBarChartData = () => {
//   const data = [
//     { name: 'All manuscripts', value: 123 },
//     { name: 'Submitted', value: 103 },
//     { name: 'Editor assigned', value: 85 },
//     { name: 'Decision complete', value: 32 },
//     { name: 'Accepted', value: 21 },
//     { name: 'Published', value: 18 },
//   ]

//   const barColors = data.map((_, i) => getBarColor(i, data.length, 0.6))
//   const labelColors = data.map((_, i) => getBarColor(i, data.length, 0.3, 1.0))
//   return { data, barColors, labelColors }
// }

// export const getReviewersConcentricBarChartData = () => {
//   const data = [
//     { name: 'All manuscripts', value: 123 },
//     { name: 'Reviewer invited', value: 83 },
//     { name: 'Invite accepted', value: 62 },
//     { name: 'Review completed', value: 38 },
//   ]

//   const barColors = data.map((_, i) => getBarColor(i, data.length, 0.6))
//   const labelColors = data.map((_, i) => getBarColor(i, data.length, 0.3, 1.0))
//   return { data, barColors, labelColors }
// }
