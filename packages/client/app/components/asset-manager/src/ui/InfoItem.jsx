/* eslint-disable react/prop-types */
/* eslint-disable promise/catch-or-return */

/* eslint-disable jsx-a11y/no-autofocus */

import { Component } from 'react'
import styled from 'styled-components'
import { th } from '@coko/client'

import { Button, Icons } from './Modal'
import { color } from '../../../../theme'

const { saveIcon, editIcon, exitIcon } = Icons

const Input = styled.input`
  border: 0;
  font-family: ${th('fontHeading')};
  font-size: ${th('fontSizeBase')};
  line-height: ${th('lineHeightBase')};
  outline: 0;
  padding: 0;
  width: 78.2%;

  &:focus {
    border-bottom: 1px dashed ${color.brand1.base};
    outline: 0;
  }

  &:placeholder-shown {
    font-size: ${th('fontSizeBase')};
    line-height: ${th('lineHeightBase')};
  }
`

const PlainItem = styled.div`
  font-family: ${th('fontHeading')};
  font-size: ${th('fontSizeBase')};
  line-height: ${th('lineHeightBase')};
  text-align: left;
  width: 100%;
`

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  width: 100%;
`

const Actions = styled.div`
  display: flex;
  width: 15.8%;
`

class InfoItem extends Component {
  constructor(props) {
    super(props)

    this.state = {
      initialValue: props.value,
      newValue: props.value,
      focus: false,
      editMode: false,
    }

    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleEditMode = this.handleEditMode.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.renderItem = this.renderItem.bind(this)
  }

  handleKeyPress(e) {
    this.setState({ newValue: e.target.value })
  }

  handleEditMode() {
    this.setState({ editMode: true, focus: true })
  }

  handleSave() {
    const { updateFile, type } = this.props
    const { newValue } = this.state
    const self = this
    updateFile({ [type]: newValue }).then(() =>
      self.setState({ editMode: false, initialValue: newValue, focus: false }),
    )
  }

  handleCancel() {
    const { initialValue } = this.state
    this.setState({ editMode: false, newValue: initialValue, focus: false })
  }

  renderItem() {
    const { editable, value } = this.props
    const { newValue, editMode, focus } = this.state

    if (editable) {
      return !editMode ? (
        <>
          <PlainItem>{value}</PlainItem>
          <Actions>
            <Button
              icon={editIcon}
              onClick={this.handleEditMode}
              title="Edit"
            />
          </Actions>
        </>
      ) : (
        <>
          <Input
            autoFocus={focus}
            onChange={this.handleKeyPress}
            type="text"
            value={newValue}
          />
          <Actions>
            <Button icon={saveIcon} onClick={this.handleSave} title="Save" />
            <Button
              danger
              icon={exitIcon}
              onClick={this.handleCancel}
              title="Cancel"
            />
          </Actions>
        </>
      )
    }

    return <PlainItem>{value}</PlainItem>
  }

  render() {
    return <Wrapper>{this.renderItem()}</Wrapper>
  }
}

export default InfoItem
