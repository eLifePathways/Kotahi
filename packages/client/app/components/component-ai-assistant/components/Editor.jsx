/* eslint-disable react-hooks/exhaustive-deps, react-hooks/immutability */

/* eslint-disable react/prop-types */
import { useContext, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { CssAssistantContext } from '../hooks/CssAssistantContext'
import { setImagesDefaultStyles } from '../utils'
import FullWaxEditor from '../../wax-collab/src/FullWaxEditor'
import useIncrementalTarget from '../hooks/useIncrementalTarget'

const StyledEditor = styled.div`
  border: none;
  outline: none;
  position: relative;
  width: 100%;
  z-index: 1;

  > div {
    background: #fff;
    box-shadow: 0 0 5px #0002;
    margin-bottom: 20px;
    min-height: 100%;
    padding: 20px;
  }

  &:hover {
    border: none;
    outline: none;
  }
`

const HiddenWaxEditor = styled.div`
  height: 1px;
  overflow: hidden;
  position: absolute;
  visibility: hidden;
  width: 1px;
`

const Editor = ({
  stylesFromSource,
  contentEditable,
  enablePaste,
  currentUser,
  manuscript,
  setComments,
}) => {
  const {
    setHtmlSrc,
    htmlSrc,
    getValidSelectors,
    passedContent,
    setPassedContent,
    setSelectedCtx,
    addToCtx,
    newCtx,
    styleSheetRef,
    getCtxBy,
    setSelectedNode,
    setCss,
    promptRef,
    createStyleSheet,
    onHistory,
  } = useContext(CssAssistantContext)

  const selectionHandler = useIncrementalTarget(500)
  const editorRef = useRef(null)

  const handlePaste = e => {
    e.preventDefault()

    const clipboardData = e.clipboardData || window.clipboardData
    const dataToPaste = clipboardData.getData('text/html')
    if (!dataToPaste) return
    onHistory.addRegistry('undo')
    setPassedContent(dataToPaste)
  }

  useEffect(() => {
    if (htmlSrc) {
      const allChilds = [...htmlSrc.children]

      styleSheetRef.current = createStyleSheet(styleTag =>
        htmlSrc.parentNode.insertBefore(styleTag, htmlSrc),
      )

      if (stylesFromSource) {
        styleSheetRef.current.textContent = stylesFromSource
      }

      addToCtx(newCtx(htmlSrc))
      setSelectedCtx(getCtxBy('node', htmlSrc))
      setSelectedNode(htmlSrc)
      setCss(styleSheetRef.current.textContent)
      allChilds.forEach(child => {
        child.addEventListener('click', handleSelection)
      })
      getValidSelectors(htmlSrc)

      htmlSrc.parentNode.addEventListener('click', handleSelection)
    }
  }, [htmlSrc])

  useEffect(() => {
    return () => {
      if (htmlSrc) {
        ;[...htmlSrc.children].forEach(child =>
          child.removeEventListener('click', handleSelection),
        )
        htmlSrc.parentNode.removeEventListener('click', handleSelection)
      }
    }
  }, [])

  useEffect(() => {
    if (editorRef?.current) {
      setHtmlSrc(editorRef.current)
      getValidSelectors(editorRef.current)
      // ;[...editorRef.current.children].forEach(removeStyleAttribute)
      setImagesDefaultStyles(editorRef.current)
    }
  }, [passedContent])

  const handleSelection = e => {
    // stop if the related element is a tool or if user has made 3 clicks (that means that the intention is to edit text instead of selecting the element)
    if (e.target.className === 'element-options') return
    e.preventDefault()
    e.stopPropagation()
    selectionHandler(e, target => {
      if (htmlSrc.contains(target)) {
        // update the node in ctx if it was recreated
        if (
          !getCtxBy('node', target) &&
          getCtxBy('dataRef', target.dataset.aidctx)
        ) {
          getCtxBy('dataRef', target.dataset.aidctx).node = target
        }

        const ctx =
          getCtxBy('node', target) ||
          getCtxBy('dataRef', target.dataset.aidctx) ||
          addToCtx(newCtx(target, null, {}, false))

        setSelectedCtx(ctx)
        setSelectedNode(target)
      } else {
        setSelectedCtx(getCtxBy('node', htmlSrc))
        setSelectedNode(htmlSrc)
      }

      if (!contentEditable) promptRef.current.focus()
    })
  }

  return (
    <>
      <StyledEditor
        contentEditable={contentEditable}
        dangerouslySetInnerHTML={{ __html: passedContent }}
        id="assistant-ctx"
        onPaste={enablePaste ? handlePaste : () => {}}
        ref={editorRef}
        setComments={setComments}
      />
      {!passedContent && (
        <HiddenWaxEditor>
          <FullWaxEditor
            getActiveViewDom={setPassedContent}
            readonly={!contentEditable}
            setComments={setComments}
            user={currentUser}
            value={manuscript.meta.source}
          />
        </HiddenWaxEditor>
      )}
    </>
  )
}

export default Editor
