/* eslint-disable react/prop-types */

import { sanitize } from 'isomorphic-dompurify'
import { Link as LinkIcon } from 'react-feather'
import styled from 'styled-components'
import { Accordion, MediumRow } from '../../shared'

const ArtifactLink = styled.a`
  line-height: 16px;
`

/** Displays a published artifact as an expandable item. Collapsed, it shows just
 * the title and a link icon. Expanded, the content of the published artifact
 * appears beneath. Clicking the link takes you to a standalone page containing that artifact.
 */
const PublishedArtifactWithLink = ({ artifact }) => {
  const link = `/versions/${artifact.manuscriptId}/artifacts/${artifact.id}`
  return (
    <Accordion
      key={artifact.id}
      label={
        <MediumRow>
          {artifact.title}
          <ArtifactLink href={link} onClick={e => e.stopPropagation()}>
            <LinkIcon size={16} />
          </ArtifactLink>
        </MediumRow>
      }
    >
      <div
        dangerouslySetInnerHTML={{
          __html: sanitize(artifact.content),
        }}
      />
    </Accordion>
  )
}

export default PublishedArtifactWithLink
