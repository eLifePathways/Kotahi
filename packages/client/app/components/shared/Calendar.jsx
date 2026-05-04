/* stylelint-disable indentation, selector-descendant-combinator-no-non-space */
/* stylelint-disable selector-pseudo-class-parentheses-space-inside */

import styled, { css } from 'styled-components'
import UnstyledCalendar from 'react-calendar'
import { th, grid } from '@coko/client'
import { color } from '../../theme'

const Calendar = styled(UnstyledCalendar)`
  border: none;

  & .react-calendar__navigation {
    background-color: ${color.backgroundC};
    display: flex;
    font-size: ${th('fontSizeBaseSmall')};
    height: ${grid(4)};
    justify-content: center;
    line-height: ${th('lineHeightBaseSmall')};
    margin-bottom: 0;
  }

  & .react-calendar__navigation button:focus {
    background: none;
  }

  & .react-calendar__month-view__weekdays {
    font-size: ${th('fontSizeBaseSmall')};
    font-variant: all-small-caps;
    line-height: ${th('lineHeightBaseSmall')};
  }

  & .react-calendar__tile {
    border-radius: ${grid(2)};
    box-sizing: border-box;
  }

  & .react-calendar__tile:disabled {
    /* stylelint-disable-next-line declaration-no-important */
    border-radius: 0 !important;
  }

  & .react-calendar__tile:disabled.react-calendar__tile--range {
    background: ${color.gray90};
    border-bottom: 6px solid ${color.brand1.tint70};
    border-top: 6px solid ${color.brand1.tint70};
    padding-bottom: 4px;
    padding-top: 4px;
  }

  & .react-calendar__tile:disabled.react-calendar__tile--rangeStart {
    border-left: 6px solid ${color.brand1.tint70};
    padding-left: 1px;
  }

  & .react-calendar__tile:disabled.react-calendar__tile--rangeEnd {
    border-right: 6px solid ${color.brand1.tint70};
    padding-right: 1px;
  }

  & .react-calendar__tile--now {
    background: none;
    ${props =>
      props.suppressTodayHighlight
        ? ''
        : css`
            border: 1px solid ${color.brand1.tint25};
          `}
  }

  & .react-calendar__tile--now:hover {
    background: #e6e6e6;
  }

  & .react-calendar__tile--active {
    background: ${color.brand1.base};
    color: inherit;
  }

  & .react-calendar__tile--hasActive,
  & .react-calendar__tile--hasActive:focus {
    background: ${color.brand1.tint70};
  }

  & .react-calendar__tile--active:enabled:focus,
  & .react-calendar__tile--active:enabled:hover,
  & .react-calendar__tile--hasActive:hover {
    background: ${color.brand1.base};
  }

  & .react-calendar__tile--range,
  & .react-calendar__tile--hover {
    background: ${color.brand1.tint70};
    border-radius: 0;
  }

  & .react-calendar__tile--hover:hover {
    background: ${color.brand1.tint70};
  }

  &.react-calendar__tile--rangeStart:not(
      .react-calendar__tile--hover:not(.react-calendar__tile--hoverStart)
    ),
  & .react-calendar__tile--hoverStart {
    border-bottom-left-radius: ${grid(2)};
    border-top-left-radius: ${grid(2)};
  }

  &.react-calendar__tile--rangeEnd:not(
      .react-calendar__tile--hover:not(.react-calendar__tile--hoverEnd)
    ),
  & .react-calendar__tile--hoverEnd {
    border-bottom-right-radius: ${grid(2)};
    border-top-right-radius: ${grid(2)};
  }
`

export default Calendar
