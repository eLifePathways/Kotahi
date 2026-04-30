/* eslint react/prop-types: 0 */
/* stylelint-disable string-quotes */

import { useContext, useMemo } from 'react'
import styled from 'styled-components'
import {
  WaxContext,
  /* ApplicationContext, */
  MenuButton /*, DocumentHelpers */,
} from 'wax-prosemirror-core'
import { TextSelection } from 'prosemirror-state'

const AnyStyleDiv = styled(MenuButton)`
  margin-top: 8px;
  outline: 1px solid #ccc;

  &::after {
    background: #fff;
    border-radius: 4px;
    content: '';
    height: 100%;
    position: absolute;
    transition: 0.25s;
    width: 100%;
    z-index: 1;
  }

  & span {
    z-index: 2;
  }

  &:hover {
    &::after {
      background: #f1f5ff;
    }

    & span {
      /* stylelint-disable-next-line declaration-no-important */
      border-bottom-color: transparent !important;
    }
  }
`

const AnyStyleButton = ({ view = {}, item, anyStyle }) => {
  const { active, icon, label, /* run, */ select, title } = item

  const {
    pmViews: { main },
    activeViewId,
    activeView,
  } = useContext(WaxContext)

  // const { app } = useContext(ApplicationContext)

  const { /* dispatch, */ state } = view
  // const serviceConfig = app.config.get('config.AnyStyleService')

  const handleMouseDown = (e, editorState) => {
    e.preventDefault()

    const {
      selection: { from, to, $from, $to },
    } = editorState

    if (from < to) {
      // this protects against no selection

      const textSelection = new TextSelection($from, $to)

      const content = textSelection.content()

      const outputArray = []

      content.content.descendants(x => {
        if (x.type.name === 'paragraph') {
          outputArray.push(`${x.textContent}\n`)
        }
      })

      if (outputArray.length === 0) {
        // If we didn't find any paragraph nodes, look for text nodes
        content.content.descendants(x => {
          if (x.type.name === 'text') {
            outputArray.push(x.textContent)
          }
        })
      }

      // just in case
      if (outputArray.length) {
        anyStyle({ content: outputArray.join('') })
      } else {
        console.error('No text found in selection')
      }
    }
  }

  // useEffect(() => {}, [])

  const isActive = !!active(state, activeViewId)
  let isDisabled = !select(state, activeViewId, activeView)

  const isEditable = main.props.editable(editable => {
    return editable
  })

  if (!isEditable) isDisabled = true

  const AnyStyleButtonComponent = useMemo(
    () => (
      <AnyStyleDiv
        active={isActive || false}
        disabled={isDisabled}
        iconName={icon}
        label={label}
        onMouseDown={e => handleMouseDown(e, activeView.state, view.dispatch)}
        title={title}
      />
    ),
    [isActive, isDisabled],
  )

  return AnyStyleButtonComponent
}

export default AnyStyleButton
