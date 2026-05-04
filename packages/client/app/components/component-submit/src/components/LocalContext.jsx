/* eslint-disable react/prop-types */

import { useState, useRef, useContext } from 'react'
import PropTypes from 'prop-types'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { last } from 'lodash'
import styled from 'styled-components'
import { grid, th, uuid } from '@coko/client'
import { Spinner } from '../../../shared'
import { ConfigContext } from '../../../config/src'
import { Button } from '../../../pubsweet'
import { color } from '../../../../theme'
import { SubNote } from '../style'

const Input = styled.input`
  background: ${th('color.gray99')};
  border: 1px solid #dedede;
  border-radius: ${th('borderRadius')};
  box-shadow: 0 0 0 0 ${th('colorPrimary')};
  font-size: 14px;
  padding: 14px 9px;
  width: 100%;

  &:focus {
    border: 1px solid ${color.brand1.base};
    outline: 0;
  }

  &:placeholder-shown {
    font-size: ${th('fontSizeBase')};
    line-height: ${th('lineHeightBase')};
  }
`

const StyledButton = styled(Button)`
  cursor: pointer;
  display: flex;
  gap: ${grid(1)};
  margin-bottom: ${grid(2)};
  padding-left: ${grid(1)};

  &[disabled] {
    cursor: not-allowed;
  }
`

const TitleLabel = styled.div`
  color: ${color.brand1.base};
  font-size: 24px;
  margin-bottom: ${grid(1)};
`

const NoProjectFound = styled.span`
  color: red;
  font-size: 22px;
`

const LocalContextResultContainer = styled.div`
  border: 1px solid ${color.brand1.base};
  display: flex;
  flex-direction: column;
  margin-bottom: ${grid(2)};
  padding: ${grid(2)};
`

const ItemContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: ${grid(1)};
`

const ItemTag = styled.span`
  color: ${color.brand1.base};
  font-weight: 700;
  white-space: pre;
`

const ItemValue = styled.span``

const useLocalContext = gql`
  query searchLocalContext($input: InputSearchlocalContext!) {
    searchLocalContext(input: $input) {
      localContext {
        id
        notice {
          id
          identifier
          noticeType
          name
          imgUrl
          svgUrl
          defaultText
        }

        label {
          id
          identifier
          name
          labelType
          language
          languageTag
          labelText
          imgUrl
          svgUrl
        }
      }
      errorMessage
      errorCode
    }
  }
