/* stylelint-disable string-quotes */
import styled, { css } from 'styled-components'
import { th, grid } from '@coko/client'
import { ChevronRight } from 'react-feather'
import { TextInput, Heading, ActionButton } from '../../shared'

import { SecondaryButton } from '../../component-modal/src/Modal'

export const Section = styled.div`
  margin: 8px 8px 0 0;
  ${props =>
    props.flexGrow &&
    css`
      flex-grow: 1;
      & > div {
        height: 100%;
      }
    `}
`

export const CompactSection = styled(Section)`
  width: 24%;
`

export const Page = styled.div`
  height: 100%;
  position: relative;
  z-index: 0;
`

export const VerticalBar = styled.div`
  border-right: 1px solid #111;
  height: 16px;
  margin: 0 10px;
`

export const NewEditText = styled.p`
  color: ${props => props.theme.color.additional.green};
`

export const Heading2 = styled(Heading)`
  cursor: pointer;
  font-size: ${th('fontSizeBaseSmall')};
  font-weight: 600;
  line-height: ${th('lineHeightBaseSmall')};
  padding-bottom: 12px;
  padding-top: 12px;
`

export const SidebarPageRow = styled.div`
  align-items: start;
  border-bottom: 1px solid #dedede;
  display: flex;
  justify-content: space-between;
  margin-left: 16px;
  margin-right: 16px;
`

export const FormTextInput = styled(TextInput)`
  background: white;
  padding: 10px;
`

export const ColorInput = styled(TextInput)`
  background: white;
  padding: 0;
`

export const EditPageContainer = styled.div`
  display: flex;
  overflow: auto;
  width: 100%;
`

export const EditPageLeft = styled.div`
  min-width: 250px;
  overflow-y: scroll;
  padding-bottom: 16px;
  padding-top: 16px;
  width: 250px;
`

export const EditPageRight = styled.div`
  background-color: #f4f5f7;
  flex-grow: 1;
  overflow-y: scroll;
  padding-bottom: 16px;

  padding-left: 16px;
  padding-top: 16px;
`

export const EditorForm = styled.form`
  display: flex;
  flex-direction: column;
  height: 100%;
`

export const ActionButtonContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-top: 48px;
`

export const FormActionButton = styled(ActionButton)`
  cursor: pointer;
  margin-right: 32px;
  min-width: 104px;
`

export const FormActionDelete = styled(SecondaryButton)`
  min-width: 0;
`

export const FullWidthAndHeightContainer = styled.div`
  height: 100%;
  width: 100%;

  @media screen and (min-width: 1440px) {
    .full-wax-editor-grid {
      min-height: 250px; /* Double the height when screen width is above 1440 pixels */
    }
  }
`

export const LayoutPageFooterContainer = styled.div`
  height: 100%;
  width: 100%;

  & #wax-container {
    height: 300px;
  }
`

export const CmsWidthAndHeightContainer = styled.div`
  height: 96%;
  position: relative;
  width: 100%;

  @media screen and (min-width: 1440px) {
    .full-wax-editor-grid {
      height: 100%;
      min-height: 250px; /* Double the height when screen width is above 1440 pixels */
      position: absolute;
      width: 100%;
    }
  }
`

export const SimpleWaxEditorContainer = styled.div`
  height: 100%;

  & * {
    margin: 0;
  }

  .wax-surface-scroll {
    min-height: 250px;

    @media screen and (min-width: 1440px) {
      min-height: 250px; /* Double the height when screen width is above 1440 pixels */
    }
  }
`

export const ControlsContainer = styled.div`
  display: flex;
  flex: 1 1;
  gap: ${grid(2)};
  justify-content: flex-end;
`

export const FlexRow = styled.div`
  display: flex;
  gap: ${grid(1)};
  justify-content: space-between;
`

export const StatusInfoText = styled.div`
  display: flex;
  font-size: ${th('fontSizeBaseSmall')};
  font-weight: 400;
  margin-right: 16px;
`

export const FlexCenter = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`

export const ErrorMessage = styled.div`
  color: ${th('colorError')};
  font-size: ${th('fontSizeBaseSmall')};
  font-weight: normal;
  line-height: ${th('lineHeightBaseSmall')};
`

export const InfoBlock = styled.div`
  background-color: ${th('colorSecondaryBackground')};
  border: 1px solid ${th('colorBorder')};
  border-radius: ${grid(1)};
  padding: ${grid(2)};
  width: 100%;
`

export const WarningBlock = styled(InfoBlock)`
  background-color: ${th('colorWarning')};
  border: 1px solid ${th('colorWarningDark')};
`

export const LayoutHeaderListContainer = styled.div`
  padding: grid;
  width: 30%;
`

export const LayoutHeaderListItem = styled.div`
  align-items: center;
  border: 1px solid #dedede;
  border-radius: ${grid(1)};
  display: flex;
  justify-content: space-between;
  margin-bottom: ${grid(2)};
  padding: ${grid(1 / 2)};
  user-select: 'none';
`

export const LayoutMainHeading = styled(Heading)`
  color: ${th('colorTextPlaceholder')};
  font-size: ${grid(3)};
  margin-bottom: ${grid(2)};
`

export const LayoutSecondaryHeading = styled(Heading)`
  color: ${th('colorTextPlaceholder')};
  font-size: ${grid(1.5)};
  margin-bottom: ${grid(1)};
`
export const RightArrow = styled(ChevronRight)`
  height: ${grid(2)};
  margin-bottom: 12px;
  margin-top: 12px;
  stroke: ${th('colorPrimary')};
  stroke-width: 4px;
  width: ${grid(2)};
`
