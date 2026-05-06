/* eslint-disable react-hooks/exhaustive-deps */

/* stylelint-disable declaration-no-important */

import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import { useLazyQuery } from '@apollo/client/react'
import styled from 'styled-components'
import { ArrowLeft, Download } from 'react-feather'
import ReactCodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { grid, th } from '@coko/client'
import { isFunction } from 'lodash'
import { Spinner } from '../../../../shared'
import { CloseButton, PopUpH2 } from '../styles'
import { FlexRow } from '../../../../../globals'
import { color } from '../../../../../theme'
import dataciteLogo from '../../../../../../public/datacite-logo-vector.svg'
import { Button } from '../../../../pubsweet'
import CHECK_API_PAYLOAD from './queries'
import { mapEntries } from '../../../../../shared/generalUtils'

const { parse, stringify } = JSON
// TODO: create separate dir for the component and decompose (perhaps do the same with the others similar components (DownloadPdf, Jats, ...etc) from DownloadDropdown, it wiil help to clean up a bit 'Production' component

// #region CONSTANTS

const MODAL_STYLES = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    minHeight: '60vh',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '60vw',
    whiteSpace: 'break-spaces',
    padding: '0',
  },
}

const APIS = {
  Datacite: {
    logo: dataciteLogo,
  },
}

const defaultTrigger = setModalOpen => {
  return (
    <Button onClick={setModalOpen} primary>
      Check Payload
    </Button>
  )
}

// #endregion CONSTANTS

// #region styled-components

// ----- Common

const CleanButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  display: flex;
  padding: 0;

  > svg {
    height: 20px;
    width: 20px;
  }
`

const FlexCol = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`

const CleanLink = styled.a`
  align-items: center;
  color: inherit;
  cursor: pointer;
  display: flex;
  padding: 0;

  > svg {
    height: 20px;
    width: 20px;
  }
`

// ----- Component-specific

const Root = styled(FlexRow)`
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
`

const Header = styled(FlexRow)`
  align-items: center;
  background: ${color.brand1.base};
  justify-content: space-between;
  padding: ${grid(0.6)} ${grid(1)};
  text-transform: uppercase;
  width: 100%;

  > h3 {
    color: ${th('colorBackground')};
    font-weight: bold;
    line-height: 1;
    padding-left: ${grid(0.6)};
  }
`

const StyledCloseButton = styled(CloseButton)`
  position: relative;
  right: 0;
  top: 0;
`

const MainContainer = styled(FlexRow)`
  align-items: flex-start;
  background: #e8e8e8;
  height: 100%;
  width: 100%;
`

const ContentWrapper = styled.div`
  align-items: flex-start;
  background-color: ${th('colorBackground')};
  flex-direction: column;
  height: 60vh;
  justify-content: flex-start;
  overflow: auto;
  width: 100%;

  /* codemirror */
  /* stylelint-disable-next-line selector-class-pattern */
  .ͼe {
    /* stylelint-disable-next-line declaration-no-important */
    color: #127b0c !important;
  }

  /* stylelint-disable-next-line selector-class-pattern */
  .ͼd {
    /* stylelint-disable-next-line declaration-no-important */
    color: #7b3e0c !important;
  }
`

const FlexColCentered = styled(FlexCol)`
  align-items: center;
  gap: ${grid(2)};
  justify-content: center;
`

const CheckApiButton = styled(CleanButton)`
  border: 1px solid #ddd;
  border-radius: ${grid(1.2)};
  height: 200px;
  padding: ${grid(1.2)};
  width: 200px;

  * {
    pointer-events: none;
  }
`

const ResultHeader = styled(FlexRow)`
  background: #f8f8f8;
  border-bottom: 2px solid #ddd;
  color: #555;
  font-weight: 700;
  justify-content: space-between;
  opacity: ${p => (p.$show ? 1 : 0)};
  padding: ${grid(0.6)} 12px;
  width: 100%;

  p {
    color: ${p => (!p.$failure ? color.success.base : color.error.base)};
  }
`

const ResultHeaderActions = styled(FlexRow)`
  gap: ${grid(1.2)};
  justify-content: space-between;

  a {
    margin-top: -2px;
  }

  button {
    margin-top: -2px;
  }
`

