/* eslint-disable react-hooks/exhaustive-deps, react-hooks/immutability */
/* eslint-disable react/prop-types */

/* eslint-disable new-cap */

import { useEffect, useContext, useCallback, useState } from 'react'
import { omit } from 'lodash'
import styled from 'styled-components'
import Color from 'color'
import { TextAreaBinding } from 'y-textarea'

import { TextField } from '../../../../pubsweet'
import { Spinner } from '../../../../shared'
import YjsContext from '../../../../provider-yjs/YjsProvider'

const TextFieldSyled = styled(TextField)`
  position: relative;

  .selectedText {
    border-radius: 2px;
  }

  .nameTag {
    border-radius: 3px;
    color: white;
    font-family: Verdana, Geneva, sans-serif;
    font-size: 12px;
    font-style: italic;
    font-weight: 400;
    padding: 3px;
  }

  input:disabled {
    background-color: unset;
    border: 0;
  }
`

const arrayColor = [
  '#4363d8',
  '#ffe119',
  '#800000',
  '#dcbeff',
  '#000075',
  '#f58231',
  '#469990',
  '#f032e6',
  '#9a6324',
  '#42d4f4',
  '#e6194b',
  '#fabed4',
  '#3cb44b',
  '#911eb4',
  '#bfef45',
  '#808000',
  '#ffd8b1',
  '#aaffc3',
]

const CollaborativeTextFieldBuilder = ({ collaborativeObject, ...input }) => {
  const { wsProvider, ydoc } = useContext(YjsContext)
  const fieldType = `textInput-${input.name}`

  let currentUser = null

  if (collaborativeObject?.currentUser) {
    currentUser = collaborativeObject.currentUser
  }

  const [text, setText] = useState(null)

  let areaBinding = null

  useEffect(() => {
    return () => {
      areaBinding?.destroy()
    }
  }, [ydoc?.guid])

  const startTextYjs = useCallback(
    node => {
      if (node !== null) {
        const color = Color(
          arrayColor[Math.floor(Math.random() * arrayColor.length)],
        )
          .rgb()
          .object()

        const yTextInput = ydoc.getText(fieldType)
        areaBinding = new TextAreaBinding(yTextInput, node, {
          awareness: wsProvider.awareness,
          clientName: currentUser ? currentUser.username : 'Anonymous',
          color,
        })
      }
    },
    [wsProvider, ydoc],
  )

  if (!wsProvider || !ydoc) return <Spinner />

  return (
    <TextFieldSyled
      id={input.name}
      innerRefProp={startTextYjs}
      {...omit(input, ['value', 'onChange'])}
      onChange={event => {
        setText(event.currentTarget.value)
        input.onChange(`${collaborativeObject.identifier}-${input.name}`)
      }}
      value={text}
    />
  )
}

export default CollaborativeTextFieldBuilder
