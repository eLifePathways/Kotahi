// import React from 'react'
// import ProductionWaxEditor from '../../app/components/wax-collab/src/ProductionWaxEditor'
// import { makeJats } from '../../server/utils/jatsUtils'
// import DesignEmbed from '../common/utils'
// import { JournalProvider } from '../../app/components/xpub-journal'
// import journal from '../../config/journal'

// const initialHtml = `<h1>The Title <span class="deletion" data-id="" data-user="-" data-username="demo" data-date="0" data-group="" data-viewid="" style="color: indianred;">of This Paper</span></h1><h2>By Author 1, Author 2, <span class="insertion" data-id="" data-user="-" data-username="demo" data-date="0" data-group="" data-viewid="" style="color: royalblue;">Additional Author, </span>Author 3, Author 4</h2><p class="paragraph">(author affliliations etc.)</p><section class="acknowledgementsSection"><p  class="paragraph">These are acknowledgements.</p></section><p class="paragraph">Some <strong><em>styled</em></strong> text<footnote id="64da6743-5c79-4bbe-b27b-a700748d80ed">This is the note text.</footnote></p><p class="paragraph">A second <span class="comment" data-id="807c5dba-f8a4-4f64-b1cd-cf9e83a2f64c" data-conversation="[{&quot;content&quot;:&quot;This is a note.&quot;,&quot;displayName&quot;:&quot;dummy editor&quot;,&quot;timestamp&quot;:1632132399423}]" data-viewid="main" data-group="main">paragraph</span>.</p><section class="reflist"><h1>adfadf</h1><p class="reference">dfaljkdf</p><p class="reference">fasdfasdf</p><p class="reference">adfasdfasd <span class="deletion"><span class="small-caps">fffasdf</span></span></p><p class="reference">afasfd</p></section><section class="appendix"><h1>Appendix 1</h1><p class="paragraph">Appendix content . . .</p></section>`

// const articleMetadata = {
//   id: 'internalId',
//   title: 'This is the title',
//   pubDate: new Date(),
//   submission: {
//     $authors: [
//       {
//         id: '3dcc3f77-647e-48b5-86d9-aa3540375f60',
//         email: 'john@Quinlan.com',
//         lastName: 'Quinlan',
//         firstName: 'Gabriela M. ',
//         affiliation: 'affiliation 1',
//       },
//       {
//         id: 'dba2c48c-64d3-467b-827c-95d287e6e930',
//         email: '',
//         lastName: 'Milbrath',
//         firstName: 'Meghan O. ',
//         affiliation: 'affiliation 2',
//       },
//       {
//         id: '743b2f92-51b7-45d0-88e1-1d453a445b4b',
//         email: '',
//         lastName: 'Otto',
//         firstName: 'Clint R. V. ',
//         affiliation: 'affiliation 4',
//       },
//       {
//         id: '79dd6f52-32ba-455d-825a-c2093443c0a3',
//         email: '',
//         lastName: 'Isaacs',
//         firstName: 'Rufus ',
//         affiliation: 'affiliation 3',
//       },
//     ],
//     content: [
//       'Aging (Healthy and Neurodegenerative Disorders)',
//       'Social Neuroscience, Emotion, and Motivation',
//       'NIRS',
//     ],
//     $abstract: `<p class="paragraph">Agriculturally important commercially managed pollinators including honey bees (<em>Apis mellifera</em> L., 1758) and bumble bees (<em>Bombus impatiens</em> Cresson, 1863) rely on the surrounding landscape to fulfill their dietary needs. A previous study in Europe demonstrated that managed honey bee foragers and unmanaged native bumble bee foragers are associated with different land uses. However, it is unclear how response to land use compares between managed honey bees and a managed native bumble bee species in the United States, where honey bees are an imported species. Furthermore, to our knowledge, no such direct comparisons of bee responses to land use have been made at the colony level. To better understand how two different social bees respond to variation in land use, we monitored the weights of <em>A</em>. <em>mellifera</em> and <em>B</em>. <em>impatiens</em> colonies placed in 12 apiaries across a range of land use in Michigan, United States in 2017. <em>Bombus impatiens</em> colonies gained more weight and produced more drones when surrounded by diverse agricultural land (i.e., non-corn/soybean cropland such as tree fruits and grapes), while honey bee colonies gained more weight when surrounded by more grassland/pasture land. These findings add to our understanding of how different bee species respond to agricultural landscapes, highlighting the need for further species-specific land use studies to inform tailored land management.</p>`,
//     issueNumber: '2',
//     volumeNumber: '2021',
//   },
// }

