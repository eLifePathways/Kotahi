import { useQuery } from '@apollo/client/react'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import { sanitize } from 'isomorphic-dompurify'
import styled from 'styled-components'
import { th } from '@coko/client'
import { Spinner, CommsErrorBanner, PlainOrRichText } from '../../shared'
import { PUBLISHED_MANUSCRIPT_AND_FORMS } from '../../../queries'

const Page = styled.div`
  background: ${th('color.gray60')};
  height: 100vh;
  overflow: hidden scroll;
  width: 100%;
`

const Container = styled.div`
  background: ${th('color.gray97')};
  border: 1px solid ${th('color.brand1.shade25')};
  border-radius: ${th('borderRadius')};
  margin: ${th('spacing.g')} auto;
  max-width: 1000px;
  padding: ${th('spacing.h')} ${th('spacing.i')} ${th('spacing.i')}
    ${th('spacing.i')};
  width: 90%;

  & > h1 {
    color: ${th('color.brand1.shade25')};
    font-size: 180%;
    margin: ${th('spacing.e')} 0 ${th('spacing.f')} 0;
  }
`

const Heading = styled.h1`
  line-height: 1.2em;
`

const DetailText = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`

const ArticleArtifactPage = () => {
  const { version, artifactId } = useParams()

  const { loading, data, error } = useQuery(PUBLISHED_MANUSCRIPT_AND_FORMS, {
    variables: { id: version },
    fetchPolicy: 'network-only',
  })

  if (error) return <CommsErrorBanner error={error} />
  if (loading) return <Spinner />

  const manuscript = { ...data.publishedManuscript }
  manuscript.submission = JSON.parse(manuscript.submission)

  const artifact = manuscript.publishedArtifacts.find(
    a => a.id === artifactId,
  ) || {
    title: 'Not found!',
    content: `<p style="color: red">No published artifact was found with ID ${artifactId}. Please check the page address.</p>`,
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
