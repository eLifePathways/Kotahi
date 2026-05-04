/* eslint-disable react-hooks/exhaustive-deps, react-hooks/immutability, react-hooks/refs */

/* eslint-disable react/prop-types */
import { useEffect, useContext } from 'react'
import styled from 'styled-components'
import { debounce } from 'lodash'
import { rotate360 } from '@coko/client'
import PropTypes from 'prop-types'
import SendIcon from './SendButton'
import { CssAssistantContext } from './hooks/CssAssistantContext'
import { color } from '../../theme'
import { callOn } from '../../shared/generalUtils'
import { autoResize } from './utils'

const StyledForm = styled.form`
  --color: ${color.brand1.base};
  --color-border: #0004;
  --font-size: 14px;
  align-items: center;
  background-color: #fffe;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  display: flex;
  font-size: var(--font-size);
  gap: 8px;
  height: fit-content;
  justify-content: center;
  overflow: auto;
  padding: 0.4rem 0.8rem;
  position: relative;
  transition: all 0.5s;
  width: 500px;

  textarea {
    --height: ${p => p.height || `24px`};
    background: none;
    border: none;
    caret-color: var(--color);
    font-size: inherit;
    height: var(--height);
    max-height: 100px;
    outline: none;
    overflow-y: auto;
    resize: none;
    width: 100%;
  }
`

const StyledSpinner = styled.div`
  display: flex;
  height: fit-content;
  width: 24px;

  &::after {
    animation: ${rotate360} 1s linear infinite;
    border: 2px solid ${color.brand1.base};
    border-color: ${color.brand1.base} transparent;
    border-radius: 50%;
    /* stylelint-disable-next-line string-quotes */
    content: ' ';
    display: block;
    height: 18px;
    margin: 1px;
    width: 18px;
  }
`

const SendButton = styled.button`
  aspect-ratio: 1 /1;
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
  padding: 0;
  width: 24px;

  > svg {
    fill: ${color.brand1.base};
    transform: scale(1.35);
  }
`

const PromptsInput = ({ enabled, className, loading, onSend, ...rest }) => {
  // #region HOOKS ---------------------------------------------------------------------
  const {
    selectedCtx,
    history,
    userPrompt,
    setUserPrompt,
    promptRef,
    onHistory,
  } = useContext(CssAssistantContext)

  useEffect(() => {
    debouncedResize()
  }, [userPrompt])

  const handleChange = ({ target }) => {
    if (loading) return
    setUserPrompt(target.value)
    debouncedResize()
  }

  const handleKeydown = e => {
    callOn(e.key, {
      Enter: () => !e.shiftKey && onSend(e),
      ArrowDown: () => {
        const userHistory = selectedCtx.history.filter(v => v.role === 'user')
        if (userHistory.length < 1) return

        if (history.current.prompts.index > 0) {
          history.current.prompts.index -= 1
        } else {
          history.current.prompts.index = userHistory.length - 1
        }

        if (history.current.prompts.active) {
          setUserPrompt(userHistory[history.current.prompts.index].content)
        }

        history.current.prompts.active = true
      },
      ArrowUp: () => {},
      z: () => {
        if (e.ctrlKey) onHistory.apply('undo')
      },
      y: () => {
        if (e.ctrlKey) onHistory.apply('redo')
      },
      default: () => {
        if (history.current.prompts.active) {
          history.current.prompts.active = false
        }
      },
    })
  }

  // #endregion HANDLERS

  const debouncedResize = debounce(() => {
    autoResize(promptRef.current)
  }, 300)

  return (
    <StyledForm $enabled={enabled} className={className}>
      <textarea
        disabled={!enabled}
        onChange={handleChange}
        onKeyDown={handleKeydown}
        ref={promptRef}
        value={userPrompt}
        {...rest}
      />
      {loading ? (
        <StyledSpinner />
      ) : (
        <SendButton onClick={onSend}>
          <SendIcon size="18" />
        </SendButton>
      )}
    </StyledForm>
  )
}

PromptsInput.propTypes = {
  enabled: PropTypes.bool,
  className: PropTypes.string,
}

PromptsInput.defaultProps = {
  enabled: true,
  className: '',
}

export default PromptsInput
