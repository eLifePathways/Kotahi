// import React from 'react'
// import styled from 'styled-components'
// import {
//   CardCollection,
//   Card,
//   ConcentricStepsChart,
//   DurationsChart,
// } from '../../app/components/component-reporting/src'
// import {
//   generateDurationsData,
//   getEditorsConcentricBarChartData,
//   getReviewersConcentricBarChartData,
// } from './mockReportingData'
// import DesignEmbed from '../common/utils'
// import { color } from '../../app/theme'

// const Header = styled.div`
//   color: ${color.brand1.base};
//   font-size: 120%;
//   margin-top: 1em;
//   text-align: center;

//   :first-child {
//     margin-top: 0;
//   }
// `

// const BigNumber = styled.div`
//   font-size: 300%;
//   line-height: 120%;
// `

// const NoteCenter = styled.div`
//   text-align: center;
//   width: 100%;
// `

// const endDate = Date.now()
// const startDate = endDate - 30 * 24 * 60 * 60 * 1000

// export const Base = args => (
//   <CardCollection {...args}>
//     <Card
//       style={{
//         display: 'flex',
//         flexDirection: 'column',
//         flexWrap: 'wrap',
//         justifyContent: 'center',
//         alignItems: 'center',
//       }}
//     >
//       <Header>Editors&rsquo; workflow</Header>
//       <ConcentricStepsChart {...getEditorsConcentricBarChartData()} />
//     </Card>
//     <Card
//       style={{
//         display: 'flex',
//         flexDirection: 'column',
//         flexWrap: 'wrap',
//         justifyContent: 'center',
//         alignItems: 'center',
//       }}
//     >
//       <Header>Reviewers&rsquo; workflow</Header>
//       <ConcentricStepsChart {...getReviewersConcentricBarChartData()} />
//     </Card>
//     <Card
//       style={{
//         display: 'flex',
//         flexDirection: 'column',
//         flexWrap: 'wrap',
//         justifyContent: 'center',
//         alignItems: 'center',
//         width: '150px',
//       }}
//     >
//       <Header>Manuscripts published today</Header>
//       <BigNumber>4</BigNumber>
//       <NoteCenter>Average 2</NoteCenter>
//       <Header>Manuscripts currently in revision</Header>
//       <BigNumber>12</BigNumber>
//       <NoteCenter>Average 9</NoteCenter>
//     </Card>
//     <Card
//       style={{
//         display: 'flex',
//         flexDirection: 'column',
//         flexWrap: 'wrap',
//         justifyContent: 'center',
//         alignItems: 'center',
//       }}
//     >
//       <Header>Submission durations</Header>
//       <DurationsChart {...generateDurationsData(startDate, endDate)} />
//     </Card>
//   </CardCollection>
// )

// Base.args = {
//   style: { width: 950, height: 600 },
// }

// export default {
//   title: 'Reporting/CardCollection',
//   component: CardCollection,
//   parameters: {
//     docs: {
//       page: () => (
//         <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A40" />
//       ),
//     },
//   },
// }
