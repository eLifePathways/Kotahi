// @ts-nocheck

/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-hooks/rules-of-hooks */

import { useContext } from 'react'
import { decorate, injectable, inject } from 'inversify'
import { isEmpty } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import styled from 'styled-components'
import { WaxContext, ToolGroup } from 'wax-prosemirror-core'
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'

const DropdownStyled = styled(Dropdown)`
  /* stylelint-disable selector-class-pattern */

  display: inline-flex;
  white-space: nowrap;
  cursor: not-allowed;
  opacity: ${props => (props.select ? 1 : 0.4)};
  pointer-events: ${props => (props.select ? 'default' : 'none')};

  .Dropdown-control {
    border: none;
    padding: 6px 52px 6px 6px;
  }

  .Dropdown-arrow {
    right: 25px;
    top: 16px;
  }

  .Dropdown-menu {
    top: calc(100% + 2px);
    width: 120%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .Dropdown-option {
      width: 100%;
    }
  }
`

class KotahiBlockDropDown extends ToolGroup {
  tools = []
  /* stylelint-disable */

  constructor(
    @inject('Title') title,
    @inject('Heading2') heading2,
    @inject('Heading3') heading3,
    @inject('Heading4') heading4,
    @inject('Heading5') heading5,
    @inject('Heading6') heading6,
    @inject('Paragraph') paragraph,
  ) {
    /* stylelint-enable */

    super()

    this.tools = [
      title,
      heading2,
      heading3,
      heading4,
      heading5,
      heading6,
      paragraph,
    ]
  }

  renderTools(view) {
    if (isEmpty(view) || window.innerWidth > 18800) return null

    const { activeViewId, pmViews } = useContext(WaxContext)

    const { dispatch, state } = view

    const dropDownOptions = [
      { label: 'Title', value: 0, item: this._tools[0] },
      { label: 'Heading 2', value: 1, item: this._tools[1] },
      { label: 'Heading 3', value: 2, item: this._tools[2] },
      { label: 'Heading 4', value: 3, item: this._tools[3] },
      { label: 'Heading 5', value: 4, item: this._tools[4] },
      { label: 'Heading 6', value: 5, item: this._tools[5] },
      { label: 'Paragraph', value: 6, item: this._tools[6] },
    ]

    const isEditable = pmViews.main.props.editable(editable => {
      return editable
    })

    let found = ''
    dropDownOptions.forEach(item => {
      if (item.item.active(state, activeViewId) === true) {
        found = item.item.label
      }
    })

    return (
      <DropdownStyled
        key={uuidv4()}
        onChange={option => {
          this._tools[option.value].run(state, dispatch)
        }}
        options={dropDownOptions}
        placeholder="Block Level"
        select={isEditable}
        value={found}
      />
    )
  }
}

decorate(injectable(), KotahiBlockDropDown)

export default KotahiBlockDropDown
