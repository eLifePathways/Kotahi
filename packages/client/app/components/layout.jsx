/* stylelint-disable declaration-block-no-redundant-longhand-properties, string-quotes */

import styled from 'styled-components'
import { th } from '@coko/client'

export const NAVBAR_WIDTH = 72
export const NAVBAR_EXPANDED_WIDTH = 256
export const MIN_PRIMARY_COLUMN_WIDTH = 600
export const MIN_SECONDARY_COLUMN_WIDTH = 320
export const MAX_PRIMARY_COLUMN_WIDTH = 968
export const MAX_SECONDARY_COLUMN_WIDTH = 400
export const COL_GAP = 24
export const TITLEBAR_HEIGHT = 62
export const MIN_MAX_WIDTH =
  MIN_PRIMARY_COLUMN_WIDTH + MIN_SECONDARY_COLUMN_WIDTH + COL_GAP
export const MAX_WIDTH =
  MAX_PRIMARY_COLUMN_WIDTH + MAX_SECONDARY_COLUMN_WIDTH + COL_GAP
export const MIN_WIDTH_TO_EXPAND_NAVIGATION = MAX_WIDTH + 256
export const SINGLE_COLUMN_WIDTH = MAX_WIDTH
// add 144 (72 * 2) to account for the left side nav
export const MEDIA_BREAK =
  MIN_PRIMARY_COLUMN_WIDTH +
  MIN_SECONDARY_COLUMN_WIDTH +
  COL_GAP +
  NAVBAR_WIDTH * 2

/*
  do not remove this className.
  see `src/routes.js` for an explanation of what's going on here
*/
export const ViewGrid = styled.main.attrs({
  id: 'main',
  className: 'view-grid',
})`
  display: grid;
  grid-area: main;
  height: 100%;
  max-height: 100vh;
  overflow: hidden;
  overflow-y: auto;

  @media (max-width: ${MEDIA_BREAK}px) {
    max-height: calc(100vh - ${TITLEBAR_HEIGHT}px);
  }
`

/*
┌──┬────────┬──┐
│  │   xx   │  │
│  │        │  │
│  │   xx   │  │
│  │        │  │
│  │   xx   │  │
└──┴────────┴──┘
*/
export const SingleColumnGrid = styled.div`
  background: ${th('colorBackground')};
  display: grid;
  grid-template-areas: 'primary';
  grid-template-columns: ${MIN_MAX_WIDTH}px;
  justify-self: center;
  overflow-y: auto;

  @media (max-width: ${MEDIA_BREAK}px) {
    border-left: 0;
    border-right: 0;
    grid-template-columns: 1fr;
    max-width: 100%;
    width: 100%;
  }
`

/*
┌──┬────┬─┬─┬──┐
│  │ xx │ │x│  │
│  │    │ │ │  │
│  │ xx │ │x│  │
│  │    │ │ │  │
│  │ xx │ │x│  │
└──┴────┴─┴─┴──┘
*/
export const PrimarySecondaryColumnGrid = styled.div`
  display: grid;
  grid-gap: ${COL_GAP}px;
  grid-template-areas: 'primary secondary';
  grid-template-columns:
    minmax(${MIN_PRIMARY_COLUMN_WIDTH}px, ${MAX_PRIMARY_COLUMN_WIDTH}px)
    minmax(${MIN_SECONDARY_COLUMN_WIDTH}px, ${MAX_SECONDARY_COLUMN_WIDTH}px);
  grid-template-rows: 100%;
  justify-self: center;
  max-width: ${MAX_WIDTH}px;

  @media (max-width: ${MEDIA_BREAK}px) {
    grid-gap: 0;
    grid-template-columns: 1fr;
    grid-template-rows: min-content 1fr;
    min-width: 100%;
  }
`

/*
┌──┬─┬─┬────┬──┐
│  │x│ │ xx │  │
│  │ │ │    │  │
│  │x│ │ xx │  │
│  │ │ │    │  │
│  │x│ │ xx │  │
└──┴─┴─┴────┴──┘
*/
export const SecondaryPrimaryColumnGrid = styled.div`
  display: grid;
  grid-gap: ${COL_GAP}px;
  grid-template-areas: 'secondary primary';
  grid-template-columns:
    minmax(${MIN_SECONDARY_COLUMN_WIDTH}px, ${MAX_SECONDARY_COLUMN_WIDTH}px)
    minmax(${MIN_PRIMARY_COLUMN_WIDTH}px, ${MAX_PRIMARY_COLUMN_WIDTH}px);
  grid-template-rows: 100%;
  justify-self: center;
  margin: 0 24px;
  max-width: ${MAX_WIDTH}px;

  @media (max-width: ${MEDIA_BREAK}px) {
    grid-gap: 0;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    max-width: 100%;
    min-width: 100%;
  }
`

/*
┌─────────────┐
│             │
│    ┌───┐    │
│    │ x │    │
│    └───┘    │
│             │
└─────────────┘
*/
export const CenteredGrid = styled.div`
  align-self: center;
  display: grid;
  /* grid-template-columns: ${MAX_WIDTH}px; */
  grid-template-columns: minmax(
    ${MIN_PRIMARY_COLUMN_WIDTH}px,
    ${MAX_PRIMARY_COLUMN_WIDTH}px
  );
  justify-self: center;
  max-width: ${MAX_PRIMARY_COLUMN_WIDTH}px;

  @media (max-width: ${MEDIA_BREAK}px) {
    align-self: flex-start;
    grid-template-columns: 1fr;
    height: calc(100vh - ${TITLEBAR_HEIGHT}px);
    max-width: 100%;
    width: 100%;
  }
`

export const PrimaryColumn = styled.section`
  border-bottom: 1px solid ${th('colorBorder')};
  border-left: 1px solid ${th('colorBorder')};
  border-radius: 0 0 4px 4px;
  border-right: 1px solid ${th('colorBorder')};
  display: grid;
  grid-area: primary;
  grid-template-rows: 1fr;
  height: 100%;
  max-width: ${props =>
    !props.fullWidth ? `${MAX_PRIMARY_COLUMN_WIDTH}px` : 'none'};

  @media (max-width: ${MEDIA_BREAK}px) {
    border-bottom: 0;
    border-left: 0;
    border-right: 0;
    grid-column-start: 1;
    height: calc(100vh - ${TITLEBAR_HEIGHT}px);
    max-width: 100%;
  }
`

export const SecondaryColumn = styled.section`
  grid-area: secondary;
  height: 100vh;
  overflow: hidden;
  overflow-y: auto;
  padding-bottom: 48px;
  position: sticky;
  top: 0;

  &::-webkit-scrollbar {
    background: transparent; /* make scrollbar transparent */
    height: 0;
    width: 0;
  }

  @media (max-width: ${MEDIA_BREAK}px) {
    display: none;
    height: calc(100vh - ${TITLEBAR_HEIGHT}px);
  }
`

export const ChatInputWrapper = styled.div`
  bottom: 0;
  left: 0;
  position: sticky;
  width: 100%;
  z-index: 3000;

  @media (max-width: ${MEDIA_BREAK}px) {
    bottom: 0;
    left: 0;
    position: fixed;
    width: 100vw;
  }
`
