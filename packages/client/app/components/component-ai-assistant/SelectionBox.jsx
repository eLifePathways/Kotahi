/* eslint-disable react-hooks/exhaustive-deps */

import { useContext, useEffect } from 'react'
import styled from 'styled-components'
import { CssAssistantContext } from './hooks/CssAssistantContext'
import {
  cssStringToObject,
  htmlTagNames,
  removeStyleAttribute,
  setInlineStyle,
} from './utils'
import { color } from '../../theme'

const backgrounds = {
  dark: '#0001',
  light: '#fff1',
  magenta: '#f0f1',
}

const borders = {
  dark: '#0008',
  light: '#fffa',
  magenta: '#f0fa',
}

const AbsoluteContainer = styled.span`
  background-color: ${p => backgrounds[p.selectionColor.bg] || '#0001'};
  border: 1px dashed ${p => borders[p.selectionColor.border] || 'currentColor'};
  display: flex;
  pointer-events: none;
  position: absolute;
  transition:
    top 0.3s,
    left 0.3s,
    width 0.3s,
    height 0.3s,
    opacity 0.3s;
  z-index: 999;
`

const RelativeContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 5px;
  height: 35px;
  justify-content: flex-start;
  margin-top: -35px;
  opacity: 0.8;
  position: relative;
  white-space: nowrap;
  width: 100%;
  z-index: 999;

  > button {
    background: ${color.brand1.shade25};
    border: 1px solid currentcolor;
    border-radius: 50%;
    box-shadow:
      0 0 5px #0002,
      inset 0 0 8px #fff4;
    color: #eee;
    cursor: pointer;
    outline: none;
    padding: 5px 5px 3px;
    pointer-events: all;

    svg {
      height: 15px;
      width: 15px;
    }
  }

  > small {
    /* background: #00495cb9; */
    background: ${color.brand1.shade25};
    border: 1px solid currentcolor;
    border-radius: 5px;
    color: #eee;
    line-height: 1;
    padding: 5px 8px;
  }
`

/* eslint-disable react/prop-types */
const SelectionBox = ({
  updatePreview,
  yOffset = 5,
  xOffset = 5,
  advancedTools,
  selectionColor,
  icons,
  ...rest
}) => {
  const {
    selectedNode,
    selectionBoxRef,
    selectedCtx,
    setCopiedStyles,
    copiedStyles,
    updateSelectionBoxPosition,
    onHistory,
  } = useContext(CssAssistantContext)

  useEffect(() => {
    updateSelectionBoxPosition(yOffset, xOffset)

    if (selectionBoxRef?.current) {
      selectionBoxRef.current.parentNode.addEventListener(
        'scroll',
        updateSelectionBoxPosition,
      )
    }

    if (selectionBoxRef?.current) {
      selectionBoxRef.current.parentNode.addEventListener(
        'resize',
        updateSelectionBoxPosition,
      )
    }

    return () => {
      if (selectionBoxRef?.current) {
        selectionBoxRef.current.parentNode.removeEventListener(
          'scroll',
          updateSelectionBoxPosition,
        )
      }

      if (selectionBoxRef?.current) {
        selectionBoxRef.current.parentNode.removeEventListener(
          'resize',
          updateSelectionBoxPosition,
        )
      }
    }
  }, [selectedNode])

  return (
    <AbsoluteContainer
      ref={selectionBoxRef}
      selectionColor={selectionColor}
      {...rest}
    >
      {advancedTools && (
        <RelativeContainer>
          <small>{htmlTagNames[selectedCtx.tagName] || 'element'}</small>
          {selectedCtx?.node?.hasAttribute('style') ? (
            <>
              <button
                className="element-options"
                label="remove individual styles"
                onClick={() => {
                  onHistory.addRegistry('undo')
                  removeStyleAttribute(selectedNode)
                  updatePreview()
                }}
                title="remove individual styles"
                type="button"
              >
                <icons.delete
                  className="element-options"
                  style={{ pointerEvents: 'none' }}
                />
              </button>
              <button
                className="element-options"
                label="copy element styles"
                onClick={() => {
                  const nodeStyles = selectedCtx.node.getAttribute('style')
                  setCopiedStyles(cssStringToObject(nodeStyles))
                }}
                title="copy element styles"
                type="button"
              >
                <icons.copy
                  className="element-options"
                  style={{ pointerEvents: 'none' }}
                />
              </button>
            </>
          ) : (
            <small>no individual styles</small>
          )}
          {copiedStyles && (
            <button
              className="element-options"
              label="paste copied styles"
              onClick={() => {
                onHistory.addRegistry('undo')
                setInlineStyle(selectedCtx.node, copiedStyles)
                updatePreview()
              }}
              title="paste copied styles"
              type="button"
            >
              <icons.paste
                className="element-options"
                style={{ pointerEvents: 'none' }}
              />
            </button>
          )}
        </RelativeContainer>
      )}
    </AbsoluteContainer>
  )
}

export default SelectionBox
