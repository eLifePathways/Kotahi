import { useQuery } from '@apollo/client/react'
import PropTypes from 'prop-types'
import { sanitize } from 'isomorphic-dompurify'
import styled from 'styled-components'
import { th } from '@coko/client'
import { color, space } from '../../../theme'
import { Spinner, CommsErrorBanner, PlainOrRichText } from '../../shared'
import query from './artifactQuery'

const Page = styled.div`
  background: ${color.gray60};
  height: 100vh;
  overflow: hidden scroll;
  width: 100%;
`

const Container = styled.div`
  background: ${color.gray97};
  border: 1px solid ${color.brand1.shade25};
  border-radius: ${th('borderRadius')};
  margin: ${space.g} auto;
  max-width: 1000px;
  padding: ${space.h} ${space.i} ${space.i} ${space.i};
  width: 90%;

  & > h1 {
    color: ${color.brand1.shade25};
    font-size: 180%;
    margin: ${space.e} 0 ${space.f} 0;
  }
`

const Heading = styled.h1`
  line-height: 1.2em;
`

const DetailText = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`

const ArticleArtifactPage = ({ match }) => {
  const { loading, data, error } = useQuery(query, {
    variables: { id: match.params.version },
    fetchPolicy: 'network-only',
  })

  if (error) return <CommsErrorBanner error={error} />
  if (loading) return <Spinner />

  const manuscript = { ...data.publishedManuscript }
  manuscript.submission = JSON.parse(manuscript.submission)

  const artifact = manuscript.publishedArtifacts.find(
    a => a.id === match.params.artifactId,
  ) || {
    title: 'Not found!',
    content: `<p style="color: red">No published artifact was found with ID ${match.params.artifactId}. Please check the page address.</p>`,
  }

  const relatedDocumentTitle =
    <PlainOrRichText value={manuscript.submission.$title} /> ||
    (artifact.relatedDocumentUri
      ? `Click to view the related ${
          artifact.relatedDocumentType || 'document'
        }`
      : '')

  return (
    <Page>
      <Container>
        <p>
          {artifact.relatedDocumentUri ? (
            <a href={artifact.relatedDocumentUri}>{relatedDocumentTitle}</a>
          ) : (
            relatedDocumentTitle
          )}
        </p>
        {artifact.updated && (
          <DetailText>{new Date(artifact.updated).toDateString()}</DetailText>
        )}
        <Heading>{artifact.title}</Heading>
        <div
          dangerouslySetInnerHTML={{
            __html: sanitize(artifact.content),
          }}
        />
      </Container>
    </Page>
  )
}

ArticleArtifactPage.propTypes = {
  match: PropTypes.object.isRequired,
}

export default ArticleArtifactPage
