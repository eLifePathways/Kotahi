/* eslint-disable react/prop-types */

import styled from 'styled-components'

import ModalRoot from './ModalRoot'
import ModalHeader from './ModalHeader'
import ModalFooterDialog from './ModalFooterDialog'

// Centers info message horizontally and vertically.
const Centered = styled.div`
  align-items: ${({ notCentered }) => (notCentered ? 'flex-start' : 'center')};
  display: flex;
  height: 100%;
  justify-content: ${({ notCentered }) =>
    notCentered ? 'flex-start' : 'center'};
  text-align: center;
`

const DialogModal = props => {
  const {
    children,
    headerText,
    notCentered,
    disableConfirm,
    buttonLabel,
    textCancel,
    ...rest
  } = props

  const Header = <ModalHeader text={headerText} />

  const Footer = (
    <ModalFooterDialog
      buttonLabel={buttonLabel}
      disableConfirm={disableConfirm}
      textCancel={textCancel}
    />
  )

  return (
    <ModalRoot
      footerComponent={Footer}
      headerComponent={Header}
      shouldCloseOnOverlayClick={false}
      size="small"
      {...rest}
    >
      <Centered notCentered={notCentered}>{children}</Centered>
    </ModalRoot>
  )
}

export default DialogModal