const LoadingWindow = styled(FlexColCentered)`
  position: relative;

  &::before {
    background: ${p => p?.apiToCheck && `url(${APIS[p?.apiToCheck]?.logo})`}
      no-repeat center;
    content: '';
    opacity: 0.5;
    position: absolute;
    z-index: -1;
    inset: 0;
  }
`

const ErrorsList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${grid(0.6)};
  height: 100%;
  list-style-type: none;
  padding: ${grid(0.6)};

  > li {
    background: ${th('colorBackground')};
    border: 1px solid #ddd;
    border-left: ${color.error.base} 5px solid;
    padding: ${grid(0.6)} ${grid(1.2)};
  }
`
// #endregion styled-components ----------------------------------------------------------------------------

const VerifyPayloadModal = ({
  manuscriptId,
  renderTrigger = defaultTrigger,
}) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [apiToCheck, setApiToCheck] = useState(null)
  const [payloadForecast, setPayloadForecast] = useState(null)

  const { payload, failureReason } = payloadForecast || {}

  const [checkApi, { loading }] = useLazyQuery(CHECK_API_PAYLOAD, {
    onCompleted: ({ checkApiPayload }) => {
      const parsedData = parse(checkApiPayload ?? '{}')
      setPayloadForecast(parsedData)
    },
    fetchPolicy: 'cache-and-network',
  })

  useEffect(() => {
    if (apiToCheck) {
      checkApi({ variables: { id: manuscriptId, api: apiToCheck } })
    }
  }, [apiToCheck])

  const handleClose = () => {
    setModalOpen(false)
  }

  const handleApiSelection = ({ target }) => {
    const {
      dataset: { api },
    } = target

    setApiToCheck(api)
  }

  const handleGoBack = () => {
    setPayloadForecast(null)
    setApiToCheck('')
  }

  const getJsonDownloadLink = () => {
    if (!payloadForecast) return ''
    const encodedUri = encodeURIComponent(stringify(payload, null, 2))
    const downloadSrc = `data:text/json;charset=utf-8,${encodedUri}`

    return downloadSrc
  }

  return (
    <>
      {isFunction(renderTrigger) && renderTrigger(setModalOpen)}
      <Modal isOpen={!!modalOpen} style={MODAL_STYLES}>
        <Root>
          <Header>
            <h3>{apiToCheck || 'SELECT THE API TO CHECK'}</h3>
            <StyledCloseButton onClick={handleClose} />
          </Header>
          <ResultHeader $failure={failureReason} $show={payload}>
            <p>
              {failureReason
                ? `WARNING!: ${failureReason.length} errors detected`
                : 'Success!'}
            </p>
            {payload && (
              <ResultHeaderActions>
                <CleanLink
                  download={`payload-${apiToCheck}-${manuscriptId}.json`}
                  href={getJsonDownloadLink()}
                  title="Download JSON"
                >
                  <Download />
                </CleanLink>
                <CleanButton onClick={handleGoBack} title="Back">
                  <ArrowLeft>go back</ArrowLeft>
                </CleanButton>
              </ResultHeaderActions>
            )}
          </ResultHeader>
          <MainContainer>
            <ContentWrapper>
              {payload ? (
                <ReactCodeMirror
                  editable={false}
                  extensions={[json()]}
                  value={stringify(payload, null, 2)}
                />
              ) : (
                <FlexColCentered>
                  {!loading || !apiToCheck ? (
                    <FlexColCentered>
                      {mapEntries(APIS, (k, { logo }) => (
                        <CheckApiButton
                          data-api={k}
                          key={k}
                          onClick={handleApiSelection}
                        >
                          <img alt={`${k} Logo`} src={logo} />
                        </CheckApiButton>
                      ))}
                    </FlexColCentered>
                  ) : (
                    <LoadingWindow apiToCheck={apiToCheck}>
                      <PopUpH2>Checking {apiToCheck} payload...</PopUpH2>
                      <Spinner />
                    </LoadingWindow>
                  )}
                </FlexColCentered>
              )}
            </ContentWrapper>
            {failureReason && (
              <ErrorsList>
                <h5>OVERVIEW:</h5>
                {failureReason.map(fr => (
                  <li key={fr}>{fr}</li>
                ))}
              </ErrorsList>
            )}
          </MainContainer>
        </Root>
      </Modal>
    </>
  )
}

VerifyPayloadModal.propTypes = {
  manuscriptId: PropTypes.string.isRequired,
  renderTrigger: PropTypes.func,
}

export default VerifyPayloadModal
