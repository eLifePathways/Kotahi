/* eslint-disable react-hooks/immutability */

/* eslint-disable no-unused-expressions */
/* eslint-disable jsx-a11y/no-autofocus */

/* eslint-disable react/prop-types */
/* stylelint-disable color-function-notation, alpha-value-notation */

import { useState } from 'react'
import styled from 'styled-components'
import ChatWaxEditor from '../ChatWaxEditor'
import color from '../../../../theme/color'

const EditorWrapper = styled.div`
  position: relative;
`

const Suggestions = styled.div`
  background-color: ${color.white};
  bottom: 34px;
  margin-top: -74px;
  min-width: 100px;
  position: absolute;
  z-index: 99999;
`

const List = styled.ul`
  border: 1px solid rgba(0, 0, 0, 0.15);
  font-size: 14;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;

  .mentions__suggestions__item {
    border-bottom: 1px solid rgba(0, 0, 0, 0.15);
    color: ${color.text};
    cursor: pointer;
    padding: 5px 15px;
  }

  .mentions__suggestions__item--focused {
    background-color: ${color.gray97};
  }
`

const ActionKind = {
  open: 'open',
  close: 'close',
  filter: 'filter',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  enter: 'enter',
}

const EditorMention = ({
  field: { setFieldValue, name, value },
  mentionsList,
  readOnly,
  id,
  onEnterPress,
  editorRef,
  placeholder,
  autoFocus,
  hasAttachment,
  networkDisabled,
}) => {
  let filter = ''
  let currentIndex = 0

  const [stateFilter, setFilter] = useState()
  const [listStyle, setListStyle] = useState({ left: `${0}px` })

  const [picker, setPicker] = useState({
    view: null,
    open: false,
    current: 0,
    range: null,
  })

  const MAX_SUGGESTIONS = 5

  let filteredList = mentionsList

  let NUM_SUGGESTIONS = filteredList?.length

  stateFilter
    ? (filteredList = mentionsList.filter(x =>
        x.username.toLowerCase().startsWith(stateFilter.toLowerCase()),
      ))
    : (filteredList = mentionsList)

  // Slice the filteredList to show only the five  users
  filteredList = filteredList.slice(0, MAX_SUGGESTIONS)

  NUM_SUGGESTIONS = filteredList?.length

  // show items, handle positioning
  const placeSuggestion = () => {
    const rect = document
      .getElementsByClassName('autocomplete')[0]
      .getBoundingClientRect()

    const editorDescription = document
      .getElementById(`${id}`)
      .getBoundingClientRect()

    setListStyle({
      left: `${rect.left - editorDescription.left + 16}px`,
    })
  }

  const handleClickOption = item => {
    const { from, to } = picker.range

    const tr = picker.view.state.tr
      .deleteRange(from, to) // This is the full selection
      .insertText(`@${item.username} `)
      .addMark(
        from,
        from + item.username.length + 1,
        picker.view.state.schema.marks.mention_tag.create({
          class: 'mention-tag',
          id: item.id,
        }),
      )

    picker.view.dispatch(tr)
    picker.view.focus()

    setPicker({
      ...picker,
      open: false,
    })

    filter = ''
    setFilter('')
    currentIndex = 0
    return true
  }

  // mentions reducer
  const autoCompleteReducer = action => {
    switch (action.kind) {
      case ActionKind.open:
        setPicker({
          view: action.view,
          current: 0,
          open: true,
          range: action.range,
        })

        placeSuggestion(action)

        return true
      case ActionKind.close:
        currentIndex = 0

        setPicker({
          ...picker,
          current: 0,
          view: action.view,
          open: false,
        })

        return true
      case ActionKind.filter:
        currentIndex = 0
        filter = action.filter
        setFilter(action.filter)
        setPicker({
          open: true,
          range: action.range,
          view: action.view,
          current: currentIndex,
        })
        return true

      case ActionKind.up: {
        filter
          ? (filteredList = mentionsList.filter(x =>
              x.username.includes(filter),
            ))
          : (filteredList = mentionsList)

        NUM_SUGGESTIONS = filteredList.length

        currentIndex -= 1
        currentIndex += NUM_SUGGESTIONS // negative modulus doesn't work
        currentIndex %= NUM_SUGGESTIONS

        setPicker({
          open: true,
          range: action.range,
          view: action.view,
          current: currentIndex,
        })

        return true
      }

      case ActionKind.down: {
        filter
          ? (filteredList = mentionsList.filter(x =>
              x.username.includes(filter),
            ))
          : (filteredList = mentionsList)

        NUM_SUGGESTIONS = filteredList.length

        currentIndex += 1
        currentIndex %= NUM_SUGGESTIONS

        setPicker({
          open: true,
          range: action.range,
          view: action.view,
          current: currentIndex,
        })

        return true
      }

      case ActionKind.enter: {
        filter
          ? (filteredList = mentionsList.filter(x =>
              x.username.includes(filter),
            ))
          : (filteredList = mentionsList)

        NUM_SUGGESTIONS = filteredList?.length

        const item = filteredList[currentIndex]
        const oldFrom = action.range.from

        if (!item) {
          setFilter('')
          return false
        }

        const tr = action.view.state.tr
          .deleteRange(action.range.from, action.range.to)
          .insertText(`@${item.username} `)

        action.view.dispatch(
          tr.addMark(
            oldFrom,
            oldFrom + item.username.length + 1,
            action.view.state.schema.marks.mention_tag.create({
              class: 'mention-tag',
              id: item.id,
            }),
          ),
        )

        action.view.focus()
        setFilter('')
        filter = ''

        return true
      }

      default:
        return false
    }
  }

  return (
    <EditorWrapper id={id}>
      {picker.open && (
        <Suggestions style={listStyle}>
          <List
            className="mentions__suggestions__list"
            id="suggestion"
            role="listbox"
          >
            {filteredList.map((item, i) => (
              <li
                aria-selected="false"
                className={`mentions__suggestions__item ${
                  picker.current === i && 'mentions__suggestions__item--focused'
                }`}
                key={item.id}
                onClick={() => handleClickOption(item)}
                onKeyPress={() => handleClickOption(item)}
                role="option"
              >
                {item.username}
              </li>
            ))}
          </List>
        </Suggestions>
      )}
      <ChatWaxEditor
        autoCompleteReducer={autoCompleteReducer}
        autoFocus={autoFocus}
        editorRef={editorRef}
        editorType="issues"
        field={{ name, value }}
        form={{ setFieldValue }}
        hasAttachment={hasAttachment}
        networkDisabled={networkDisabled}
        onEnterPress={onEnterPress}
        placeholder={placeholder}
        readonly={readOnly}
      />
    </EditorWrapper>
  )
}

export default EditorMention
