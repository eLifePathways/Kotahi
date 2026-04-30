/* eslint-disable no-return-assign, no-unused-expressions */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react/prop-types */

import { createContext, useMemo, useRef, useState } from 'react'
import { takeRight } from 'lodash'
import { htmlTagNames, safeId, setInlineStyle } from '../utils'
import { callOn, onEntries, safeCall } from '../../../shared/generalUtils'

export const CssAssistantContext = createContext()

export const CssAssistantProvider = ({ children }) => {
  const context = useRef([])
  const validSelectors = useRef(null)
  const styleSheetRef = useRef(null)

  const history = useRef({
    prompts: { active: true, index: 0 },
    source: { redo: [], undo: [], limit: { undo: 20, redo: 20 } },
  })

  const selectionBoxRef = useRef(null)

  const [selectedCtx, setSelectedCtx] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)

  const [htmlSrc, setHtmlSrc] = useState(null)
  const [css, setCss] = useState(null)
  const [passedContent, setPassedContent] = useState('')
  const [copiedStyles, setCopiedStyles] = useState('')

  const [feedback, setFeedback] = useState('')

  const promptRef = useRef(null)
  const [userPrompt, setUserPrompt] = useState('')

  // #region CONTEXT ----------------------------------------------------------------
  const makeSelector = (node, parent) => {
    const tagName = node.localName || node.tagName.toLowerCase()

    const parentSelector = parent || ''

    const classNames =
      [...node.classList].length > 0 ? `.${[...node.classList].join('.')}` : ''

    const selector = `${
      parentSelector
        ? `${parentSelector} > ${tagName}${classNames}`
        : `${tagName}${node.id ? `#${node.id}` : ''}${classNames}`
    }`.trim()

    return { selector, tagName, classNames }
  }

  const makeSelectors = (node, parentSelector) => {
    const selectors = []
    const allChilds = node?.children ? [...node.children] : []

    const { selector } = makeSelector(node, parentSelector)

    selectors.push(selector)

    if (allChilds.length > 0) {
      allChilds.forEach(
        child =>
          (child.title = `${
            htmlTagNames[child.tagName.toLowerCase()]
          } : <${child.tagName.toLowerCase()}>`),
      )

      const allChildsSelectors = allChilds.flatMap(
        child => child && makeSelectors(child, selector),
      )

      if (allChildsSelectors) {
        selectors.push(...allChildsSelectors)
      }
    }

    return [...new Set(selectors)]
  }

  const getValidSelectors = (node, parentSelector = '') => {
    const selectors = makeSelectors(node, parentSelector)
    validSelectors.current = selectors
  }

  const newCtx = (node, parent, rules = {}, addSelector = true) => {
    const { selector, tagName } = makeSelector(node, parent)

    const dataRef = safeId(
      'aid-ctx',
      context.current.map(ctx => ctx.dataRef),
    )

    node.setAttribute('data-aidctx', dataRef)
    return {
      selector: addSelector ? selector : '',
      node,
      dataRef,
      tagName,
      rules,
      history: [],
    }
  }

  const addToCtx = ctx => {
    if (ctx.selector && getCtxBy('selector', ctx.selector)) return false
    context.current = [...context.current, ctx]
    return ctx
  }

  const getCtxBy = (by, prop, all) => {
    const method = all ? 'filter' : 'find'

    const ctxProps = {
      node: node => context.current[method](ctx => ctx.node === node),
      selector: selector =>
        context.current[method](ctx => ctx.selector === selector),
      tagName: tag => context.current[method](ctx => ctx.tagName === tag),
      dataRef: data => context.current[method](ctx => ctx.dataRef === data),
      default: node => context.current[method](ctx => ctx.node === node),
    }

    return callOn(by, ctxProps, [prop])
  }

  const addRules = (ctx, inputRules = {}) => {
    if (!ctx) return null
    const rules = { ...ctx.rules }
    onEntries(inputRules, (rule, value) => (rules[rule] = value))
    ctx.rules = rules

    return rules
  }

  const updateCtxNodes = () => {
    htmlSrc &&
      context.current.forEach(ctx => {
        if (ctx.node !== htmlSrc && !ctx.node) {
          const node = htmlSrc.querySelector(`[data-aidctx = ${ctx.dataRef}]`)
          ctx.node = node
          ctx.tagName = node.localName || node.tagName.toLowerCase()
        }
      })
  }

  const clearHistory = () => {
    selectedCtx.history = []
    setSelectedCtx({ ...selectedCtx })
  }

  const deleteLastMessage = () => {
    const newHistory = [...selectedCtx.history]
    newHistory.pop()
    selectedCtx.history = newHistory
    setSelectedCtx({ ...selectedCtx })
  }

  // #endregion CONTEXT -------------------------------------------------------------

  // #region HELPERS -----------------------------------------------------------------
  const createStyleSheet = onCreate => {
    if (!document.getElementById('css-assistant-scoped-styles')) {
      const styleTag = document.createElement('style')
      styleTag.id = 'css-assistant-scoped-styles'
      safeCall(onCreate)(styleTag)
      return styleTag
    }

    return document.getElementById('css-assistant-scoped-styles')
  }

  const updateSelectionBoxPosition = (yOffset = 10, xOffset = 10) => {
    if (selectedNode !== htmlSrc) {
      if (selectedNode && selectionBoxRef?.current) {
        const { top, left, height, width } =
          selectedNode.getBoundingClientRect()

        const parent = selectionBoxRef?.current?.parentNode
        const { left: pLeft, top: pTop } = parent.getBoundingClientRect()

        setInlineStyle(selectionBoxRef.current, {
          opacity: 1,
          left: `${left - pLeft - xOffset}px`,
          top: `${Math.floor(parent.scrollTop + top - pTop - yOffset)}px`,
          width: `${width + xOffset * 2}px`,
          height: `${height + yOffset * 2}px`,
          zIndex: '9',
        })
      }
    } else selectionBoxRef.current.style.opacity = 0
  }

  const onHistory = {
    addRegistry: (
      regKey,
      registry = {
        css: styleSheetRef.current.textContent,
        content: htmlSrc.innerHTML,
      },
    ) => {
      if (!registry) return
      const { source } = history.current

      const newRegistry = {
        undo: takeRight(source.undo.concat(registry), source.limit.undo),
        redo: takeRight(source.redo.concat(registry), source.limit.redo),
      }

      history.current.source[regKey] = newRegistry[regKey]
    },
    apply: regKey => {
      const { source } = history.current

      if (source[regKey].length < 1) return
      const lastRegistry = source[regKey].pop()

      onHistory.addRegistry(regKey === 'undo' ? 'redo' : 'undo', {
        css: styleSheetRef.current.textContent,
        content: htmlSrc.innerHTML,
      })

      styleSheetRef.current.textContent = lastRegistry.css
      setPassedContent(lastRegistry.content)
      setCss(lastRegistry.css)
    },
  }

  // #endregion HELPERS -----------------------------------------------------------------

  const dom = useMemo(() => {
    return {
      promptRef,
      styleSheetRef,
      createStyleSheet,
    }
  }, [styleSheetRef, promptRef])

  const ctx = useMemo(() => {
    return {
      context,
      history,
      validSelectors,
      selectedNode,
      selectedCtx,
      setSelectedCtx,
      setSelectedNode,
    }
  }, [context, history, selectedCtx, selectedNode, validSelectors])

  const chatGpt = useMemo(() => {
    return {
      css,
      htmlSrc,
      feedback,
      userPrompt,
      setCss,
      setHtmlSrc,
      setFeedback,
      setUserPrompt,
    }
  }, [css, htmlSrc, feedback, userPrompt])

  const nodeOptions = useMemo(() => {
    return {
      copiedStyles,
      setCopiedStyles,
    }
  }, [copiedStyles])

  return (
    <CssAssistantContext.Provider
      value={{
        ...dom,
        ...ctx,
        ...chatGpt,
        ...nodeOptions,
        getValidSelectors,
        makeSelector,
        addToCtx,
        getCtxBy,
        newCtx,
        addRules,
        clearHistory,
        updateCtxNodes,
        passedContent,
        selectionBoxRef,
        setPassedContent,
        updateSelectionBoxPosition,
        deleteLastMessage,
        onHistory,
      }}
    >
      {children}
    </CssAssistantContext.Provider>
  )
}

export const ModalContext = createContext()

export const ModalProvider = ({ children }) => {
  const [openModal, setOpenModal] = useState(false)
  const modalContent = useRef(null)

  const values = {
    openModal,
    modalContent,
    setOpenModal,
  }

  return (
    <ModalContext.Provider value={values}>{children}</ModalContext.Provider>
  )
}
