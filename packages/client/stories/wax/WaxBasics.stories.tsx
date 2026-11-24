import { useState, type ReactNode } from 'react'
import styled, { css } from 'styled-components'
import { grid, th } from '@coko/client'
import { BoldOutlined } from '@ant-design/icons'

import preview from '../../.storybook/preview'
import { WaxProvider, WaxSurface, useWax } from '../../app/ui/wax/editor'
import strong, {
  canToggleStrong,
  isStrongActive,
  toggleStrong,
} from '../../app/ui/wax/features/strong'
import emphasis from '../../app/ui/wax/features/emphasis'
import type { WaxFeature } from '../../app/ui/wax/features/types'
import { CommandButton } from '../../app/ui/wax/ui'

const plainFeatures = [strong, emphasis]

// #region styled
const barStyles = css`
  align-items: center;
  border-bottom: 1px solid ${th('colorBorder')};
  display: flex;
  flex-wrap: wrap;
  gap: ${grid(1)};
  padding-bottom: ${grid(1)};
`

const Buttons = styled.div`
  ${barStyles}
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${grid(2)};
  max-width: 720px;

  > div:first-child {
    margin-bottom: 20px;
  }
`

const Surface = styled(WaxSurface)`
  border: 1px solid ${th('colorBorder')};
  border-radius: ${th('borderRadius')};
  min-height: 160px;
  padding: ${grid(2)};
`

const InfoSection = styled.div`
  background-color: lightyellow;
  padding: 16px;
  border-radius: 3px;
  border: 2px solid black;
`

const InfoHeader = styled.div`
  border-bottom: 1px solid black;
  font-weight: bold;
  margin-bottom: 6px;
`

const Status = styled.div`
  color: ${th('colorTextPlaceholder')};
  font-size: ${th('fontSizeBaseSmall')};
`

const Output = styled.pre`
  background: ${th('colorBackgroundHue')};
  border-radius: ${th('borderRadius')};
  font-size: ${th('fontSizeBaseSmall')};
  margin: 0;
  padding: ${grid(2)};
  white-space: pre-wrap;
`
// #endregion styled

// #region helpers
const CharacterCount = (): ReactNode => {
  const characters = useWax(({ state }) => state?.doc.textContent.length ?? 0)

  return <Status>{characters} characters</Status>
}

const SelectionInfo = (): ReactNode => {
  const from = useWax(({ state }) => state?.selection.from ?? 0)
  const to = useWax(({ state }) => state?.selection.to ?? 0)

  return (
    <Status>
      Selection {from}–{to}
    </Status>
  )
}
// #endregion helpers

const features: WaxFeature[] = []

const PlainEditor = ({ value }: { value: string }): ReactNode => {
  const [saved, setSaved] = useState(value)

  return (
    <WaxProvider features={features} onChange={setSaved} value={value}>
      <Wrapper>
        <Surface />
        <InfoSection>
          <InfoHeader>For story display purposes only:</InfoHeader>
          <CharacterCount />
          <SelectionInfo />
          <Output>{saved}</Output>
        </InfoSection>
      </Wrapper>
    </WaxProvider>
  )
}

const meta = preview.meta({
  component: PlainEditor,
})

/**
 * In its simplest form, all you need is a `WaxSurface` wrapped in a
 * `WaxProvider`.
 */
export const Base = meta.story({
  args: {
    value: '<p>A plain editing surface. Type here.</p>',
  },
})

export const Empty = meta.story({
  args: {
    value: undefined,
  },
  render: ({ value }) => (
    <WaxProvider features={features} value={value}>
      <Surface />
    </WaxProvider>
  ),
})

/**
 * Features added to the plain editor. Bold has a button (UI composed in the
 * story) and Mod-B. Emphasis has no UI at all: it is only reachable with Mod-I.
 */
export const WithFeature = meta.story({
  args: {
    value:
      '<p>Select some text and make it <strong>bold</strong> or <em>italic</em>.</p>',
  },
  render: ({ value }) => (
    <WaxProvider features={plainFeatures} value={value}>
      <Buttons>
        <CommandButton
          command={toggleStrong}
          icon={<BoldOutlined />}
          isActive={isStrongActive}
          isEnabled={canToggleStrong}
          title="Bold"
        />
      </Buttons>
      <Surface />
    </WaxProvider>
  ),
})
