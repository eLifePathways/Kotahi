import styled from 'styled-components'
import { th, grid } from '@coko/client'
import { Button } from '../../pubsweet'
import { Action } from '../../shared'

export const SelectAllField = styled.div`
  align-items: center;
  display: flex;
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`
export const SelectedManuscriptsNumber = styled.p.attrs({
  'data-testid': 'selected-manuscripts-number',
})`
  color: ${props =>
    props.disabled ? props.theme.color.gray60 : props.theme.color.text};
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
  font-size: ${th('fontSizeBaseSmall')};
`
