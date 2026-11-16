/* stylelint-disable declaration-block-no-redundant-longhand-properties, string-quotes */

const NAVBAR_WIDTH = 72
const MIN_PRIMARY_COLUMN_WIDTH = 600
const MIN_SECONDARY_COLUMN_WIDTH = 320
const COL_GAP = 24
// add 144 (72 * 2) to account for the left side nav
export const MEDIA_BREAK =
  MIN_PRIMARY_COLUMN_WIDTH +
  MIN_SECONDARY_COLUMN_WIDTH +
  COL_GAP +
  NAVBAR_WIDTH * 2
