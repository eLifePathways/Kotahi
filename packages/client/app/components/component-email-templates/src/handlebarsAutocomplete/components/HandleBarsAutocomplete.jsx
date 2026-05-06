/* eslint-disable react-hooks/exhaustive-deps, react-hooks/refs */

import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { grid, th } from '@coko/client'
import { WaxContext } from 'wax-prosemirror-core'
import { FlexRow } from '../../../../component-cms-manager/src/style'
import { getUpdatedPosition, normalize } from '../helpers'
import { color } from '../../../../../theme'
import { DROPDOWN_ID, handlebars } from '../constants'
import Option from './Option'
import Each from '../../../../shared/Each'
import useHandlebarsAutoComplete from '../hooks/useHandlebarsAutoComplete'

// #region styleds ------------------------------------------------------
const OptionsDropdown = styled(FlexRow)`
  /* stylelint-disable declaration-no-important */

  align-items: flex-start;
  background-color: #ddd;
  border: 2px solid ${color.brand1.base};
  border-radius: ${th('borderRadius')};
  flex-direction: column;
  font-size: ${th('fontSizeBaseSmall')};
  gap: 0;
  height: fit-content !important;
  left: ${({ left }) => left}px;
  overflow: hidden;
  position: absolute;
  top: ${({ top }) => top}px;
  width: fit-content;
  z-index: 1000;
`

const Heading = styled(FlexRow)`
  background-color: ${color.brand1.shade25};
  color: #fff;
  padding: ${grid(0.5)} ${grid(1.2)};
  width: 100%;
`

const Options = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0;
  height: fit-content;
  justify-content: space-between;
  list-style: none;
  margin: 0;
  max-height: 202px;
  min-width: 260px;
  overflow-y: auto;
  padding: 0;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  scroll-snap-type: y mandatory;
  width: fit-content;

  ::-webkit-scrollbar {
    width: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #999;
    border-radius: 2px;
  }

  ::-webkit-scrollbar-track {
    background: #ddd;
  }

  > button:not(:last-child) {
    border-bottom: 1px solid ${color.brand1.tint70};
  }
`

// #endregion styleds ---------------------------------------------------

const HandleBarsAutocomplete = () => {
  const { searchData, select, index } = useHandlebarsAutoComplete()
  const { enabled, search } = searchData
  const ref = useRef(null)

  const ctx = useContext(WaxContext)
  const { main } = ctx?.pmViews ?? {}
  const [position, setPosition] = useState({})

  useLayoutEffect(() => {
    const dropdown = ref.current

    if (dropdown && enabled) {
      const coords = {
        surface: main.dom.getBoundingClientRect(),
        end: main.coordsAtPos(main.state.selection.to - 1),
        overlay: dropdown.getBoundingClientRect(),
      }

      const { left, top } = getUpdatedPosition(coords)

      setPosition({
        ...position,
        left,
        top,
      })
    }

    return () => setPosition({})
  }, [enabled, search])

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [ref.current])

  const optionsFilter = ({ value, label, form }) => {
    const s = normalize(search)
    const values = Object.values({ value, label, form }).map(normalize)
    const searchMatches = values.some(v => v?.startsWith(s))
    const valueHasBeenSet = values[0] === s
    return searchMatches && !valueHasBeenSet
  }

  const { variables } = handlebars?.stored || {}
  const filteredOptions = variables.filter(optionsFilter)
  const disabled = !enabled || !filteredOptions.length

  return disabled ? null : (
    <OptionsDropdown id={DROPDOWN_ID} ref={ref} {...position}>
      <Heading>
        <small>FORMS VARIABLES</small>
        <small>RESULTS: {filteredOptions.length}</small>
      </Heading>
      <Options aria-label="Form Variables List" role="listbox">
        <Each
          of={filteredOptions}
          render={(option, i) => (
            <Option option={option} select={select} selected={index === i} />
          )}
        />
      </Options>
    </OptionsDropdown>
  )
}

export default HandleBarsAutocomplete
