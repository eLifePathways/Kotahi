import { type ComponentType } from 'react'
import styled from 'styled-components'
import { th } from '@coko/client'

import preview from '../../.storybook/preview'
import * as Icons from '../../app/ui/base/Icons'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));
  gap: 12px;
`

const IconTile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid ${th('colorBorder')};
  border-radius: ${th('borderRadius')};

  svg {
    font-size: 2rem;
  }
`

const SmallerIconTile = styled(IconTile)`
  svg {
    font-size: 1rem;
  }
`

const ReverseIconTile = styled(IconTile)`
  background-color: ${th('colorPrimary')};
  color: ${th('colorTextReverse')};
`

const IconName = styled.span`
  font-size: 12px;
  text-align: center;
  word-break: break-all;
`

const meta = preview.meta({})

/**
 * A combination of ant-design and custom icons. Make sure both types display
 * consistently.
 */
export const AllIcons = meta.story({
  render: () => (
    <Grid>
      {Object.entries(Icons).map(([name, IconComponent]) => {
        const Component = IconComponent as ComponentType

        return (
          <IconTile key={name}>
            <Component />
            <IconName>{name}</IconName>
          </IconTile>
        )
      })}
    </Grid>
  ),
})

/** Adjust size via font-size. */
export const Smaller = meta.story({
  render: () => (
    <Grid>
      {Object.entries(Icons).map(([name, IconComponent]) => {
        const Component = IconComponent as ComponentType

        return (
          <SmallerIconTile key={name}>
            <Component />
            <IconName>{name}</IconName>
          </SmallerIconTile>
        )
      })}
    </Grid>
  ),
})

/** Color should be defined by the current font color. */
export const Reverse = meta.story({
  render: () => (
    <Grid>
      {Object.entries(Icons).map(([name, IconComponent]) => {
        const Component = IconComponent as ComponentType

        return (
          <ReverseIconTile key={name}>
            <Component />
            <IconName>{name}</IconName>
          </ReverseIconTile>
        )
      })}
    </Grid>
  ),
})
