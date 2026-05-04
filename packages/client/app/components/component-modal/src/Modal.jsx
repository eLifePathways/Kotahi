/* eslint-disable react/prop-types */

import { useContext } from 'react'
import ReactModal from 'react-modal'
import styled, { ThemeContext } from 'styled-components'
import { th, grid } from '@coko/client'
import { Button } from '../../pubsweet'
import { color } from '../../../theme'

import {
  Icon,
  ActionButton,
  MediumColumn,
  LooseRowSpacedAlignTop,
} from '../../shared'

const MainHeader = styled(LooseRowSpacedAlignTop)`
  border-bottom: 1.5px solid ${color.gray80};
  line-height: 22px;
  padding: ${grid(2)} ${grid(3)};
  z-index: 10000;
`

const RowHeaderContainer = styled.div`
  align-items: center;
  display: flex;
  font-family: ${th('fontHeading')};
  gap: 16px;
`

const StackedHeaderContainer = styled.div`
  align-items: flex-start;
  column-gap: 180px;
  display: flex;
  flex-direction: column;
  font-family: ${th('fontHeading')};
  font-weight: 600;
`

export const Title = styled.div`
  font-size: ${th('fontSizeHeading5')};
  font-weight: 500;
`

export const Subtitle = styled.div`
  color: ${color.gray50};
  font-size: ${th('fontSizeHeading6')};
  font-weight: normal;
`

const CloseButton = styled(Button)`
  align-items: center;
  background-color: ${color.backgroundA};
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  height: 30px;
  justify-content: center;
  margin: -6px -12px 0 0;
  min-width: unset;
  width: 30px;

  &:hover {
    background-color: ${color.brand1.tint25};

    svg {
      stroke: white;
    }
  }
`

const ButtonPanel = styled.div`
  align-items: center;
  background-color: ${color.backgroundB};
  border-top: 1px solid ${color.gray80};
  display: flex;
  flex-direction: row;
  font-size: 15px;
  justify-content: space-between;
  padding: ${grid(1.5)} ${grid(3)};
  width: 100%;
`

const ButtonContainer = styled.div`
  display: flex;
  gap: ${grid(2)};
`

const PrimaryActionButton = styled(ActionButton)`
  background-color: ${color.brand1.base};
  border-radius: 6px;
  color: ${color.textReverse};
  cursor: pointer;
  margin: 0 5px;
`

const SecondaryActionButton = styled(ActionButton)`
  background-color: ${color.backgroundA};
  border: 1px solid ${color.black};
  border-radius: 6px;
  color: ${color.gray50};
  cursor: pointer;
`

const CheckBoxContainer = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  margin: 10px 5px;
`

const ModalContainer = styled.div`
  flex: 1 1 100%;
  overflow-y: auto;
  padding: ${grid(2.5)} ${grid(3)};
  position: relative;
  width: 100%;
`

export const PrimaryButton = ({ onClick, children }) => {
  return <PrimaryActionButton onClick={onClick}>{children}</PrimaryActionButton>
}

export const SecondaryButton = ({ onClick, children }) => {
  return (
    <SecondaryActionButton onClick={onClick}>{children}</SecondaryActionButton>
  )
}

export const CheckBoxButton = ({ onClick, isClicked, children }) => {
  return (
    <CheckBoxContainer onClick={onClick}>
      {(isClicked && <Icon>check-square</Icon>) || <Icon>square</Icon>}
      {children}
    </CheckBoxContainer>
  )
}

export const StackedHeader = ({
  title,
  subtitle, // optional
  textStyles,
}) => {
  return (
    <StackedHeaderContainer>
      <Title style={textStyles}>{title}</Title>
      {subtitle && <Subtitle style={textStyles}>{subtitle}</Subtitle>}
    </StackedHeaderContainer>
  )
}

export const RowHeader = ({
  title,
  subtitle, // optional
}) => {
  return (
    <RowHeaderContainer>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </RowHeaderContainer>
  )
}

const Modal = ({
  isOpen, // bool used to open and close modal
  onClose, // function to close your modal / set isOpen=false
  leftActions,
  rightActions,
  title, // main title in black
  subtitle, // optional subtitle in grey
  children,
  overlayStyles,
  contentStyles,
  ...props
}) => {
  const themeContext = useContext(ThemeContext)

  const styles = {
    overlay: {
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
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
      zIndex: 10000,
    },
  }

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: { ...styles.overlay, ...overlayStyles },
        content: { ...styles.content, ...contentStyles },
      }}
      {...props}
    >
      {title && (
        <MainHeader>
          <MediumColumn>
            <Title>{title}</Title>
            {subtitle && <Subtitle>{subtitle}</Subtitle>}
          </MediumColumn>
          <CloseButton alignSelf="flex-end" onClick={onClose}>
            <Icon>x</Icon>
          </CloseButton>
        </MainHeader>
      )}

      <ModalContainer>{children}</ModalContainer>

      {(leftActions || rightActions) && (
        <ButtonPanel>
          <ButtonContainer>{leftActions}</ButtonContainer>
          <ButtonContainer>{rightActions}</ButtonContainer>
        </ButtonPanel>
      )}
    </ReactModal>
  )
}

export default Modal
