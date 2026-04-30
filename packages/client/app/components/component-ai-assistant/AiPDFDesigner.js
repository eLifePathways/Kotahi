/* eslint-disable no-unused-expressions */
/* eslint-disable react-hooks/exhaustive-deps, react-hooks/immutability, react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */

/* stylelint-disable no-descending-specificity */
import { useContext, useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import {
  Clipboard,
  Copy,
  CornerDownLeft,
  CornerDownRight,
  Delete,
  Printer,
  RefreshCw,
  X,
} from 'react-feather'
import { takeRight } from 'lodash'
import { gql, useLazyQuery } from '@apollo/client'
import Editor from './components/Editor'
import PromptsInput from './PromptsInput'
import {
  srcdoc,
  initialPagedJSCSS,
  htmlTagNames,
  cssTemplate1,
  cssTemplate3,
  setScrollFromPercent,
  getScrollPercent,
  setInlineStyle,
  addElement,
  // finishReasons,
  systemGuidelinesV2,
  finishReasons,
} from './utils'
import SelectionBox from './SelectionBox'
import { CssAssistantContext } from './hooks/CssAssistantContext'
import ChatBubble from './ChatBubble'
import ChatHistory from './ChatHistory'
import Checkbox from './components/Checkbox'
// import useChatGpt from './hooks/useChatGpt'
import { color } from '../../theme'
import { ConfigContext } from '../config/src'

const CHAT_GPT_QUERY = gql`
  query ChatGpt(
    $input: UserMessage!
    $groupId: ID!
    $history: [OpenAiMessage]
  ) {
    openAi(input: $input, groupId: $groupId, history: $history)
  }
`

// #region styled
const Assistant = styled(PromptsInput)`
  margin: 10px 0;
  width: 480px;
`

const editorLoadingAnim = keyframes`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
`

const CssAssistantUi = styled.div`
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  padding: 0 5px;

  > :last-child {
    > button {
      background: none;
      border: none;
      cursor: pointer;
      outline: none;
      padding: 0;

      > svg {
        stroke: ${color.brand1.base};
      }
    }
    color: ${color.brand1.base};
    display: flex;
    gap: 5px;
  }
`

const StyledHeading = styled.div`
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #0004;
  display: flex;
  flex-direction: row;
  height: fit-content;
  justify-content: space-between;
  padding: 0 0 0 10px;
  scrollbar-color: ${color.brand1.base};
  scrollbar-width: thin;
  width: 100%;
`

const Root = styled.div`
  border: 1px solid #0002;
  border-radius: 0 8px 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-top: -1px;
  overflow: hidden;
  position: relative;
  width: 100%;
`

const EditorContainer = styled.div`
  background: #eee;
  display: flex;
  filter: ${p => (p.$loading ? 'blur(2px)' : '')};
  height: 100%;
  overflow: auto;
  padding: 40px;
  position: relative;
  transition: width 0.5s;
  user-select: none;

  ::-webkit-scrollbar {
    height: 5px;
    width: 5px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${color.brand1.base};
    border-radius: 5px;
    width: 5px;
  }

  ::-webkit-scrollbar-track {
    background: #fff0;
    padding: 5px;
  }
`

const PreviewIframe = styled.iframe`
  border: none;
  display: flex;
  height: 100%;
  width: 100%;
`

const CheckBoxes = styled.div`
  border-left: 1px solid #0002;
  color: #555;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  line-height: 1.3;
  min-width: 150px;
  padding: 0;

  > span {
    padding: 5px 10px;
  }
`

const WindowsContainer = styled.div`
  display: flex;
  height: calc(100vh - 182px);
  width: 100%;
`

const StyledWindow = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  transition: width 0.5s ease;
  width: ${p => (p.$show ? '100%' : '0')};
`

const WindowHeading = styled.div`
  align-items: center;
  background-color: #efefef;
  box-shadow:
    inset 0 0 5px #fff4,
    0 0 2px #0009;
  color: #777;
  display: flex;
  font-size: 12px;
  font-weight: bold;
  justify-content: space-between;
  line-height: 1;
  min-height: 23px;
  padding: 2px 10px;
  white-space: nowrap;
  z-index: 99;

  svg {
    stroke: ${color.brand1.base};
  }

  > :first-child {
    color: #aaa;
  }
`

const WindowDivision = styled.div`
  background-color: #fff;
  height: 100%;
  outline: 1px solid #0004;
  width: 5px;
  z-index: 999;
`

const WindowHeadingControls = styled.span`
  align-items: center;
  display: flex;
  gap: 5px;

  button {
    align-items: center;
    background: #fff0;
    border: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    margin: 0;
    padding: 0;
    padding-right: 4px;
    width: 20px;
  }

  button:not(:last-child) {
    border-right: 1px solid #0002;
  }

  svg {
    height: 15px;
    stroke: #777;
    width: 15px;

    &:hover {
      stroke: ${color.brand1.base};
    }
  }
`

const LoadingOverlay = styled.div`
  height: 100%;
  position: absolute;
  width: 100%;
  z-index: 9999;
`

const OverlayAnimated = styled(LoadingOverlay)`
  align-items: center;
  background: #fff6;
  display: flex;
  justify-content: center;
  opacity: ${p => (p.$loading ? 1 : 0)};
  pointer-events: none;
  transition: opacity 1.5s;

  > span {
    animation: ${p => (p.$loading ? editorLoadingAnim : 'none')} 1.5s infinite;
    color: ${color.brand1.base};
    font-size: 40px;
  }
`

const StyledCheckbox = styled(Checkbox)``
// #endregion styled

const defaultSettings = {
  advancedTools: true,
  editor: {
    contentEditable: false,
    enablePaste: true,
    enableSnippets: false,
    selectionColor: { bg: 'dark', border: 'dark' }, // can be: dark, light, magenta
  },
  historyMax: 10,
  ui: {
    icons: {
      delete: Delete,
      copy: Copy,
      paste: Clipboard,
      undo: CornerDownLeft,
      redo: CornerDownRight,
      print: Printer,
      update: RefreshCw,
      close: X,
    },
  },
}

const AiPDFDesigner = ({
  bookTitle,
  passedSettings,
  currentUser,
  manuscript,
  setComments,
}) => {
  const {
    css,
    htmlSrc,
    setSelectedCtx,
    setSelectedNode,
    context,
    selectedCtx,
    passedContent,
    updateSelectionBoxPosition,
    styleSheetRef,
    setCss,
    selectedNode,
    setFeedback,
    setUserPrompt,
    addRules,
    onHistory,
    getValidSelectors,
    history,
    clearHistory,
    updateCtxNodes,
    userPrompt,
    getCtxBy,
    validSelectors,
  } = useContext(CssAssistantContext)

  const config = useContext(ConfigContext)

  const previewScrollTopRef = useRef(0)
  const previewRef = useRef(null)
  const [previewSource, setPreviewSource] = useState(null)
  const [livePreview, setLivePreview] = useState(true)
  const [showEditor, setShowEditor] = useState(true)
  const [showPreview, setShowPreview] = useState(true)
  const [showChat, setShowChat] = useState(false)

  // eslint-disable-next-line no-unused-vars
  const [settings, setSettings] = useState({
    ...defaultSettings,
    ...passedSettings,
  })

  const [callOpenAi, { loading, error }] = useLazyQuery(CHAT_GPT_QUERY, {
    onCompleted: ({ openAi: chatGPT }) => {
      // eslint-disable-next-line camelcase
      const { message = '', finish_reason = '' } = JSON.parse(chatGPT)

      if (message.content.startsWith('{')) {
        try {
          const response = JSON.parse(message.content)

          const {
            css: resCss,
            rules,
            feedback,
            content = '',
            insertHtml,
          } = response

          if (resCss || insertHtml || rules || content) {
            onHistory.addRegistry('undo')
            history.current.source.redo = []
          }

          const ctxIsHtmlSrc = selectedCtx.node === htmlSrc

          if (rules && !ctxIsHtmlSrc) {
            addRules(selectedCtx, rules)
            setInlineStyle(selectedCtx.node, rules)
          } else if (resCss) {
            styleSheetRef.current.textContent = resCss
            setCss(styleSheetRef.current.textContent)
          }

          insertHtml && addElement(selectedNode, insertHtml)
          content && (selectedCtx.node.innerHTML = content)
          feedback && setFeedback(feedback)
          feedback &&
            selectedCtx.history.push({ role: 'assistant', content: feedback })
          updatePreview()
          /* eslint-disable-next-line */
        } catch (err) {
          /* eslint-disable-next-line camelcase */
          if (finishReasons[finish_reason]) {
            /* eslint-disable-next-line camelcase */
            setFeedback(finishReasons[finish_reason])
            selectedCtx.history.push({
              role: 'assistant',
              /* eslint-disable-next-line camelcase */
              content: finishReasons[finish_reason],
            })
          }
        }
      } else {
        setFeedback(
          'There was an error generating the response\n Please, try again in a few seconds',
        )
      }

      setUserPrompt('')
    },
  })

  useEffect(() => {
    showPreview && livePreview && updatePreview()
  }, [htmlSrc, css, passedContent])

  useEffect(() => {
    showPreview && updatePreview()
    !showPreview && !showEditor && setShowEditor(true)
  }, [showPreview])

  useEffect(() => {
    if (!showEditor) {
      setSelectedCtx(context.current.find(ctx => ctx.node === htmlSrc))
      setSelectedNode(htmlSrc)
      !showPreview && setShowPreview(true)
    }

    updatePreview()
  }, [showEditor])

  useEffect(() => {
    error &&
      setFeedback(
        'There was an error generating the response\n Please, try again in a few seconds',
      )
  }, [error])

  const handleScroll = e => {
    const iframeElement = previewRef?.current?.contentDocument?.documentElement
    if (!iframeElement) return
    const percentage = Math.round(getScrollPercent(e.target))
    iframeElement.scrollTo(0, setScrollFromPercent(iframeElement, percentage))
  }

  const handleSend = async e => {
    if (loading) return
    e.preventDefault()
    userPrompt && setFeedback('Just give me a few seconds')
    userPrompt
      ? callOpenAi({
          variables: {
            groupId: config.groupId,
            input: {
              text: `${userPrompt}. NOTE: Remember to always return the expected valid JSON, have a second thought on this before responding`,
            },
            history: [
              {
                role: 'system',
                content: systemGuidelinesV2({
                  ctx: selectedCtx || getCtxBy('node', htmlSrc),
                  sheet: styleSheetRef?.current?.textContent,
                  selectors: validSelectors?.current?.join(', '),
                  providedText:
                    selectedNode !== htmlSrc && selectedCtx.node.innerHTML,
                }),
              },

              ...(takeRight(selectedCtx.history, settings.historyMax) || []),
            ],
          },
        })
      : setFeedback('Please, tell me what you want to do')
    selectedCtx.history.push({ role: 'user', content: userPrompt })
  }

  const updatePreview = manualUpdate => {
    const previewDoc = previewRef?.current?.contentDocument?.documentElement

    previewDoc &&
      previewDoc.scrollTop > 0 &&
      (previewScrollTopRef.current = previewDoc.scrollTop)

    css &&
      htmlSrc?.outerHTML &&
      (livePreview || manualUpdate) &&
      setPreviewSource(
        srcdoc(
          htmlSrc,
          css,
          cssTemplate1 + cssTemplate3,
          previewScrollTopRef.current,
        ),
      )
    updateCtxNodes()
    updateSelectionBoxPosition()
    htmlSrc && getValidSelectors(htmlSrc)
  }

  return (
    <Root>
      {settings.enableSnippets && <style id="aid-snippets" />}
      <StyledHeading>
        <CssAssistantUi>
          <ChatBubble
            forceHide={showChat}
            hasApiKey={config?.integrations?.aiDesignStudio?.apiKey}
            icons={settings.ui.icons}
            onRight
          />
          <Assistant
            enabled
            loading={loading}
            onSend={handleSend}
            placeholder="Type here how your article should look..."
          />
          <span>
            <button
              label="undo"
              onClick={() => onHistory.apply('undo')}
              title="Undo (Ctrl + z)"
              type="button"
            >
              <settings.ui.icons.undo />
            </button>
            <button
              label="redo"
              onClick={() => onHistory.apply('redo')}
              title="Redo (Ctrl + y)"
              type="button"
            >
              <settings.ui.icons.redo />
            </button>
          </span>
        </CssAssistantUi>
        <CheckBoxes>
          <span>
            <StyledCheckbox
              checked={showEditor || (!showPreview && !showEditor)}
              handleChange={() => setShowEditor(!showEditor)}
              id="showContent"
              label="Content"
              style={{ margin: 0 }}
            />
            <StyledCheckbox
              checked={showPreview}
              handleChange={() => setShowPreview(!showPreview)}
              id="showPreview"
              label="PDF Preview"
              style={{ margin: 0 }}
            />
            <StyledCheckbox
              checked={showChat}
              handleChange={() => setShowChat(!showChat)}
              id="showChatHistory"
              label="Chat History"
              style={{ margin: 0 }}
            />
          </span>
        </CheckBoxes>
      </StyledHeading>
      <WindowsContainer>
        <StyledWindow $show={showChat} style={{ maxWidth: '30%' }}>
          <WindowHeading>
            <span>CHAT HISTORY</span>
            <WindowHeadingControls>
              <button
                label="clear history"
                onClick={clearHistory}
                title="Clear history (not undoable)"
                type="button"
              >
                <Delete />
              </button>
            </WindowHeadingControls>
          </WindowHeading>
          <ChatHistory currentUser={currentUser} settings={settings} />
        </StyledWindow>
        {showChat && (showEditor || showPreview) && <WindowDivision />}

        <StyledWindow $show={showEditor}>
          <WindowHeading>
            <span>
              CONTENT SELECTION{bookTitle ? ` for: "${bookTitle}"` : ':'}
            </span>
            <span>
              Selection:{' '}
              {selectedCtx?.node && selectedCtx.node !== htmlSrc
                ? htmlTagNames[selectedCtx.tagName]
                : 'PDF'}
            </span>
          </WindowHeading>
          {loading && <LoadingOverlay />}
          <OverlayAnimated $loading={loading}>
            <span>Processing...</span>
          </OverlayAnimated>
          <EditorContainer $loading={loading} onScroll={handleScroll}>
            <Editor
              stylesFromSource={initialPagedJSCSS}
              updatePreview={updatePreview}
              {...settings?.editor}
              currentUser={currentUser}
              manuscript={manuscript}
              setComments={setComments}
            />
            <SelectionBox
              advancedTools={settings?.advancedTools}
              icons={settings.ui.icons}
              selectionColor={settings?.editor?.selectionColor}
              updatePreview={updatePreview}
            />
          </EditorContainer>
        </StyledWindow>
        {showEditor && showPreview && <WindowDivision />}
        <StyledWindow $show={showPreview}>
          <WindowHeading>
            <span>PDF PREVIEW{bookTitle ? ` for: "${bookTitle}"` : ':'}</span>
            <WindowHeadingControls>
              <button
                label="Update preview"
                onClick={updatePreview}
                title="Update preview"
                type="button"
              >
                <settings.ui.icons.update />
              </button>
              <button
                label="Print"
                onClick={() => previewRef?.current?.contentWindow?.print()}
                type="button"
              >
                <settings.ui.icons.print />
              </button>
              <StyledCheckbox
                checked={livePreview}
                handleChange={() => setLivePreview(!livePreview)}
                id="livePreview"
                label="Live preview"
                style={{ margin: 0 }}
              />
            </WindowHeadingControls>
          </WindowHeading>
          <PreviewIframe
            onLoad={updatePreview}
            ref={previewRef}
            srcDoc={previewSource}
            title="PDF preview"
          />
        </StyledWindow>
      </WindowsContainer>
    </Root>
  )
}

export default AiPDFDesigner
