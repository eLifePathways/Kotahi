/* eslint-disable react/prop-types */

import React from 'react'
import Modal from 'react-modal'
import { useQuery, gql } from '@apollo/client'
import { Spinner } from '../../../shared'

const getPdfQuery = gql`
  query ($manuscriptId: String!, $useHtml: Boolean) {
    convertToPdf(manuscriptId: $manuscriptId, useHtml: $useHtml) {
      pdfUrl
    }
  }
`

const getSimplifiedTitle = title => {
  if (!title) return 'title'
  const noHtml = (title || '').replace(/<[^>]*>/g, '')
  const safeStr = noHtml.replace(/[^a-zA-Z0-9\-_. ]/g, '_')
  const trimmed = safeStr.trim()
  return trimmed || 'title'
}

const useHtml = false

// If this is set to TRUE, we generate HTML and send back the HTML address instead of the PDF address
// This is a temporary measure, though it's useful to test what's coming out.

const DownloadPdfComponent = ({ manuscript, resetMakingPdf }) => {
  const [downloading, setDownloading] = React.useState(false)
  const [modalIsOpen, setModalIsOpen] = React.useState(true)

  const { data, loading, error } = useQuery(getPdfQuery, {
    fetchPolicy: 'network-only',
    variables: {
      manuscriptId: manuscript.id,
      useHtml,
    },
  })

  // Now, download the file
  if (data && !downloading) {
    setDownloading(true)
    const { pdfUrl } = data.convertToPdf // this is the relative url, like "uploads/filename.pdf"
    // console.log(pdfUrl)

    if (useHtml) {
      // use this to open the PDF in a new tab:
      const pdfWindow = window.open(`/${pdfUrl}`)
      pdfWindow.print()
    } else {
      const newWin = window.open(`${pdfUrl}`)

      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        // if popups are blocked, try downloading it instead.
        const link = document.createElement('a')
        link.href = `${pdfUrl}`
        link.download = `${getSimplifiedTitle(
          manuscript.submission.$title,
        )}.pdf`
        link.target = '_blank'
        link.click()
      }
      // use this code for downloading the PDF:

      // const link = document.createElement('a')
      // link.href = `/${pdfUrl}`
      // link.download = `${manuscript.submission.$title || 'title'}.pdf`
      // link.click()

      // console.log(`Downloading ${link.download}`)
    }

    // For Firefox it is necessary to delay revoking the ObjectURL.

    setTimeout(() => {
      window.URL.revokeObjectURL(pdfUrl)
      setModalIsOpen(false)
      resetMakingPdf()
      setDownloading(false)
    }, 1000)
  }

  const onError = () => {
    console.error(error)
    resetMakingPdf()
  }

  const cancelGen = () => {
    // console.log('PDF generation canceled')
    resetMakingPdf()
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
        },
      }}
    >
      <h2 style={{ marginBottom: '1em' }}>
        {error ? <p>Error generating PDF</p> : <p>Preparing PDF...</p>}
      </h2>
      {loading && <Spinner />}
      {error ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <p>Sorry, something went wrong.</p>
          <button onClick={onError} style={{ marginTop: '1em' }} type="submit">
            Close
          </button>
        </div>
      ) : (
        <button onClick={cancelGen} style={{ marginTop: '1em' }} type="submit">
          Cancel
        </button>
      )}
    </Modal>
  )
}

export default DownloadPdfComponent
