/* eslint-disable react/prop-types */

import React from 'react'
import Modal from 'react-modal'
import { useQuery, gql } from '@apollo/client'
import { Spinner, CommsErrorBanner } from '../../../shared'
import { CloseButton, PopUpTextContainer, PopUpH2 } from './styles'

const getJatsQuery = gql`
  query ($manuscriptId: String!) {
    convertToJats(manuscriptId: $manuscriptId) {
      xml
      zipLink
      error
    }
  }
`

const DownloadJatsComponent = ({ manuscript, resetMakingJats }) => {
  const [downloading, setDownloading] = React.useState(false)
  const [modalIsOpen, setModalIsOpen] = React.useState(true)
  const [zipLink, setZipLink] = React.useState('')

  const [message, setMessage] = React.useState(
    'This link is available for 24 hours',
  )

  const { data, loading, error } = useQuery(getJatsQuery, {
    fetchPolicy: 'cache-and-network',
    variables: {
      manuscriptId: manuscript.id,
    },
  })

  if (loading)
    return (
      <Modal
        isOpen={modalIsOpen}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '360px',
          },
        }}
      >
        <CloseButton
          onClick={e => {
            e.preventDefault()
            resetMakingJats()
            setModalIsOpen(false)
          }}
        />
        <PopUpH2>Generating JATS...</PopUpH2>
        <Spinner />
      </Modal>
    )

  if (error) {
    // if here, the error is not with the XML but with the query
    console.error(error)
    return (
      <div style={{ display: 'none' }}>
        <CommsErrorBanner error={error} />
      </div>
    ) // TODO: improve this!
  }

  if (data && !downloading) {
    setDownloading(true)
    const jats = data.convertToJats.xml
    setZipLink(data.convertToJats.zipLink)

    if (data.convertToJats.error.length) {
      /* eslint-disable */
      console.log(data.convertToJats.xml)
      console.log('Error making JATS. Errors: ', data.convertToJats.error)
      return null
    }

    /* eslint-disable */
    console.log('XML Selected')
    console.log('HTML:\n\n', manuscript.meta.source)
    console.log('JATS:\n\n', jats)
    console.log('Download link: ', data.convertToJats.zipLink)
  }

  const onError = () => {
    console.error(error)
    resetMakingJats()
    setModalIsOpen(false)
  }

  const cancelGen = () => {
    console.log('Cancelling!')
    resetMakingJats()
    setModalIsOpen(false)
  }

  return (
    <Modal
      isOpen={modalIsOpen}
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          width: '360px',
        },
      }}
    >
      <CloseButton onClick={cancelGen} />
      <PopUpH2>{error ? 'Error generating JATS' : 'Your JATS link:'}</PopUpH2>
      {error ? (
        <PopUpTextContainer>
          <p>Sorry, something went wrong.</p>
        </PopUpTextContainer>
      ) : (
        data.convertToJats.error && (
          <PopUpTextContainer>
            <p>Error: invalid JATS. See console for details.</p>
          </PopUpTextContainer>
        )
      )}
      <PopUpTextContainer>
        <p className="linkurl">
          <a href={zipLink} download>
            {zipLink}
          </a>
        </p>
        <p className="linknote">{message}</p>
        <button
          className="copybutton"
          onClick={e => {
            e.preventDefault()
            navigator.clipboard.writeText(zipLink)
            setMessage('Copied!')
            setTimeout(() => {
              setMessage('This link is available for 24 hours')
            }, 1000)
          }}
          type="submit"
        >
          Copy link
        </button>
      </PopUpTextContainer>
    </Modal>
  )
}

export default DownloadJatsComponent
