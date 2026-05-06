/* eslint-disable react-hooks/exhaustive-deps, react-hooks/immutability, react-hooks/set-state-in-effect, react-hooks/use-memo */
/* eslint-disable react/prop-types */

import { useState, useEffect, useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { sanitize } from 'isomorphic-dompurify'
import { debounce } from 'lodash'
import { ConfigContext } from '../../../../../config/src'
import { InputP, Button, StatusBar, CitationVersionWrapper } from './styles'

// TODO:

// PROBLEMS:
//  - sometimes journal comes in as "container-title", sometimes it comes in as "journalTitle"
//  - maybe: switch based on type?

const EditModal = ({
  citationData, // why is this sometimes coming in as a string? That's probably leading to problems.
  formattedCitation,
  formattedOriginalText,
  setCitationData,
  closeModal,
  styleReference,
}) => {
  // console.log('Coming in: ', citationData, formattedCitation)
  const config = useContext(ConfigContext)
  const styleName = config?.production?.citationStyles?.styleName || 'apa'
  const { t } = useTranslation()
  const [currentText, setCurrentText] = useState(formattedCitation)
  const [reRender, setReRender] = useState(-1)
  const [currentCitation, setCurrentCitation] = useState({})
  const [initialCitation, setIntitialCitation] = useState({})

  const sendToCiteProc = async csl => {
    // console.log('going to citeproc: ', csl)
    const response = await styleReference(csl)
    return response
  }

  const formatCurrentCitation = async () => {
    // console.log('Formatting current citation!')
    // maybe this is an effect loop?

    const newCitation = currentCitation

    // If the citation has not changed, don't send it through Citeproc
    // Previously if you clicked "Edit" on a plaintext citation, this would turn into an empty citation
    // which is not correct. This should only happen if the content of the CSL has changed.
    if (JSON.stringify(newCitation) === JSON.stringify(initialCitation)) {
      newCitation.formattedCitation = formattedCitation
    } else {
      const { formattedCitation: updatedCitation, citeHtml } =
        await sendToCiteProc(currentCitation)

      newCitation.formattedCitation = updatedCitation
      newCitation.citeHtml = citeHtml
    }

    setCurrentText(currentCitation.formattedCitation)
    setCurrentCitation(newCitation)
  }

  const debounceReformat = useCallback(debounce(formatCurrentCitation, 250), [
    formatCurrentCitation,
  ])

  useEffect(() => {
    debounceReformat()
    return debounceReformat.cancel
  }, [currentCitation])

  useEffect(() => {
    // citationData is sometimes coming in as a string – why?

    const newCitation = {
      author: [],
      title: '',
      formattedCitation,
      issue: '',
      issued: { raw: '' },
      page: '',
      type: '', // do we need this?
      volume: '',
      'container-title': '',
      citeHtml: '',
      ...(citationData === '{}' ? {} : citationData),
    }

    setIntitialCitation(newCitation)
    setCurrentCitation(newCitation)
  }, [citationData])
  // console.log('Re-rendering:', currentCitation)
  return typeof currentCitation === 'object' &&
    JSON.stringify(currentCitation) !== '{}' ? (
    <div>
      <h4>
        Edit citation <p>{t(`configPage.production.${styleName}`)}</p>
      </h4>
      <CitationVersionWrapper className="static">
        <div
          dangerouslySetInnerHTML={{
            __html: sanitize(formattedOriginalText),
          }}
        />
        <p>
          <strong>Original</strong>
        </p>
      </CitationVersionWrapper>
      <CitationVersionWrapper>
        <div
          dangerouslySetInnerHTML={{
            __html: sanitize(currentText),
          }}
        />
        <p>
          <strong>Edited</strong>
        </p>
      </CitationVersionWrapper>
      {citationData.citeHtml && (
        <CitationVersionWrapper>
          <div
            dangerouslySetInnerHTML={{
              __html: sanitize(`<p class="cite">${citationData.citeHtml}</p>`),
            }}
          />
          <p>
            <strong>Cite</strong>
          </p>
        </CitationVersionWrapper>
      )}
      <form key={`form-${reRender}`}>
        {currentCitation.author && currentCitation.author.length
          ? currentCitation.author.map((author, index) => (
              <InputP key={index}>
                <label htmlFor="family">
                  Author family name:{' '}
                  <input
                    defaultValue={author.family}
                    name="family"
                    onBlur={formatCurrentCitation}
                    onChange={e => {
                      e.persist()
                      e.preventDefault()

                      if (e.currentTarget.name === 'family') {
                        // eslint-disable-next-line
                        let newCitation = JSON.parse(
                          JSON.stringify(currentCitation),
                        )

                        // This is working correctly BUT we're not re-rendering as we should

                        newCitation.author[index].family = e.target.value
                        setCurrentCitation(newCitation)
                      }
                    }}
                    type="text"
                  />
                </label>
                <label htmlFor="given">
                  Author given name:{' '}
                  <input
                    defaultValue={author.given}
                    name="given"
                    onBlur={formatCurrentCitation}
                    onChange={e => {
                      e.persist()
                      e.preventDefault()

                      if (e.currentTarget.name === 'given') {
                        // eslint-disable-next-line
                        let newCitation = JSON.parse(
                          JSON.stringify(currentCitation),
                        )

                        newCitation.author[index].given = e.target.value
                        setCurrentCitation(newCitation)
                      }
                    }}
                    type="text"
                  />
                </label>
                <Button
                  onClick={e => {
                    e.preventDefault()

                    const newCitation = {
                      ...currentCitation,
                      author: currentCitation.author.filter(
                        (x, index2) => index !== index2,
                      ),
                    }

                    setReRender(() => 0 - reRender)
                    setCurrentCitation(newCitation)
                  }}
                >
                  Delete
                </Button>
              </InputP>
            ))
          : null}
        <InputP>
          <Button
            onClick={e => {
              e.preventDefault()
              setCurrentCitation(() => {
                return {
                  ...currentCitation,
                  author: [
                    ...currentCitation.author,
                    { given: '', family: '' },
                  ],
                }
              })
            }}
            style={{ margin: 0 }}
          >
            Add author
          </Button>
        </InputP>
        <InputP>
          <label htmlFor="title">
            Article title:{' '}
            <input
              defaultValue={currentCitation.title}
              name="title"
              onBlur={formatCurrentCitation}
              onChange={e => {
                e.persist()
                e.preventDefault()

                // there is something odd going on here with selection.
                if (e.currentTarget.name === 'title') {
                  const newCitation = {
                    ...currentCitation,
                    title: e.target.value,
                  }

                  setCurrentCitation(newCitation)
                }
              }}
              type="text"
            />
          </label>
        </InputP>
        <InputP>
          {currentCitation['container-title'] ? (
            <label htmlFor="container-title">
              Journal:{' '}
              <input
                defaultValue={currentCitation['container-title']}
                name="container-title"
                onBlur={formatCurrentCitation}
                onChange={e => {
                  e.persist()
                  e.preventDefault()

                  // there is something odd going on here with selection.
                  if (e.currentTarget.name === 'container-title') {
                    const newCitation = {
                      ...currentCitation,
                      'container-title': e.target.value,
                    }

                    setCurrentCitation(newCitation)
                  }
                }}
                type="text"
              />
            </label>
          ) : (
            <label htmlFor="journalTitle">
              Journal:{' '}
              <input
                defaultValue={currentCitation.journalTitle}
                name="journalTitle"
                onBlur={formatCurrentCitation}
                onChange={e => {
                  e.persist()
                  e.preventDefault()

                  if (e.currentTarget.name === 'journalTitle') {
                    const newCitation = {
                      ...currentCitation,
                      journalTitle: e.target.value,
                    }

                    setCurrentCitation(newCitation)
                  }
                }}
                type="text"
              />
            </label>
          )}
          <label htmlFor="doi">
            DOI:{' '}
            <input
              defaultValue={currentCitation.doi}
              name="doi"
              onBlur={formatCurrentCitation}
              onChange={e => {
                e.persist()
                e.preventDefault()

                // there is something odd going on here with selection.
                if (e.currentTarget.name === 'doi') {
                  const newCitation = {
                    ...currentCitation,
                    doi: e.target.value,
                  }

                  setCurrentCitation(newCitation)
                }
              }}
              type="text"
            />
          </label>
        </InputP>
        <InputP>
          <label htmlFor="volume">
            Volume:{' '}
            <input
              defaultValue={currentCitation.volume}
              name="volume"
              onBlur={formatCurrentCitation}
              onChange={e => {
                e.persist()
                e.preventDefault()

                // there is something odd going on here with selection.
                if (e.currentTarget.name === 'volume') {
                  const newCitation = {
                    ...currentCitation,
                    volume: e.target.value,
                  }

                  setCurrentCitation(newCitation)
                }
              }}
              type="text"
            />
          </label>
          <label htmlFor="issue">
            Issue:{' '}
            <input
              defaultValue={currentCitation.issue}
              name="issue"
              onBlur={formatCurrentCitation}
              onChange={e => {
                e.persist()
                e.preventDefault()

                // there is something odd going on here with selection.
                if (e.currentTarget.name === 'issue') {
                  const newCitation = {
                    ...currentCitation,
                    issue: e.target.value,
                  }

                  setCurrentCitation(newCitation)
                }
              }}
              type="text"
            />
          </label>
          <label htmlFor="issued">
            Year:{' '}
            <input
              defaultValue={
                typeof currentCitation.issued?.raw !== 'undefined'
                  ? currentCitation.issued.raw
                  : currentCitation.issued || ''
              }
              name="issued"
              onBlur={formatCurrentCitation}
              onChange={e => {
                e.persist()
                e.preventDefault()

                // there is something odd going on here with selection.
                if (e.currentTarget.name === 'issued') {
                  const newCitation = {
                    ...currentCitation,
                    issued: { raw: e.target.value },
                  }

                  setCurrentCitation(newCitation)
                }
              }}
              type="text"
            />
          </label>
          <label htmlFor="page">
            Page:{' '}
            <input
              defaultValue={currentCitation.page}
              name="page"
              onBlur={formatCurrentCitation}
              onChange={e => {
                e.persist()
                e.preventDefault()

                // there is something odd going on here with selection.
                if (e.currentTarget.name === 'page') {
                  const newCitation = {
                    ...currentCitation,
                    page: e.target.value,
                  }

                  setCurrentCitation(newCitation)
                }
              }}
              type="text"
            />
          </label>

          <label htmlFor="citation-number">
            Citation number:{' '}
            <input
              defaultValue={currentCitation['citation-number']}
              name="citation-number"
              onBlur={formatCurrentCitation}
              onChange={e => {
                e.persist()
                e.preventDefault()

                // there is something odd going on here with selection.
                if (e.currentTarget.name === 'citation-number') {
                  const newCitation = {
                    ...currentCitation,
                    'citation-number': e.target.value,
                  }

                  setCurrentCitation(newCitation)
                }
              }}
              type="text"
            />
          </label>
        </InputP>

        <StatusBar>
          {/* <Button
            onClick={async e => {
              e.preventDefault()
              await formatCurrentCitation()
            }}
          >
            Format
          </Button> */}
          <Button
            onClick={e => {
              e.preventDefault()
              closeModal(true)
            }}
          >
            Back
          </Button>
          <Button
            onClick={async e => {
              e.preventDefault()
              await formatCurrentCitation()
              setCitationData(currentCitation)
              closeModal(true)
            }}
            type="primary"
          >
            Apply
          </Button>
        </StatusBar>
      </form>
    </div>
  ) : null
}

export default EditModal
