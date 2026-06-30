// import React from 'react'
// import { Report } from '../../app/components/component-reporting/src'
// import DesignEmbed from '../common/utils'
// import {
//   generateSummaryData,
//   generateResearchObjectsData,
//   generateEditorsData,
//   generateReviewersData,
//   generateAuthorsData,
// } from './mockReportingData'

// export const Base = args => <Report {...args} />

// const endDate = Date.now()
// const startDate = endDate - 30 * 24 * 60 * 60 * 1000

// Base.args = {
//   startDate,
//   endDate,
//   setStartDate: () => {},
//   setEndDate: () => {},
//   getSummaryData: () => generateSummaryData(startDate, endDate),
//   getManuscriptsData: generateResearchObjectsData,
//   getEditorsData: generateEditorsData,
//   getReviewersData: generateReviewersData,
//   getAuthorsData: generateAuthorsData,
// }

// export default {
//   title: 'Reporting/Report',
//   component: Report,
//   parameters: {
//     docs: {
//       page: () => (
//         <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A53" />
//       ),
//     },
//   },
// }
