import styled, { css } from 'styled-components'
import { th, grid } from '@coko/client'
import { Button } from '../../../pubsweet'
import { color } from '../../../../theme'

export const Section = styled.div`
  margin: ${grid(4)} 0;

  &:first-child {
    margin-top: 0;
  }
`

export const Subsection = styled.div`
  margin: 0 50% ${grid(4)} ${grid(4)};
`

export const Legend = styled.div`
  font-size: ${th('fontSizeBase')};
  font-weight: 600;
`

const ErrorMessageWrapper = styled.div`
  color: ${color.error.base};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`

const Page = styled.div`
  position: relative;
  z-index: 0;
`

const Heading = styled.div`
  color: ${color.brand1.base};
  font-family: ${th('fontReading')};
  font-size: ${th('fontSizeHeading3')};
  margin: ${th('gridUnit')} 0;
  text-transform: uppercase;
`

const UploadContainer = styled.div`
  display: flex;
  justify-content: center;
`

const DetailText = styled.div`
  color: ${color.gray40};
  font-family: ${th('fontReading')};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`

const CommentMetaWrapper = styled.div`
  align-items: center;
  display: flex;

  @media (max-width: 768px) {
    align-items: flex-start;
    flex-direction: column;
  }
`

const UserMetaWrapper = styled.div`
  align-items: center;
  display: flex;
  gap: ${grid(1)};
`

const UserName = styled.span`
  margin-bottom: 0;
`

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  width: 280px;
`

const ModalContainer = styled.div`
  background: ${color.backgroundA};
  max-height: calc(100vh - 60px);
  overflow-y: auto;
  padding: 20px 24px;
  width: 45em;
  z-index: 9999;

  p {
    font-family: ${th('fontWriting')};
    font-size: ${th('fontSizeBase')};
  }
`

const SimpleWaxEditorWrapper = styled.div`
  margin-top: 10px;
  ${props =>
    props.collapse
      ? css`
          max-height: 100px;
          overflow: hidden;
        `
      : css`
          height: 100%;
          overflow: none;
        `};

  .wax-surface-scroll {
    overflow: hidden;
  }

  p {
    font-family: ${th('fontWriting')};
    font-size: ${th('fontSizeBase')};
    margin: 0;
  }
  padding-bottom: 20px;
  position: relative;
`

const CollapseOverlay = styled.div`
  bottom: 0;
  height: 50px;
  ${props =>
    props.collapse
      ? css`
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0) -100%,
            #ffffff 100.32%
          );
        `
      : css`
          background: transparent;
        `};
  pointer-events: none;
  position: absolute;
  width: 100%;
`

const CommentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  ${props =>
    props.commentBelongsToDifferentManuscriptVersion
      ? css`
          color: ${color.gray60};
        `
      : ``}

  svg {
    ${props =>
      props.commentBelongsToDifferentManuscriptVersion
        ? css`
            stroke: ${color.gray60} !important;
          `
        : ``}
  }
`

const Collapse = styled.div`
  display: flex;
`

const ActionWrapper = styled.div`
  align-items: center;
  display: flex;
  gap: ${grid(4)};
  justify-content: flex-end;

  svg {
    stroke: ${color.gray40};
  }
`

const CancelButton = styled(Button)`
  background-color: ${color.gray90};
  padding: 8px;
  text-decoration: none;

  &:hover {
    background-color: ${color.gray80};
  }
`

const CommentContainer = styled.div`
  border-bottom: 1px ${th('borderStyle')} ${color.gray80};
  padding-bottom: 25px;

  p {
    ${props =>
      props.commentBelongsToDifferentManuscriptVersion
        ? css`
            color: ${color.gray60};
            background-color: ${color.backgroundA};
          `
        : ``}
  }
`

export {
  Page,
  Heading,
  UploadContainer,
  DetailText,
  CommentMetaWrapper,
  UserMetaWrapper,
  UserName,
  ButtonWrapper,
  ModalContainer,
  SimpleWaxEditorWrapper,
  CollapseOverlay,
  CommentWrapper,
  ActionWrapper,
  Collapse,
  CancelButton,
  CommentContainer,
  ErrorMessageWrapper,
}
