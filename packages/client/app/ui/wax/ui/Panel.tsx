import type { ReactNode } from 'react'
import styled, { css, type RuleSet } from 'styled-components'
import { grid, th } from '@coko/client'

export const PanelList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${grid(1)};
`

export const PanelHeading = styled.h3`
  font-size: ${th('fontSizeBase')};
  margin: 0;
`

export const PanelEmpty = styled.p`
  color: ${th('colorTextMuted')};
  font-size: ${th('fontSizeBaseSmall')};
  margin: 0;
`

export const PanelMeta = styled.div`
  color: ${th('colorTextMuted')};
  font-size: ${th('fontSizeBaseSmall')};
`

const Item = styled.article<{ $active: boolean }>`
  border: 1px solid ${th('colorBorder')};
  border-radius: ${th('borderRadius')};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${grid(1)};
  padding: ${grid(1.5)};

  ${(props): RuleSet | false =>
    props.$active &&
    css`
      border-color: ${th('colorPrimary')};
      box-shadow: 0 0 0 1px ${th('colorPrimary')};
    `}
`

type PanelItemProps = {
  active?: boolean
  children: ReactNode
  label: string
  onSelect?: () => void
}

export const PanelItem = ({
  active = false,
  children,
  label,
  onSelect,
}: PanelItemProps): ReactNode => (
  <Item
    $active={active}
    aria-current={active || undefined}
    aria-label={label}
    onClick={onSelect}
    onKeyDown={(event): void => {
      if (event.target === event.currentTarget && event.key === 'Enter')
        onSelect?.()
    }}
    tabIndex={0}
  >
    {children}
  </Item>
)