`

const LocalContext = ({ onChange, readonly, value }) => {
  const config = useContext(ConfigContext)
  const [isSearching, setIsSearching] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(true)
  const [localContextData, setLocalContextData] = useState(value || {})
  const [localContextValue, setLocalContextValue] = useState(value?.url || '')
  const localContextRef = useRef(null)

  const { refetch } = useQuery(useLocalContext, {
    fetchPolicy: 'network-only',
    skip: true,
  })

  const handleChange = () => {
    setLocalContextValue(localContextRef?.current?.value)
  }

  const retrieveData = async () => {
    let inputUrl = localContextRef?.current?.value

    if (inputUrl.slice(-1) === '/') {
      inputUrl = inputUrl.slice(0, -1)
    }

    const projectId = inputUrl.split('/')

    if (inputUrl === '' || projectId.length === 1) {
      if (inputUrl === '') {
        const emptyObj = {
          id: '',
          notice: null,
          label: null,
        }

        setLocalContextData(emptyObj)
        onChange({ ...emptyObj, url: '' })
      }

      return
    }

    setIsSearching(true)

    const result = await refetch({
      input: {
        projectId: last(projectId),
        groupId: config.groupId,
      },
    })

    if (result?.data?.searchLocalContext?.errorCode === '403') {
      setIsAuthorized(false)
    } else {
      setLocalContextData(result?.data?.searchLocalContext.localContext)
    }

    if (result?.data?.searchLocalContext.localContext) {
      const newObj = {
        url: localContextRef?.current?.value,
        ...result?.data?.searchLocalContext.localContext,
      }

      onChange(newObj)
    }

    setIsSearching(false)
  }

  return (
    <>
      {!readonly && (
        <div>
          <Input
            name=""
            onChange={handleChange}
            ref={localContextRef}
            type="text"
            value={localContextValue}
          />
          <SubNote>Insert your Local Contexts URL</SubNote>
          <StyledButton
            disabled={false}
            onClick={retrieveData}
            plain
            title=""
            type="button"
          >
            Update
          </StyledButton>
        </div>
      )}
      {isSearching && <Spinner />}
      {!isAuthorized && !isSearching && (
        <NoProjectFound>Unauthorized. Please check you API KEY</NoProjectFound>
      )}
      {localContextData?.id === null && isAuthorized && !isSearching && (
        <NoProjectFound>No Project Found in Local Contexts</NoProjectFound>
      )}
      {localContextData?.notice?.length === 0 && !isSearching && (
        <NoProjectFound>No Notices Found</NoProjectFound>
      )}

      {localContextData?.notice?.length > 0 && !isSearching && (
        <TitleLabel>Notices</TitleLabel>
      )}
      {localContextData?.notice?.length > 0 &&
        !isSearching &&
        localContextData?.notice?.map(singleNotice => (
          <LocalContextResultContainer key={uuid()}>
            <ItemContainer>
              <ItemTag>Name: </ItemTag>{' '}
              <ItemValue>{singleNotice.name}</ItemValue>
            </ItemContainer>
            <ItemContainer>
              <ItemTag>Notice Type: </ItemTag>{' '}
              <ItemValue>{singleNotice.noticeType}</ItemValue>
            </ItemContainer>
            <ItemContainer>
              <ItemTag>Default Text: </ItemTag>{' '}
              <ItemValue>{singleNotice.defaultText}</ItemValue>
            </ItemContainer>
            <ItemContainer>
              <ItemTag>Image & Svg: </ItemTag>{' '}
              <ItemValue>
                <img alt="" src={singleNotice.imgUrl} width="50" />
              </ItemValue>
            </ItemContainer>
          </LocalContextResultContainer>
        ))}
      {localContextData?.label?.length > 0 && !isSearching && (
        <TitleLabel>Labels</TitleLabel>
      )}
      {localContextData?.label?.length > 0 &&
        !isSearching &&
        localContextData?.label?.map(singleLabel => (
          <LocalContextResultContainer key={uuid()}>
            <ItemContainer>
              <ItemTag>Name: </ItemTag>{' '}
              <ItemValue>{singleLabel.name} </ItemValue>
            </ItemContainer>
            <ItemContainer>
              <ItemTag>Label Type: </ItemTag>{' '}
              <ItemValue>{singleLabel.labelType} </ItemValue>
            </ItemContainer>
            <ItemContainer>
              <ItemTag>Label Text: </ItemTag>{' '}
              <ItemValue>{singleLabel.labelText} </ItemValue>
            </ItemContainer>
            <ItemContainer>
              <ItemTag>Image & Svg: </ItemTag>{' '}
              <ItemValue>
                <img alt="" src={singleLabel.imgUrl} width="50" />
              </ItemValue>
            </ItemContainer>
            <ItemContainer>
              <ItemTag>Language: </ItemTag>{' '}
              <ItemValue>{singleLabel.language}</ItemValue>
            </ItemContainer>
            <ItemContainer>
              <ItemTag>Language Tag: </ItemTag>{' '}
              <ItemValue>{singleLabel.languageTag}</ItemValue>
            </ItemContainer>
          </LocalContextResultContainer>
        ))}
    </>
  )
}

LocalContext.propTypes = {
  onChange: PropTypes.func,
  readonly: PropTypes.bool,
  value: PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        identifier: PropTypes.string,
        name: PropTypes.string,
        language: PropTypes.string,
        languageTag: PropTypes.string,
        labelType: PropTypes.string,
        labelText: PropTypes.string,
        imgUrl: PropTypes.string,
        svgUrl: PropTypes.string,
      }),
    ),
    notice: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        identifier: PropTypes.string,
        noticeType: PropTypes.string,
        name: PropTypes.string,
        imgUrl: PropTypes.string,
        svgUrl: PropTypes.string,
        defaultText: PropTypes.string,
      }),
    ),
  }),
}

LocalContext.defaultProps = {
  onChange: () => {},
  readonly: false,
  value: {},
}

export default LocalContext
