import { useLayoutEffect, useState } from 'react'
import { getBrackets, getBy, getOptionsFromDOM } from '../helpers'
import { BRACKETS_TYPES, DROPDOWN_ID, handlebars } from '../constants'
import useGlobalEvents from '../../../../../utils/useGlobalEvents'

const useHandlebarsAutoComplete = () => {
  const [searchData, setSearchData] = useState({ enabled: false, search: '' })
  const [index, setIndex] = useState(0)
  const updateSearch = entry => setSearchData(prev => ({ ...prev, ...entry }))

  useLayoutEffect(() => {
    const { selected } = getOptionsFromDOM(index)
    if (!selected) return
    const dropdown = document.getElementById(DROPDOWN_ID)
    selected.scrollIntoView({ block: 'start' })
    dropdown.scrollIntoView({ block: 'center' })
  }, [index, searchData.search])

  const onOpen = () => updateSearch({ enabled: true, search: '' })

  const onClose = () => {
    updateSearch({ enabled: false })
    setIndex(0)
  }

  const onFilter = filter => {
    updateSearch({ search: filter })
    setIndex(0)
  }

  const select = e => {
    const { range, view, variables, autocompleteConfig } = handlebars.stored
    const { className, markName } = autocompleteConfig
    const { dataset } = e?.target || getOptionsFromDOM(index).selected
    const { value } = dataset
    const { type, form } = getBy({ value }, variables)

    const [open, close] = getBrackets(BRACKETS_TYPES[type])
    const textToInsert = `${open} ${value} ${close}`

    const { from, to } = range
    const initialFrom = from
    const tr = view.state.tr.deleteRange(from, to).insertText(textToInsert)

    view.dispatch(
      tr.addMark(
        initialFrom,
        initialFrom + textToInsert.length,
        view.state.schema.marks[markName].create({
          class: `${className} ${form}-form`,
          id: '',
        }),
      ),
    )

    view.focus()
    updateSearch({ enabled: false, search: '' })
    setIndex(0)
  }

  const moveSelection = kind => {
    const { options } = getOptionsFromDOM(index)
    if (!options?.length) return
    setIndex(prev => {
      const newIndex = {
        ArrowDown: prev < options.length - 1 ? prev + 1 : 0,
        ArrowUp: prev > 0 ? prev - 1 : options.length - 1,
      }

      return newIndex[kind]
    })
  }

  // prosemirror autocomplete reducer side effects
  const eventListeners = {
    open: onOpen,
    close: onClose,
    filter: onFilter,
    ArrowUp: moveSelection,
    ArrowDown: moveSelection,
    enter: select,
  }

  useGlobalEvents('handlebars', eventListeners)

  return { index, select, searchData }
}

export default useHandlebarsAutoComplete
