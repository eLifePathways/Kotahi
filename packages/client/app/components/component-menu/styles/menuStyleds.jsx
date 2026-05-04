/* stylelint-disable declaration-no-important, string-quotes */
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { th, grid } from '@coko/client'
import { Icon } from '../../pubsweet'
import { color } from '../../../theme'
import { menuStyles } from './styleGlobals'
import PinButton from './PinButton'

// #region Menu

export const MainNavWrapper = styled.div`
  align-items: center;
  background: linear-gradient(
    134deg,
    ${color.brand1.base},
    ${color.brand1.tint25}
  );
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  overflow: hidden;
  padding: 3.2px 4.8px;
  transition: all var(--transition-time);
  width: 100%;
`

export const ScrollWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden auto;
  position: relative;
  scrollbar-color: ${color.brand1.tint50} #fff0;
  scrollbar-width: thin;
  transition: all var(transition-time);
  width: 100%;

  ::-webkit-scrollbar {
    height: 10px;
    width: 5px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${color.brand1.tint50};
    border-radius: 0.3rem;
  }

  ::-webkit-scrollbar-track {
    background: #0000;
  }
`

export const NavLinks = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  padding: 0;
  transition: padding var(--transition-time);
  width: 100%;
`
// #endregion Menu

// #region PinNav
export const SectionNavLayoutSettings = styled.div`
  background: ${color.brand1.shade10};
  border: none;
  border-bottom: 1px solid #fff2;
  height: ${p => (p.$pinned ? '0' : '22px')};
  margin-bottom: ${p => (p.$pinned ? '0' : '-14px')};
  position: relative;
  transition: margin ease 0.5s, height ease 0.5s, background-color ease 0.2s;
  width: 100%;

  &:hover {
    background-color: ${color.brand1.shade15};

    * {
      color: ${color.brand1.tint70};
    }
  }
`

export const StyledPinButton = styled(PinButton)`
  background: ${p => (p.$pinned ? '#fff4' : 'transparent')};
  border-radius: 4px;
  color: ${p => (p.$pinned ? color.brand1.tint90 : color.brand1.tint25)};
  max-width: ${p => (p.$menuIsMinimal ? '0' : '100%')};
  opacity: ${p => (p.$menuIsMinimal ? '0' : '1')};
  overflow: hidden;
  padding: 1px 2px 2px;
  position: absolute;
  right: 4px;
  top: 1px;
  transition: opacity ease 0.2s;

  svg {
    aspect-ratio: 1 / 1;
    fill: #fff0;
    height: 15px;
    vertical-align: middle;
    width: 15px;
  }
`
// #endregion PinNav

// #region Link
export const StyledLink = styled(Link)`
  background-color: ${p => (p.$active ? color.brand1.tint70 : 'unset')};
  border-radius: 10px;
  color: ${p => (p.$active ? color.text : color.textReverse)} !important;
  cursor: pointer;
  display: flex;
  font-size: ${th('fontSizeBase')} !important;
  height: ${grid(5)};
  justify-content: space-between;
  line-height: ${grid(3)};
  margin-bottom: 4.8px;
  padding: 0 ${grid(1)};
  position: relative;
  text-decoration: none !important;
  transition: max-width var(--transition-time),
    background-color var(--transition-link-colors),
    color var(--transition-link-colors);
  user-select: none;

  width: calc(100% - ${p => (p.depth || 0) * 1.6 * 10}px);

  & > span {
    align-items: center;
    display: flex;

    line-height: 1;
    overflow: ${p => (p.submenu ? 'hidden' : 'unset')};
    width: 100%;
  }

  svg {
    stroke: ${p => (p.$active ? color.text : color.textReverse)};
    transition: stroke var(--transition-link-colors);
    width: 1em;
  }

  &:hover {
    background-color: ${color.brand1.tint70};
    color: ${color.text} !important;
    stroke: ${color.text};

    svg {
      stroke: ${color.text};
    }
  }
`

