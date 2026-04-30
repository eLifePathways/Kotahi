/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

import { useContext, useEffect } from 'react'
import styled, { css, keyframes, withTheme } from 'styled-components'
import { th } from '@coko/client'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../../pubsweet'
import { ConfigContext } from '../../../config/src'
import { XpubContext } from '../../../xpub-with-context/src'
import upload from '../upload'
import { Dropzone, Action, Spinner } from '../../../shared'
import { color } from '../../../../theme'

const StatusIcon = withTheme(({ children }) => (
  <Icon color={color.brand1.base()}>{children}</Icon>
))

const Status = styled.div`
  align-items: center;
  color: ${color.brand1.base};
  display: inline-flex;
  margin-top: -2px;
`

const StatusIdle = styled(Status).attrs(() => ({
  children: <StatusIcon>plus_circle</StatusIcon>,
}))``

const spin = keyframes`
  0% {
    transform: rotate(0deg);
    transform-origin: 50% 50%;
  }

  100% {
    transform: rotate(360deg);
    transform-origin: 50% 50%;
  }
`

const StatusConverting = styled(Status).attrs(() => ({
  children: <StatusIcon>plus_circle</StatusIcon>,
}))`
  &:hover {
    cursor: wait;
  }

  line {
    stroke-linejoin: round;
  }

  circle {
    animation: ${spin} 2s infinite linear;
    stroke-dasharray: 16;
    stroke-dashoffset: 0;
    stroke-linejoin: round;
  }
`

const StatusError = styled(Status).attrs(() => ({
  children: <StatusIcon>plus_circle</StatusIcon>,
}))`
  color: ${th('colorDanger')};
  font-size: 1.5em;
  font-style: italic;
  font-weight: 400;

  .icon circle {
    display: none;
  }

  .icon line {
    stroke: ${th('colorDanger')};
    transform: rotate(45deg) scale(2.8);
    transform-origin: 50% 50%;
  }
`

const dash = keyframes`
  from {
    stroke-dashoffset: -100;
  }

  to {
    stroke-dashoffset: 0;
  }
`

const StatusCompleted = styled(Status).attrs(() => ({
  children: <StatusIcon>check_circle</StatusIcon>,
}))`
  polyline {
    animation: ${dash} 1.35s linear;
    stroke-dasharray: 100;
    stroke-dashoffset: 0;
  }

  path {
    animation: ${dash} 0.75s linear;
    stroke-dasharray: 100;
    stroke-dashoffset: 0;
  }
`

const Root = styled.div`
  display: flex;
  flex-direction: column;
  font-weight: 200;
  padding-bottom: 10px;
  padding-top: 10px;

  &:hover ${StatusIdle} {
    circle {
      fill: ${color.brand1.base};
      stroke: ${color.brand1.base};
    }

    line {
      stroke: ${color.textReverse};
    }
  }
`

const Main = styled.div`
  display: flex;
  justify-content: center;
`

const Error = styled.div`
  color: ${th('colorDanger')};
  font-size: 1.5em;
  font-style: italic;
  font-weight: 400;
`

const Info = styled.div`
  color: ${color.brand1.base};
  font-size: 2em;
  font-weight: 400;

  ${props =>
    !props.completed &&
    css`
      cursor: default;
    `}
`

const SubInfo = styled.div`
  color: ${color.gray20};
  line-height: 32px;
  text-align: center;
`

const UploadManuscript = ({
  acceptFiles,
  description,
  showSubmitUrl,
  showUploadManuscript,
  ...props
}) => {
  const config = useContext(ConfigContext)
  const { client, history, journals, currentUser } = props

  const { t } = useTranslation()

  // const [error, setError] = useState(false)
  // const [completed, setCompleted] = useState(false)
  const [conversion, setConversion] = useContext(XpubContext)
  const { error, completed, converting } = conversion

  // const error = conversion.error
  // const
  // setConversion({ error: 'yes' })

  const uploadManuscript = upload({
    client,
    history,
    journals,
    currentUser,
    setConversion,
    config,
  })

  // const status = completed
  //   ? 'completed'
  //   : error
  //   ? 'error'
  //   : conversion.converting
  //   ? 'converting'
  //   : 'idle'

  // if (!completed && !conversion.converting) {
  //   setCompleted(true)
  //   setError(false)
  // }

  // Show and then hide the error/success state
  if (error || completed) {
    setTimeout(() => {
      setConversion({})
    }, 3000)
  }

  useEffect(() => {
    if (!showUploadManuscript && showSubmitUrl) {
      uploadManuscript()
    }
  }, [])

  if (!showUploadManuscript && showSubmitUrl) {
    return <Spinner />
  }

  return (
    <>
      {showUploadManuscript && (
        <Dropzone
          accept={acceptFiles}
          data-testid="dropzone"
          disableUpload={converting ? 'disableUpload' : null}
          onDrop={uploadManuscript}
        >
          {({ getRootProps, getInputProps, open }) => {
            useEffect(() => {
              if (showUploadManuscript && !showSubmitUrl) {
                open()
              }
            }, [])

            return (
              <Root {...getRootProps()}>
                <Main>
                  <input {...getInputProps()} />
                  {completed && <StatusCompleted />}
                  {error && <StatusError />}
                  {converting && <StatusConverting />}
                  {!converting && !error && !completed && <StatusIdle />}
                  {error ? (
                    <Error>
                      {t('newSubmission.errorUploading', {
                        error: error.message,
                      })}
                    </Error>
                  ) : (
                    <Info completed={completed}>
                      {completed
                        ? t('newSubmission.Submission created')
                        : t('newSubmission.Upload Manuscript')}
                    </Info>
                  )}
                </Main>
                <SubInfo>
                  {converting && t('newSubmission.converting')}
                  {!converting && (
                    <>
                      <p>{t('newSubmission.dragNDrop')}</p>
                      <em
                        dangerouslySetInnerHTML={{
                          __html:
                            description || t('newSubmission.acceptedFiletypes'),
                        }}
                      />
                    </>
                  )}
                </SubInfo>
              </Root>
            )
          }}
        </Dropzone>
      )}
      {showSubmitUrl && (
        <Action data-testid="submitUrl" onClick={() => uploadManuscript()}>
          {t('newSubmission.Submit a URL instead')}
        </Action>
      )}
    </>
  )
}

export default UploadManuscript
