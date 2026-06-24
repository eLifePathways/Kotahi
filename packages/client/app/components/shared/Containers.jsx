import styled from 'styled-components'
import { grid } from '@coko/client'

export const LooseRowAlignTop = styled.div`
  display: flex;
  gap: ${grid(3)};
  width: 100%;
`

export const LooseRow = styled(LooseRowAlignTop)`
  align-items: center;
`

export const LooseRowRight = styled(LooseRow)`
  justify-content: flex-end;
`

export const LooseRowSpaced = styled(LooseRow)`
  justify-content: space-between;
`

export const LooseRowCentered = styled(LooseRow)`
  justify-content: center;
`

export const LooseRowSpacedAlignTop = styled(LooseRowAlignTop)`
  justify-content: space-between;
`

export const MediumRow = styled(LooseRow)`
  gap: ${grid(1)};
`

export const MediumRowSpaced = styled(MediumRow)`
  justify-content: space-between;
`

export const TightRow = styled(LooseRow)`
  gap: ${grid(0.5)};
`

export const SolidColumn = styled.div`
  display: flex;
  flex-direction: column;
`

export const TightColumn = styled(SolidColumn)`
  gap: ${grid(0.5)};
`

export const MediumColumn = styled(SolidColumn)`
  gap: ${grid(1)};
`

export const LooseColumn = styled(SolidColumn)`
  gap: ${grid(2)};
`

export const WidthLimiter = styled.div`
  max-width: 1200px;
`
