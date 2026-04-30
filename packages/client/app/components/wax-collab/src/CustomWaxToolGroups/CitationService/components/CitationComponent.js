/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, react-hooks/static-components */
/* eslint-disable react/prop-types */
/* eslint-disable promise/always-return */
/* eslint-disable new-cap, no-constant-binary-expression */

import { useEffect, useState, useContext } from 'react'
import { DOMParser, DOMSerializer, Fragment } from 'prosemirror-model'
import {
  WaxContext,
  ApplicationContext,
  DocumentHelpers,
} from 'wax-prosemirror-core'
import { sanitize } from 'isomorphic-dompurify'
import striptags from 'striptags'
import { Loader, List, CheckCircle } from 'react-feather'
import { color } from '../../../../../../theme'
import { Spinner } from '../../../../../shared'
import Modal from '../../../../../component-modal/src/Modal'
import CitationVersion from './CitationVersion'
import EditModal from './EditModal'
import { ConfigContext } from '../../../../../config/src'
import {
  Wrapper,
  CitationWrapper,
  StatusContainer,
  PopUpWrapper,
  Button,
  StatusBar,
  CitationOuterWrapper,
  CloseButton,
  CloseButtonIcon,
} from './styles'

// TODO LIST FOR THIS COMPONENT:
//
// Possible functionality going forward:
// 1) run recheck if we don't have Crossref versions when component is opened?
// 2) needs to interact with ReferenceList component

const decodeEntities = s => {
  let temp = document.createElement('p')
  temp.innerHTML = s
  const str = temp.textContent || temp.innerText
  temp = null
  return str
}

