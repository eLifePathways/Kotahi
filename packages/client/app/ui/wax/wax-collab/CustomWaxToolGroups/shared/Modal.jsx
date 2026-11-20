/* eslint-disable react/prop-types */

import { useContext } from 'react'
import ReactModal from 'react-modal'
import styled, { ThemeContext } from 'styled-components'
import { grid } from '@coko/client'

const ModalContainer = styled.div`
  flex: 1 1 100%;
  overflow-y: auto;
  padding: ${grid(5)} ${grid(6)};
  position: relative;
  width: 100%;
`

const Modal = ({ isOpen, onClose, children, contentStyles, ...props }) => {
  const themeContext = useContext(ThemeContext)

  const style = {
    overlay: {
      backgroundColor: 'rgb(0 0 0 / 40%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    content: {
      alignItems: 'stretch',
      backgroundColor: themeContext.colorBackground,
      border: 'none',
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'column',
      inset: 'unset',
      margin: '0px',
      maxHeight: '90%',
      maxWidth: '60%',
      overflow: 'hidden',
      padding: '0px',
      zIndex: 1000,
      ...contentStyles,
    },
  }

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={style}
      {...props}
    >
      <ModalContainer>{children}</ModalContainer>
    </ReactModal>
  )
}

export default Modal
