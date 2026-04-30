/* eslint-disable no-return-assign */
/* eslint-disable react/prop-types */

import { useContext, useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { fadeIn } from '@coko/client'
import { Delete } from 'react-feather'
import { CssAssistantContext } from './hooks/CssAssistantContext'
import { htmlTagNames } from './utils'

const chatFadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-100%);
  }

  100% {
    opacity: 1;
    transform: translateX(0);
  }
`

const ChatHistoryContainer = styled.div`
  --profile-picture-size: 25px;
  --message-header-gap: 8px;

  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  height: 90%;
  overflow: auto;
  padding: 25px;
  position: relative;
  scroll-behavior: smooth;
  transition: width 0.5s;
  user-select: none;
  white-space: pre-line;

  ::-webkit-scrollbar {
    height: 5px;
    width: 5px;
  }

  ::-webkit-scrollbar-thumb {
    background: #0004;
    border-radius: 5px;
    width: 5px;
  }

  ::-webkit-scrollbar-track {
    background: #fff0;
    padding: 5px;
  }

  > * {
    animation: ${fadeIn} 1s;
    margin: 0 0 1em;
    padding: 2px 0;
  }
`

const MessageContainer = styled.div`
  animation: ${chatFadeIn} 0.5s;
  color: #555;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  opacity: ${p => (p.forgotten ? 0.5 : 1)};
  padding: 10px;
`

const MessageHeader = styled.div`
  align-items: center;
  display: flex;
  gap: var(--message-header-gap);
  justify-content: space-between;
  width: 100%;

  svg {
    animation: ${fadeIn} 0.5s;
  }

  > span {
    display: flex;
    gap: var(--message-header-gap);
  }

  span > img,
  span > span {
    align-items: center;
    border-radius: 50%;
    display: flex;
    height: var(--profile-picture-size);
    justify-content: center;
    object-fit: contain;
    width: var(--profile-picture-size);
  }

  span > span > strong {
    line-height: 1;
  }

  span > span {
    font-size: 12px;
  }
`

const MessageContent = styled.div`
  border-left: 1px solid #0002;
  display: flex;
  flex-direction: column;
  margin: 3px
    calc(var(--message-header-gap) + var(--profile-picture-size) + 1px);
  padding: 0 var(--message-header-gap);
`

// TODO: pass currentUser as prop

const ChatHistory = ({ settings, currentUser }) => {
  const { selectedCtx, htmlSrc, feedback, deleteLastMessage } =
    useContext(CssAssistantContext)

  const threadRef = useRef(null)

  useEffect(() => {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(
        mutation =>
          mutation.type === 'childList' &&
          threadRef?.current &&
          (threadRef.current.scrollTop = threadRef.current.scrollHeight),
      )
    })

    const chatContainer = threadRef.current

    if (chatContainer) {
      observer.observe(chatContainer, { childList: true })
    }

    return () => observer.disconnect()
  }, [feedback])

  return (
    <ChatHistoryContainer ref={threadRef}>
      {selectedCtx?.history?.length > 0 ? (
        selectedCtx.history.map(({ role, content }, i) => {
          const forgotten =
            i < selectedCtx.history.length - settings.historyMax - 1

          return (
            <span key={role + content + i}>
              <MessageContainer
                forgotten={forgotten}
                onLoad={e =>
                  e.target.scrollIntoView({ behavior: 'smooth', block: 'end' })
                }
                style={
                  i !== 0
                    ? { borderTop: '1px solid #0004', paddingTop: '18px' }
                    : {}
                }
              >
                <MessageHeader>
                  {role === 'user' ? (
                    <span>
                      <img
                        alt={`profile-${currentUser.username}`}
                        src={currentUser?.profilePicture}
                      />
                      <strong>{currentUser?.username}</strong>
                    </span>
                  ) : (
                    <span>
                      <span
                        style={{
                          color: '#fff',
                          background: '#008238',
                          textAlign: 'center',
                        }}
                      >
                        AI
                      </span>
                      <strong>Kotahi AI PDF designer:</strong>
                    </span>
                  )}
                  {i === selectedCtx.history.length - 1 && (
                    <Delete
                      onClick={deleteLastMessage}
                      title="Remove from history (not undoable)"
                    />
                  )}
                  {forgotten && <small>- forgotten -</small>}
                </MessageHeader>
                <MessageContent>{content}</MessageContent>
              </MessageContainer>
            </span>
          )
        })
      ) : (
        <span
          style={{
            color: '#777',
            background: '#fff',
            padding: '10px',
            borderRadius: '5px',
            textAlign: 'center',
          }}
        >
          {`Make your first prompt related to ${
            selectedCtx?.node === htmlSrc
              ? 'the article'
              : `this ${
                  selectedCtx?.tagName
                    ? htmlTagNames[selectedCtx?.tagName]
                    : 'selected'
                }`
          }`}
        </span>
      )}
    </ChatHistoryContainer>
  )
}

export default ChatHistory