export const NonLink = styled.div`
  & > span {
    justify-content: center;
    overflow: hidden;
  }
`

export const LinkLabel = styled.span`
  margin-left: 0;
  opacity: 0;
  overflow: hidden;
  padding-top: 2px;
  transition: margin var(--transition-time), opacity 0.2s;
  white-space: nowrap;
  width: 100%;
`

export const StyledIcon = styled(Icon)``

export const AlertIndicator = styled.div`
  background: ${color.error.base};
  border-radius: 50%;
  display: flex;
  height: 10px;
  margin: 0;
  position: absolute;
  right: 4.8px;
  transition: top var(--transition-time);
  width: 10px;
`
// #endregion Link

// #region SubMenu
export const SubMenuFirstLevelContainer = styled.span`
  display: flex;
  flex-direction: column;
  justify-items: ${p => (p.depth > 0 ? 'end' : '')};
  overflow: hidden;
  width: 100%;
`

export const SubMenuContainer = styled(NavLinks)`
  align-items: end;
  height: fit-content;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  padding: 0;
  position: relative;
  transition: all var(--transition-time);
  width: 100%;
`
// #endregion SubMenu

// #region UserNav
export const RolesLabel = styled.div`
  color: ${color.brand1.tint50};
  font-size: ${th('fontSizeBaseSmaller')};
  font-weight: normal;
  line-height: 1;
  white-space: nowrap;
`

export const UserItem = styled(Link)`
  align-items: end;
  border-bottom: 1px solid #fff2;
  color: ${color.textReverse};
  display: flex;
  gap: ${p => (p.$expanded ? '16px' : '0')};
  overflow: hidden;
  padding: ${p => (p.$expanded ? '11.2px 16px 16px 8px' : '8px 0 8px 2.4px')};
  text-decoration: none !important;
  transition: all var(--transition-time);
  width: 100%;

  &:hover {
    color: ${color.textReverse} !important;
  }
`

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  font-size: ${th('fontSizeBase')} !important;
  justify-content: center;
  opacity: ${p => (p.expanded ? '1' : '0')};
  overflow: hidden;
  transition: all var(--transition-time);
  width: ${p => (p.expanded ? '100%' : '0')};
`

export const UserName = styled.div`
  max-width: 30ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const UserMenuContainer = styled.div`
  display: flex;
  gap: 24px;
  justify-content: flex-start;
  margin-bottom: 4.8px;
  margin-top: -5px;
  overflow: visible;
  width: 100%;

  & img {
    outline: 4px solid ${color.brand1.base};
  }
`
// #endregion UserNav

// Here all related to expand/collapse
// Handling it based on aria-expanded instead of state to avoid re-renders
export const Root = styled.nav`
  --transition-time: ${menuStyles.transition.time} ease;
  --transition-link-colors: 0.3s ease;

  align-items: flex-start;
  background: ${color.brand1.base};
  display: flex;
  flex-direction: column;
  font-family: ${th('fontInterface')}, sans-serif !important;
  max-height: 100vh;
  max-width: 100%;
  min-width: 250px;
  transition: all var(--transition-time);
  width: fit-content;

  &[aria-expanded='false'] {
    max-width: 50px;
    min-width: 0;

    ${LinkLabel} {
      margin-left: 0;
      opacity: 0;
    }

    ${AlertIndicator} {
      top: 3.2px;
    }
  }

  &[aria-expanded='true'] {
    ${LinkLabel} {
      margin-left: 6px;
      opacity: 1;
    }

    ${NavLinks} {
      padding: 4.8px;
    }

    ${SubMenuFirstLevelContainer} {
      display: grid;
    }

    ${SubMenuContainer} {
      &[aria-expanded='true'] {
        max-height: 100%;
        opacity: 1;
        padding: 0;
      }

      &[aria-expanded='false'] {
        max-height: 0;
        padding: 0;
      }
    }

    ${AlertIndicator} {
      top: 4.8px;
    }
  }
`