// const journalMetadata = {
//   journalId: [
//     { type: 'pmc', value: 'BMJ' },
//     { type: 'publisher', value: 'BR MED J' },
//   ],
//   journalTitle: 'Journal Title',
//   abbrevJournalTitle: 'Jour.Ti.',
//   issn: [
//     { type: 'print', value: '1063-777X' },
//     { type: 'electronic', value: '1090-6517' },
//   ],
//   publisher: 'Journal Publisher Inc.',
// }

// const WaxPlusJATS = () => {
//   const [jats, setJats] = React.useState(
//     makeJats(initialHtml, articleMetadata, journalMetadata),
//   )

//   const [html, setHtml] = React.useState(initialHtml)

//   const parser = new DOMParser()
//   let parseError = null

//   if (jats.jats) {
//     const xmlString = jats.jats
//     const xmlDoc = parser.parseFromString(xmlString, 'application/xml')
//     const errorNode = xmlDoc.querySelector('parsererror')

//     if (errorNode) {
//       parseError = 'Failed, check console for Errors'
//     }
//   }

//   return (
//     <div>
//       <ProductionWaxEditor
//         onBlur={source => {
//           setHtml(source)
//           setJats(makeJats(source, articleMetadata, journalMetadata))
//         }}
//         placeholder="Enter text here"
//         value={initialHtml}
//       />
//       <div>
//         <h2>JATS output:</h2>
//         <h3>
//           Front{' '}
//           <em style={{ fontWeight: 'normal' }}>
//             (note that in Storybook this is fake data!)
//           </em>
//         </h3>
//         <p
//           style={{
//             border: '1px solid #ddd',
//             padding: '1em',
//             overflowWrap: 'break-word',
//           }}
//         >
//           {jats.front ||
//             'Change text in the editor and click outside to see the result'}
//         </p>
//         <h3>Body</h3>
//         <p
//           style={{
//             border: '1px solid #ddd',
//             padding: '1em',
//             overflowWrap: 'break-word',
//           }}
//         >
//           {jats.body ||
//             'Change text in the editor and click outside to see the result'}
//         </p>
//         <h3>Back</h3>
//         <p
//           style={{
//             border: '1px solid #ddd',
//             padding: '1em',
//             overflowWrap: 'break-word',
//           }}
//         >
//           {jats.back ||
//             'Change text in the editor and click outside to see the result'}
//         </p>
//         <h3>Everything</h3>
//         <p
//           style={{
//             border: '1px solid #ddd',
//             padding: '1em',
//             overflowWrap: 'break-word',
//           }}
//         >
//           {jats.jats ||
//             'Change text in the editor and click outside to see the result'}
//         </p>
//         <h3>XML Parsing</h3>
//         <p
//           style={{
//             border: '1px solid #ddd',
//             padding: '1em',
//             overflowWrap: 'break-word',
//           }}
//         >
//           {parseError || 'Passed'}
//         </p>
//       </div>
//       <div>
//         <h2>HTML in Wax:</h2>
//         <p
//           style={{
//             border: '1px solid #ddd',
//             padding: '1em',
//             overflowWrap: 'break-word',
//           }}
//         >
//           {html ||
//             'Change text in the editor and click outside to see the result'}
//         </p>
//       </div>
//     </div>
//   )
// }

// export const Base = args => (
//   <JournalProvider journal={JSON.parse(JSON.stringify(journal))}>
//     <WaxPlusJATS {...args} />
//   </JournalProvider>
// )

// export default {
//   title: 'JATS/HTML to JATS',
//   component: WaxPlusJATS,
//   parameters: {
//     docs: {
//       page: () => (
//         <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A38" />
//       ),
//     },
//   },
// }
