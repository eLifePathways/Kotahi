import styled from 'styled-components'
import { grid } from '@coko/client'
import {
  EditorForm,
  EditPageContainer,
  EditPageLeft,
  EditPageRight,
  FlexRow,
  RightArrow,
} from '../../component-cms-manager/src/style'
import { ActionButton, Page } from '../../shared'
import { color } from '../../../theme'

export const CleanButton = styled.button.attrs({ type: 'button' })`
  align-items: center;
  background: none;
  border: none;
  cursor: ${p => (p.$disabled ? 'not-allowed' : 'pointer')};
  display: ${p => (p.$hide ? 'none' : 'flex')};
  gap: ${grid(1)};
  justify-content: flex-start;
  opacity: ${p => (p.$disabled ? 0.5 : 1)};
  outline: none;
`

// #region EmailTemplates -----------------------------------------------------------------------

export const Root = styled(FlexRow)`
  flex-direction: column;
  gap: 0;
  height: inherit;
  overflow: hidden;
`

export const Content = styled(EditPageContainer)`
  height: inherit;
  overflow: hidden;
  user-select: none;
`
// #endregion EmailTemplates --------------------------------------------------------------------

// #region EmailTemplatesContent -----------------------------------------------------------------------
export const EditSection = styled(EditPageRight)`
  background-color: #fff;
  overflow: visible;
  padding: ${grid(3)} ${grid(6)};
`
// #endregion EmailTemplatesContent --------------------------------------------------------------------

// #region EmailTemplatesEditForm -----------------------------------------------------------------------
export const StyledPage = styled(Page)`
  height: inherit;
  padding: 0;
`

export const StyledEditorForm = styled(EditorForm)`
  height: inherit;
  padding: 0 ${grid(3)};
`

export const Footer = styled(FlexRow)`
  justify-content: flex-start;
  padding: ${grid(3)};
`

// #endregion EmailTemplatesEditForm --------------------------------------------------------------------

// #region EmailTemplatesHeader -----------------------------------------------------------------------
export const Action = styled(CleanButton)`
  align-items: center;
  color: ${p => (p.disabled ? color.gray80 : color.brand1.base)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  gap: ${grid(1)};
  min-width: 0;
  width: fit-content;

  span {
    align-items: center;
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
`

export const HeaderRoot = styled.header`
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #ddd;
  display: flex;
  gap: ${grid(1)};
  justify-content: space-between;
  margin: 0;
  padding: ${grid(0.5)} ${grid(1.5)};
`
export const CreateButton = styled(ActionButton)`
  align-items: center;
  display: flex;
  height: fit-content;
  justify-content: center;
  margin-right: ${grid(1)};
  text-align: center;
`

export const Heading = styled.h3`
  color: ${color.gray20};
  line-height: 1;
  margin: 0;
`

export const ActionContainer = styled(FlexRow)`
  gap: ${grid(1.5)};
`

export const DescriptionContainer = styled(FlexRow)`
  flex-direction: column;
  gap: 2px;
  padding: ${grid(1.5)} ${grid(3)};
`

export const EditedOnLabel = styled.small`
  color: ${color.gray20};
  line-height: 1.2;
  padding: ${grid(0.25)} 0 0;
`
// #endregion EmailTemplatesHeader --------------------------------------------------------------------

// #region EmailTemplatesNav -----------------------------------------------------------------------
export const NavRoot = styled(EditPageLeft)`
  display: flex;
  flex-direction: column;
  height: inherit;
  min-width: 380px;
  overflow: auto;
  padding: 0;
  position: relative;
  width: 380px;
`

export const ListHeader = styled(CleanButton)`
  background-color: #f4f5f7;
  border-bottom: 1px solid #ddd;
  border-left: 1px solid #ddd;
  color: #555;
  font-weight: bold;
  gap: ${grid(1)};
  justify-content: space-between;
  padding: ${grid(1)} ${grid(2)};
  text-transform: uppercase;
  z-index: 9;

  svg {
    margin: 0;
    stroke: #555;
  }
`

export const OptionsList = styled.ul`
  display: flex;
  flex-direction: column;
  height: fit-content;
  list-style: none;
  margin: 0;
  max-height: ${({ $collapsed }) => ($collapsed ? '0' : '700px')};
  overflow-y: auto;
  padding: 0;
  transition: max-height 0.3s;
  z-index: 9;
`

export const EmptyListFallback = styled.span`
  align-items: center;
  background-color: #f9f9f9;
  display: flex;
  height: 100%;
  justify-content: center;
  padding: 10px;
  width: 100%;
`

export const OptionListItem = styled.li`
  background-color: ${p => (!p.$selected ? '#f9f9f9' : 'white')};
  border-bottom: 1px solid #ddd;
  border-left: ${p => (p.$selected ? `none` : '1px solid #ddd')};
  display: flex;
  font-weight: ${p => (p.$selected ? 'bold' : 'normal')};
  justify-content: space-between;
  margin: 0;
  padding: ${grid(1)} ${grid(2.05)};
  width: 100%;

  svg {
    fill: ${p => (p.$selected ? color.brand1.base : 'transparent')};
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    svg {
      opacity: 1;
    }
  }
`

export const OptionListItemButton = styled(CleanButton)`
  color: ${p => (p.$warning ? color.warning.base : '#555')};
  gap: ${grid(1.5)};
  width: 100%;

  p {
    border-left: 1px solid #ddd;
    color: #555;
    margin: 0;
    max-width: 240px;
    overflow: hidden;
    padding-left: ${grid(2)};
    text-decoration: ${p => (p.$warning ? 'line-through' : 'none')};
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

export const CollapseIcon = styled(RightArrow)`
  color: #fff;
  transform: ${p =>
    p.$collapsed ? 'rotate(90deg) scaleX(1)' : 'rotate(90deg) scaleX(-1)'};
  transition: transform 0.3s;
`

export const EmptyContainer = styled(FlexRow)`
  border-left: 1px solid #ddd;
  height: 100%;
  position: absolute;
  width: 100%;
  z-index: 1;
`
// #endregion EmailTemplatesNav --------------------------------------------------------------------
