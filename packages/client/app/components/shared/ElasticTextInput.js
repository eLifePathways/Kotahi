/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

import { useRef, useEffect } from 'react'
import ContentEditable from 'react-contenteditable'
import { escape } from 'lodash'
import styled from 'styled-components'
import { th } from '@coko/client'
import { color } from '../../theme'

const stripTags = html => {
  const tempDiv = document.createElement('DIV')
  tempDiv.innerHTML = html
  return tempDiv.innerText
}

const InputBlock = styled(ContentEditable)`
  border-radius: ${th('borderRadius')};
  padding: 0 2px;
  word-break: break-word;

  &:focus,
  &:hover {
    outline: 1px solid ${color.brand1.base};
  }
`

/** Like a normal text input, but it dynamically resizes to
 * fit the content. This can be styled as block or inline,
 * have its dimensions constrained, etc.
 */
const ElasticTextInput = ({
  autoFocus,
  className,
  onBlur,
  onChange,
  onFocus,
  onKeyDown,
  spellCheck,
  value,
}) => {
  const elementRef = useRef(null)
  const html = escape(value)

  useEffect(() => {
    if (autoFocus && elementRef.current) elementRef.current.focus()
  }, [elementRef])

  return (
    <InputBlock
      className={className}
      html={html}
      innerRef={elementRef}
      onBlur={e => onBlur && onBlur(e)}
      onChange={e => onChange(stripTags(e.target.value))}
      onFocus={e => onFocus && onFocus(e)}
      onKeyDown={e => {
        if (onKeyDown) onKeyDown(e)
        if (e.defaultPrevented) return

        if (e.key === 'Enter') {
          e.stopPropagation()
          e.preventDefault()
        }
      }}
      spellCheck={spellCheck}
      tagName="div"
    />
  )
}

export default ElasticTextInput
