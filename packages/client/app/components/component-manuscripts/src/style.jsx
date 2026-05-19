import styled from 'styled-components'
import { grid } from '@coko/client'
import { Button } from '../../pubsweet'
import { Action } from '../../shared'
import theme, { color } from '../../../theme'

export const SelectAllField = styled.div`
  align-items: center;
  display: flex;
  font-size: ${theme.fontSizeBaseSmall};
  line-height: ${theme.lineHeightBaseSmall};
`
export const SelectedManuscriptsNumber = styled.p`
  color: ${props => (props.disabled ? color.gray60 : color.text)};
  font-weight: bold;
  margin-left: 10px;
  margin-right: 15px;
`
export const ControlsContainer = styled.div`
  display: flex;
  flex: 1 1;
  gap: ${grid(2)};
  justify-content: flex-end;
`

export const BulkActionModalContainer = styled.div`
  background-color: white;
  padding: 10px;
`

export const BulkActionModalButtons = styled.div`
  display: flex;
  justify-content: space-between;
`

export const BulkActionModalButton = styled(Button)`
  cursor: pointer;
`

export const ViewArchivedAction = styled(Action)`
  font-size: ${theme.fontSizeBaseSmall};
`