const matchDoi = /(10.(\d)+\/([^(\s>"<)])+)/i

const serializer = schema => {
  const WaxSerializer = DOMSerializer.fromSchema(schema)

  return content => {
    const container = document.createElement('article')
    container.appendChild(WaxSerializer.serializeFragment(content))
    return container.innerHTML
  }
}

const decideStatus = (needsReview, needsValidation) => {
  // weirdly, we're not actually using "valid"
  const currentValidationStatus = needsValidation
    ? 'needs validation'
    : 'checked'

  return needsReview ? 'needs review' : currentValidationStatus
}

const CitationComponent = ({ node, getPos }) => {
  const { pmViews, activeView } = useContext(WaxContext)
  const { app } = useContext(ApplicationContext)

  const citationConfig = app.config.get('config.CitationService')

  const config = useContext(ConfigContext)
  const styleName = config?.production?.citationStyles?.styleName

  const {
    AnyStyleTransformation,
    CrossRefTransformation,
    CiteProcTransformation,
    readOnly,
    getDataFromDatacite,
  } = citationConfig

  const {
    originalText,
    needsReview,
    needsValidation,
    structure,
    possibleStructures,
    valid,
    refId,
    citationNumber,
  } = node.attrs

  // console.log(originalText, needsReview, needsValidation, valid, citationNumber)

  const makeHtmlFrom = content => {
    const serialize = serializer(activeView.state.schema)
    return serialize(content)
  }

  const formattedOriginalText =
    originalText || `<p class="ref">${makeHtmlFrom(node.content)}</p>`

  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [doiHasBeenChecked, setDoiHasBeenChecked] = useState(false)

  // Note: state is maintained on the attributes of the node.
  // But that doesn't trigger a re-render (or useEffects), so we need to maintain
  // a version of that; these variables do this.
  const [internalNeedsReview, setInternalNeedsReview] = useState(needsReview)

  const [internalNeedsValidation, setInternalNeedsValidation] =
    useState(needsValidation)

  const [structures, setStructures] = useState({
    original: possibleStructures?.original || formattedOriginalText,
    anyStyle: possibleStructures?.anyStyle || '',
    crossRef: possibleStructures?.crossRef || [],
    datacite: possibleStructures?.datacite || '',
    custom: possibleStructures?.custom || '',
  })

  // These are what's shown in the component

  const [currentText, setCurrentText] = useState(
    `<p class="ref">${makeHtmlFrom(node.content)}</p>`,
  )

  // These are what's passed back
  const [potentialCsl, setPotentialCsl] = useState(structure || {})

  const [potentialText, setPotentialText] = useState(
    `<p class="ref">${makeHtmlFrom(node.content)}</p>`,
  )

  const [potentialCitationNumber, setPotentialCitationNumber] = useState(
    citationNumber || '',
  )

  const getNodeWithId = id => {
    // This returns a "reference" node with the refID from activeView
    let nodeFound

    activeView.state.doc.nodesBetween(getPos(), getPos() + 1, possibleNode => {
      if (
        possibleNode.type.name === 'reference' &&
        possibleNode.attrs.refId === id
      ) {
        nodeFound = possibleNode
      }
    })

    return nodeFound
  }

  const setContent = (attrs, fragment, onlyAttrs) => {
    // console.log('Running setContent, fragemnt:', fragment, 'attrs:', attrs)
    // This function replaces the current node with a version with new attributes and new content
    // if onlyAttrs is true, we're only changing the attributes, not the content
    const thisNode = getNodeWithId(refId)

    // console.log('\n\nSetting content: ', fragment)
    if (thisNode) {
      let { tr } = activeView.state
      const startPosition = getPos()

      const endPosition = startPosition + thisNode.content.size + 1

      const newNode = activeView.state.schema.nodes.reference.create({
        class: 'ref',
        refId,
        originalText: formattedOriginalText,
        needsReview,
        needsValidation,
        structure,
        possibleStructures: structures,
        valid,
        citationNumber: potentialCitationNumber,
      })

      newNode.content = onlyAttrs ? thisNode.content : fragment

      for (const [key, value] of Object.entries(attrs)) {
        // check if the value is different from the current value

        if (node.attrs[key] !== value) {
          // console.log('Attr change! Key: ', key, 'Value: ', value)
          newNode.attrs[key] = value
        } else {
          // console.log('Not changing: Key: ', key, 'Value: ', value)
        }
      }

      // console.log('node in setContent:', newNode)

      tr = tr.replaceWith(startPosition, endPosition, newNode)
      activeView.dispatch(tr)
      activeView.focus()
    }
  }

  const makeFragmentFrom = text => {
    const elementFromString = string => {
      const wrappedValue = `<body>${string}</body>`

      return new window.DOMParser().parseFromString(wrappedValue, 'text/html')
        .body
    }

    const parser = DOMParser.fromSchema(pmViews.main.state.config.schema)

    const parsedContent = parser.parse(elementFromString(text))
    // This is coming back as a node. We want it to be a mark
    const myFragment = Fragment.from(parsedContent)
    // We are getting the fragment that's inside <p class="ref">...</p>
    return myFragment.content[0].content.content[0].content
  }

  const sendToAnystyle = async text => {
    const content = striptags(text)
    const response = await AnyStyleTransformation({ content })
    if (response === content) return { anyStyle: [] } // response the same as input indicates failure

    const thisResponse = JSON.parse(response)[0]
    // thisResponse is a CSL object with .formattedCitation as the formatted version
    return { anyStyle: thisResponse }
  }

  const sendToCrossRef = async (text, useDatacite, noDoi) => {
    if (useDatacite) {
      // console.log('datacite being used!')
      const response = await CrossRefTransformation(text, true, noDoi)

      let dataciteCsl = null

      if (response.matches && response.matches.length) {
        dataciteCsl = {
          ...response.matches[0],
          'citation-number': !potentialCitationNumber
            ? ''
            : potentialCitationNumber,
        }
        // console.log('setting!')
        setPotentialCsl(dataciteCsl)
        setPotentialText(dataciteCsl.formattedCitation)
        setCurrentText(dataciteCsl.formattedCitation)
        setInternalNeedsValidation(false)
        setInternalNeedsReview(false)
      }

      if (response.fromCrossref) {
        return { crossRef: [dataciteCsl] || [], datacite: [] }
      }

      return { datacite: dataciteCsl || [] }
    }

    const response = await CrossRefTransformation(text, false)
    // Note: if this is failing, the function should return an empty array
    return { crossRef: response || [] }
  }

  useEffect(() => {
    // This is where we send things off to Anystyle/Crossref if it needs to be validated
    const getVersions = async (
      currentStructures,
      dataciteHasBeenRun = false,
    ) => {
      // console.log('Getting versions from CrossRef and AnyStyle')
      setLoading(true)

      await Promise.all([
        await sendToAnystyle(formattedOriginalText),
        await sendToCrossRef(formattedOriginalText, false),
      ]).then(data => {
        // use citation-number from anystyle if it exists
        const anystyleCitationNumber =
          data[0]?.anyStyle?.['citation-number'] || ''

        const anyStyle = {
          anyStyle: {
            ...data[0]?.anyStyle,
            'citation-number': !potentialCitationNumber
              ? anystyleCitationNumber
              : potentialCitationNumber,
          },
        }

        const crossrefDoiCameBack = currentStructures.crossRef.length > 0

        const crossRef = {
          crossRef: crossrefDoiCameBack
            ? currentStructures.crossRef
            : data[1]?.crossRef.map(c => {
                return {
                  ...c,
                  'citation-number': !potentialCitationNumber
                    ? anystyleCitationNumber
                    : potentialCitationNumber,
                }
              }),
        }

        const receivedDataciteData = !Array.isArray(currentStructures.datacite)

        const datacite = receivedDataciteData
          ? {
              datacite: {
                ...currentStructures.datacite,
                'citation-number': !potentialCitationNumber
                  ? anystyleCitationNumber
                  : potentialCitationNumber,
              },
            }
          : {
              datacite: currentStructures.datacite,
            }

        // console.log('anystyleCitationNumber:', anystyleCitationNumber)

        const newStructures = {
          original: currentStructures.original,
          ...anyStyle, // anystyle data
          ...crossRef, // crossRef data
          ...datacite, // dataCite data
          custom: currentStructures.custom,
        }

        // console.log('anystyle', data[0])
        // console.log('crossref', data[1])
        // console.log('datacite', datacite)
        // console.log('newStructures', newStructures)

        setStructures(newStructures)
        // console.log("Versions found. Setting status to 'needs review'")

        if (
          crossrefDoiCameBack ||
          (dataciteHasBeenRun && receivedDataciteData)
        ) {
          setInternalNeedsValidation(false)
          setInternalNeedsReview(false)
          setContent(
            {
              structure: currentStructures.datacite,
              needsValidation: false,
              needsReview: false,
              valid: true,
              originalText: formattedOriginalText,
              possibleStructures: newStructures,
              citationNumber: !potentialCitationNumber
                ? anystyleCitationNumber
                : potentialCitationNumber,
            },
            null,
            true,
          )
        } else {
          setInternalNeedsValidation(false)
          setInternalNeedsReview(true)
          setContent(
            {
              needsValidation: false,
              needsReview: true,
              valid: false,
              originalText: formattedOriginalText,
              possibleStructures: newStructures,
              citationNumber: !potentialCitationNumber
                ? anystyleCitationNumber
                : potentialCitationNumber,
            },
            null,
            true,
          )
        }

        setPotentialCitationNumber(
          !potentialCitationNumber
            ? anystyleCitationNumber
            : potentialCitationNumber,
        )

        setLoading(false)
      })
    }

    const getDataciteData = async doi => {
      setLoading(true)
      // console.log('in getdatacitedata')
      const result = await sendToCrossRef(doi, true, false) // .then(data => {

      if (result.datacite) {
        const newStructures = {
          ...structures,
          ...result,
        }

        setStructures(newStructures)

        if (
          !loading &&
          !structures.crossRef.length &&
          !(JSON.stringify(structures.anyStyle).length > 2)
        ) {
          getVersions(newStructures, true)
        }
      }
    }

    if (needsValidation) {
      if (getDataFromDatacite && !doiHasBeenChecked) {
        // If we're doing this, try to get the DOI from the text.
        setDoiHasBeenChecked(true)

        if (formattedOriginalText.match(matchDoi)) {
          const thisDoi = formattedOriginalText.match(matchDoi)[0]
          // console.log('DOI found in originalText', thisDoi)
          getDataciteData(thisDoi)
        } else {
          console.error('No DOI in this citation:', formattedOriginalText)

          if (
            !loading &&
            !structures.crossRef.length &&
            !(JSON.stringify(structures.anyStyle).length > 2)
          ) {
            // This is firing if we don't have a DOI in the text
            getVersions(structures, false)
          }
        }
      } else if (
        !loading &&
        !structures.crossRef.length &&
        !(JSON.stringify(structures.anyStyle).length > 2)
      ) {
        // we shouldn't do this if we already have crossref/anystyle versions
        getVersions(structures)
      }
    }
  }, [formattedOriginalText, internalNeedsValidation])

  // The below code is causing some updates which resets the valid flag unecessary update!
  // useEffect(() => {
  //   console.log(
  //     'json structure',
  //     JSON.stringify(structures) !== JSON.stringify(possibleStructures),
  //     'loading:',
  //     !loading,
  //   )

  //   if (
  //     JSON.stringify(structures) !== JSON.stringify(possibleStructures) &&
  //     !loading
  //   ) {
  //     console.log('structures', structures)
  //     console.log('possibleStructures', possibleStructures)
  //     setContent(
  //       {
  //         needsValidation: true,
  //         needsReview: false,
  //         valid: false,
  //         possibleStructures: { ...structures },
  //       },
  //       null,
  //       true,
  //     )
  //     setInternalNeedsValidation(true)
  //     setInternalNeedsReview(false)
  //   }
  // }, [structures])

  useEffect(() => {
    // This is firing whenever we change currentText.
    const newFragment = makeFragmentFrom(currentText)

    // If currentText has changed in some way, we need to save it to the node.
    if (JSON.stringify(newFragment) !== JSON.stringify(node.content)) {
      // console.log('something is changed: ', newFragment, node.content)
      // console.log('potentialCsl', potentialCsl)
      // This should probably not be happening all the time. If you then click CLOSE, it's already been set.
      setContent(
        {
          structure: potentialCsl,
          needsValidation: false,
          needsReview: false,
          valid: true,
          citationNumber: potentialCitationNumber,
        },
        newFragment,
      )
      setInternalNeedsValidation(false)
      setInternalNeedsReview(false)
    }
  }, [currentText])

  const CitationPopUp = () => {
    const areOtherComponentsLoading = () => {
      // console.log('Running areOtherComponentsLoading')

      const activeLoading = DocumentHelpers.findChildrenByType(
        activeView.state.doc,
        activeView.state.schema.nodes.reference,
      ).filter(x => x.node.attrs.needsValidation)

      // console.log('Other loading components: ', activeLoading)

      return activeLoading.length > 0
    }

    const [otherLoading, setOtherLoading] = useState(
      areOtherComponentsLoading(),
    )

    useEffect(() => {
      // This checks if other references are in a loading state.
      if (otherLoading) {
        const timer = setTimeout(() => {
          // console.log('Checking other loading!')
          setOtherLoading(areOtherComponentsLoading())
        }, 1000)

        return () => clearTimeout(timer)
      }

      // console.log('Other loading has been turned off.')
      return undefined
    }, [otherLoading])
    return (
      <PopUpWrapper>
        {editing ? (
          <EditModal
            citationData={
              JSON.stringify(potentialCsl) === '{}' ? structure : potentialCsl
            }
            closeModal={() => {
              setEditing(false)
            }}
            formattedCitation={potentialText}
            formattedOriginalText={formattedOriginalText}
            setCitationData={currentCitation => {
              // console.log('currentCitation', currentCitation)
              const currentCitationNumber = currentCitation['citation-number']
              const { original, anyStyle, datacite } = structures

              anyStyle['citation-number'] = currentCitationNumber
              if (!Array.isArray(datacite))
                datacite['citation-number'] = currentCitationNumber

              const crossRefData = structures.crossRef.map(c => {
                return {
                  ...c,
                  'citation-number': currentCitationNumber,
                }
              })

              let newStructures

              if (
                currentCitation.formattedCitation ===
                  anyStyle.formattedCitation ||
                datacite.formattedCitation ||
                crossRefData.some(
                  c =>
                    c.formattedCitation === currentCitation.formattedCitation,
                )
              ) {
                newStructures = {
                  original,
                  anyStyle,
                  crossRef: crossRefData,
                  datacite,
                  custom: '',
                }
              } else {
                newStructures = {
                  original,
                  anyStyle,
                  crossRef: crossRefData,
                  datacite,
                  custom: currentCitation,
                }
              }

              setStructures(newStructures)
              // Question: is it possible someone clicks "close" before formattedCitation has been generated?

              const newFragment = makeFragmentFrom(
                currentCitation.formattedCitation,
              )

              setContent(
                {
                  structure: currentCitation,
                  possibleStructures: { ...newStructures }, // This seems like it's not working.
                  needsValidation: false,
                  needsReview: false,
                  valid: true,
                  citationNumber: currentCitationNumber,
                },
                newFragment,
                false,
              )

              setInternalNeedsValidation(false)
              setInternalNeedsReview(false)
              setPotentialCitationNumber(currentCitationNumber)
              setPotentialText(currentCitation.formattedCitation) // seeing if this fixes the problem.
              setPotentialCsl(currentCitation)
              setCurrentText(currentCitation.formattedCitation) // is this going to do a double-save?
              // When apply is clicked, we're closing this.

              setIsOpen(false)
            }}
            styleReference={CiteProcTransformation}
          />
        ) : (
          <div>
            <h4>Select citation</h4>

            <CitationVersion
              select={() => {
                setPotentialCsl({})
                setPotentialText(formattedOriginalText)
              }}
              selected={
                decodeEntities(formattedOriginalText) ===
                decodeEntities(potentialText)
              }
              text={formattedOriginalText}
              type="original"
            />
            {structures.anyStyle && (
              <CitationVersion
                select={() => {
                  setPotentialCsl(structures.anyStyle)
                  setPotentialText(structures.anyStyle.formattedCitation)
                  setPotentialCitationNumber(
                    structures.anyStyle['citation-number'],
                  )
                }}
                selected={
                  decodeEntities(structures.anyStyle.formattedCitation) ===
                  decodeEntities(potentialText)
                }
                text={structures.anyStyle.formattedCitation}
                type="anystyle"
              />
            )}
            {structures.datacite?.formattedCitation ? (
              <CitationVersion
                select={() => {
                  setPotentialCsl(structures.datacite)
                  setPotentialText(structures.datacite.formattedCitation)
                  setPotentialCitationNumber(
                    structures.datacite['citation-number'],
                  )
                }}
                selected={
                  decodeEntities(structures.datacite.formattedCitation) ===
                  decodeEntities(potentialText)
                }
                text={structures.datacite.formattedCitation}
                type="datacite"
              />
            ) : null}
            {structures.crossRef
              ? structures.crossRef.map(
                  (crossRefVersion, crossRefId) =>
                    crossRefVersion.formattedCitation && (
                      <CitationVersion
                        key={`citationversion-${crossRefId}`}
                        select={() => {
                          setPotentialCsl(crossRefVersion)
                          setPotentialText(crossRefVersion.formattedCitation)
                          setPotentialCitationNumber(
                            crossRefVersion['citation-number'],
                          )
                        }}
                        selected={
                          decodeEntities(crossRefVersion.formattedCitation) ===
                          decodeEntities(potentialText)
                        }
                        text={crossRefVersion.formattedCitation}
                        type="crossref"
                      />
                    ),
                )
              : null}
            {loading ? (
              <div style={{ marginTop: '16px' }}>
                <Spinner />
              </div>
            ) : null}
            {structures.custom ? (
              <CitationVersion
                select={() => {
                  setPotentialCsl(structures.custom)
                  setPotentialText(structures.custom.formattedCitation)
                  setPotentialCitationNumber(
                    structures.custom['citation-number'],
                  )
                }}
                selected={
                  decodeEntities(structures.custom.formattedCitation) ===
                  decodeEntities(potentialText)
                }
                text={structures.custom.formattedCitation}
                type="custom"
              />
            ) : null}
            <StatusBar>
              {decodeEntities(formattedOriginalText) !==
                decodeEntities(potentialText) && (
                <Button
                  disabled={loading || otherLoading} // This is now set to disabled if there are still versions to come in
                  onClick={e => {
                    e.preventDefault()
                    setEditing(true)
                  }}
                  type="button"
                >
                  Edit
                </Button>
              )}
              <Button
                onClick={e => {
                  e.preventDefault()
                  // this changes the display text. It also kicks off the useEffect
                  setCurrentText(potentialText)
                  // This needs to geive it PotentialText as a fragment
                  const newFragment = makeFragmentFrom(potentialText)
                  // second save does the text
                  setContent(
                    {
                      structure: potentialCsl,
                      valid: true,
                      needsValidation: false,
                      needsReview: false,
                      citationNumber:
                        potentialCsl['citation-number'] ||
                        potentialCitationNumber,
                    },
                    newFragment,
                    true,
                  )

                  setInternalNeedsValidation(false)
                  setInternalNeedsReview(false)

                  setIsOpen(false)
                }}
                primary
                type="primary"
              >
                Apply
              </Button>
            </StatusBar>
          </div>
        )}
      </PopUpWrapper>
    )
  }

  // console.log('currentText: ', currentText)

  return (
    <CitationOuterWrapper>
      <Wrapper
        onClick={() => {
          if (!readOnly) {
            // We get readOnly from the config –-if it is true, we're in the full wax editor.
            // Right now, we don't want the possibility of opening the modal in full wax editor
            // (though this may change going forward.)
            setIsOpen(true)
          }
        }}
      >
        <CitationWrapper>
          {currentText.length > 19 ? (
            <div
              dangerouslySetInnerHTML={{
                __html: sanitize(currentText),
              }}
              data-citation-number={
                !potentialCitationNumber || styleName
                  ? null
                  : potentialCitationNumber
              }
            />
          ) : (
            // This is a fallback in case we're getting an empty value for citation. Shouldn't happen.
            <span>Edit malformed citation</span>
          )}
        </CitationWrapper>
        <StatusContainer>
          {decideStatus(internalNeedsReview, internalNeedsValidation) ===
            'checked' && (
            <CheckCircle alt="valid" color={color.success.base} title="valid" />
          )}
          {decideStatus(internalNeedsReview, internalNeedsValidation) ===
            'needs validation' && (
            <Loader
              alt="needs validation"
              color={color.gray70}
              title="needs validation"
            />
          )}
          {decideStatus(internalNeedsReview, internalNeedsValidation) ===
            'needs review' && (
            <List
              alt="needs review"
              color={color.brand1.base()}
              title="needs review"
            />
          )}
        </StatusContainer>
      </Wrapper>
      <Modal
        contentStyles={{
          margin: 'auto',
          width: '800px',
          minHeight: '480px',
          overflow: 'hidden',
          backgroundColor: 'transparent',
        }}
        isOpen={isOpen}
      >
        <CitationPopUp />
        <CloseButton
          onClick={e => {
            e.preventDefault()
            setIsOpen(false)
          }}
        >
          <CloseButtonIcon />
        </CloseButton>
      </Modal>
    </CitationOuterWrapper>
  )
}

export default CitationComponent
