import styled from 'styled-components'
import { grid, th } from '@coko/client'

import preview from '../../.storybook/preview'
import Grid from '../../app/ui/shared/Grid'

const Placeholder = styled.div`
  height: 100%;
  padding: ${grid(4)};
  border: 1px dashed ${th('colorBorder')};
  border-radius: ${th('borderRadius')};
`

const showHidden = false

const meta = preview.meta({
  component: Grid,
})

/** Fits as many columns as `minColumnWidth` allows, and makes the items in each row equal height. Sizes are in theme grid units. */
export const Base = meta.story({
  render: () => (
    <Grid gap={4} minColumnWidth={60}>
      <Placeholder>One</Placeholder>
      <Placeholder>Two</Placeholder>
      <Placeholder>
        Three, with more content than the others. Lorem ipsum dolor sit amet,
        consectetur adipiscing elit. Maecenas a consectetur felis. Vestibulum
        hendrerit eleifend nulla, ac facilisis urna faucibus ac.
      </Placeholder>
      <Placeholder>Four</Placeholder>
    </Grid>
  ),
})

/** `gap` sets the space between both columns and rows. */
export const LargeGap = meta.story({
  render: () => (
    <Grid gap={12} minColumnWidth={60}>
      <Placeholder>One</Placeholder>
      <Placeholder>Two</Placeholder>
      <Placeholder>Three</Placeholder>
      <Placeholder>Four</Placeholder>
      <Placeholder>Five</Placeholder>
    </Grid>
  ),
})

/** A smaller `minColumnWidth` fits more columns in the same width. */
export const NarrowColumns = meta.story({
  render: () => (
    <Grid gap={4} minColumnWidth={30}>
      <Placeholder>One</Placeholder>
      <Placeholder>Two</Placeholder>
      <Placeholder>Three</Placeholder>
      <Placeholder>Four</Placeholder>
      <Placeholder>Five</Placeholder>
      <Placeholder>Six</Placeholder>
      <Placeholder>Seven</Placeholder>
    </Grid>
  ),
})

/** A larger `minColumnWidth` fits fewer columns, and the items wrap onto more rows. */
export const WideColumns = meta.story({
  render: () => (
    <Grid gap={4} minColumnWidth={120}>
      <Placeholder>One</Placeholder>
      <Placeholder>Two</Placeholder>
      <Placeholder>Three</Placeholder>
      <Placeholder>Four</Placeholder>
    </Grid>
  ),
})

/** `minRowHeight` sets a minimum height for every row, even when the content is shorter. */
export const MinRowHeight = meta.story({
  render: () => (
    <Grid gap={4} minColumnWidth={60} minRowHeight={40}>
      <Placeholder>One</Placeholder>
      <Placeholder>Two</Placeholder>
      <Placeholder>Three</Placeholder>
    </Grid>
  ),
})

/** Empty children such as `false` from a conditional are skipped, so they don't leave an empty cell. */
export const ConditionalChildren = meta.story({
  render: () => (
    <Grid gap={4} minColumnWidth={60}>
      <Placeholder>Shown</Placeholder>
      {showHidden && <Placeholder>Hidden</Placeholder>}
      <Placeholder>Also shown</Placeholder>
    </Grid>
  ),
})
