/* eslint react/prop-types: 0 */
import React, { useMemo, useContext } from 'react'
import styled from 'styled-components'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import {
  WaxContext,
  ApplicationContext,
  Icon,
} from '../../../../wax-prosemirror-core'
import Dropdown from './Dropdown'

const Wrapper = styled.span`
  display: inline-flex;
`

const StyledIcon = styled(Icon)`
  height: 16px;
  margin-right: 5px;
  width: 16px;
`

// eslint-disable-next-line no-unused-vars
const EditingSuggesting = ({ view: { dispatch, state }, item }) => {
  const { activeView, pmViews } = useContext(WaxContext)
  const { app } = useContext(ApplicationContext)
  const { t, i18n } = useTranslation()
  const enableService = app.config.get('config.EnableTrackChangeService')
    ? app.config.get('config.EnableTrackChangeService')
    : { toggle: false }
  const isDisabled = enableService.toggle

  const isEditable = pmViews.main.props.editable(editable => {
    return editable
  })

  const enableDisableTrackChanges = () => {
    enableService.enabled = !enableService.enabled
    if (enableService.updateTrackStatus)
      enableService.updateTrackStatus(enableService.enabled)

    setTimeout(() => {
      activeView.focus()
    }, 100)
  }

  const Editing = () => {
    return (
      <span>
        <StyledIcon name="editing" />
        {!isEmpty(i18n) && i18n.exists(`Wax.TrackChanges.Editing`)
          ? t(`Wax.TrackChanges.Editing`)
          : 'Editing'}
      </span>
    )
  }

  const Suggesting = () => {
    return (
      <span>
        <StyledIcon name="suggesting" />
        {!isEmpty(i18n) && i18n.exists(`Wax.TrackChanges.Suggesting`)
          ? t(`Wax.TrackChanges.Suggesting`)
          : 'Suggesting'}
      </span>
    )
  }

  const Viewing = () => {
    return (
      <span>
        <StyledIcon name="viewing" />
        {!isEmpty(i18n) && i18n.exists(`Wax.TrackChanges.Viewing`)
          ? t(`Wax.TrackChanges.Viewing`)
          : 'Viewing'}
      </span>
    )
  }

  const dropDownOptions = [
    { label: <Editing />, value: 'editing' },
    { label: <Suggesting />, value: 'suggesting' },
  ]

  const selectedOption = () => {
    if (enableService.enabled) {
      return dropDownOptions[1]
    }
    return dropDownOptions[0]
  }

  const EditingSuggestingComponent = useMemo(
    () => (
      <Wrapper>
        <Dropdown
          disabled={!isDisabled}
          onChange={enableDisableTrackChanges}
          options={dropDownOptions}
          value={selectedOption()}
        />
      </Wrapper>
    ),
    [t(`Wax.TrackChanges.Editing`)],
  )

  if (!isEditable) return <Viewing />

  return EditingSuggestingComponent
}

export default EditingSuggesting
