import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { grid } from '@coko/client'
import { useTranslation } from 'react-i18next'
import { Select } from './Select'
import PlainOrRichText from './PlainOrRichText'
import { VersionIndicator, VersionLabelWrapper, VersionTitle } from './General'

const Container = styled.div`
  height: 100%;
  margin-top: ${grid(2)};
`

const StyledSelect = styled(Select)`
  & > div {
    background: white;
  }

  border: 1px solid ${({ theme }) => theme.color.gray95};
  box-shadow: ${props => props.theme.boxShadow.shades[100]};
  width: ${props => (props.fullWidth ? 100 : 94)}%;
`

const generateLabel = (created, versionNumber, count, manuscriptName, t) => {
  return (
    <VersionLabelWrapper>
      <VersionTitle>
        <PlainOrRichText value={manuscriptName} />
      </VersionTitle>
      <VersionIndicator>
        {versionNumber >= count
          ? `— ${t('decisionPage.Current version')} (${versionNumber})`
          : `— ${new Date(created)
              .toISOString()
              .slice(0, 10)} (${versionNumber})`}
      </VersionIndicator>
    </VersionLabelWrapper>
  )
}

/* eslint-disable import/prefer-default-export */
export const VersionSwitcher = ({
  versions = [],
  children,
  fullWidth = false,
}) => {
  // One can pass in versions as prop or as children
  let normalizedVersions
  let mode

  if (versions.length) {
    normalizedVersions = versions
    mode = 'props'
  } else if (children) {
    normalizedVersions = children
    mode = 'children'
  }

  const { t } = useTranslation()

  const defaultVersion = normalizedVersions[0] && normalizedVersions[0].key
  const [selectedVersionKey, selectVersionKey] = useState(defaultVersion)

  useEffect(() => {
    normalizedVersions = versions.length ? versions : children
    selectVersionKey(normalizedVersions[0]?.key)
  }, [])

  if (!normalizedVersions) {
    return null
  }

  const selectedVersion = normalizedVersions.find(
    v => v.key === selectedVersionKey,
  )

  return (
    <>
      <StyledSelect
        fullWidth={fullWidth}
        onChange={option => selectVersionKey(option.value)}
        options={normalizedVersions.map((d, i) => ({
          value: d.key,
          label:
            d.label ??
            d.props.label ??
            generateLabel(
              d.props.version.created,
              normalizedVersions.length - i,
              normalizedVersions.length,
              d.props.version.submission.$title,
              t,
            ),
        }))}
        placeholder="Select version..."
        standalone
        value={selectedVersionKey}
      />
      <Container tabIndex="-1">
        {mode === 'props' ? selectedVersion.content : selectedVersion}
      </Container>
    </>
  )
}
