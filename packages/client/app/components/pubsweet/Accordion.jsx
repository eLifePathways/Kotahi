/* eslint-disable react/prop-types */

import PropTypes from 'prop-types'
import styled from 'styled-components'
import { th, override } from '@coko/client'
import { withState, withHandlers, compose } from 'recompose'

import Icon from './Icon'

// #region styles
const Root = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all ${th('transitionDuration')};

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${override('ui.Accordion')};
`

const Header = styled.div.attrs(props => ({
  'data-test-id': props['data-test-id'] || 'accordion-header',
}))`
  align-items: center;
  cursor: pointer;
  display: flex;
  justify-content: flex-start;

  ${override('ui.Accordion.Header')};
`

const HeaderLabel = styled.span`
  color: ${th('colorPrimary')};
  font-family: ${th('fontHeading')};
  font-size: ${th('fontSizeBase')};

  ${override('ui.Accordion.Header.Label')};
`

const HeaderIcon = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;

  transform: ${({ expanded }) => `rotateZ(${expanded ? 0 : 180}deg)`};
  transition: transform ${th('transitionDuration')};

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${override('ui.Accordion.Header.Icon')};
`
// #endregion

const HeaderComponent = ({ icon, expanded, label, toggle, ...props }) => (
  <Header expanded={expanded} onClick={toggle} {...props}>
    <HeaderIcon expanded={expanded}>
      <Icon primary size={3}>
        {icon}
      </Icon>
    </HeaderIcon>
    <HeaderLabel>{label}</HeaderLabel>
  </Header>
)

const Accordion = ({
  toggle,
  expanded,
  children,
  icon = 'chevron_up',
  header: Header = HeaderComponent, // eslint-disable-line no-shadow
  ...props
}) => (
  <Root>
    <Header expanded={expanded} icon={icon} toggle={toggle} {...props} />
    {expanded && children}
  </Root>
)

Accordion.propTypes = {
  /** Header icon, from the [Feather](https://feathericons.com/) icon set. */
  icon: PropTypes.string,
  /** Initial state of the accordion. */
  startExpanded: PropTypes.bool,
  /** Function called when toggling the accordion. The new state is passed as a paremeter. */
  onToggle: PropTypes.func,
}

Accordion.defaultProps = {
  onToggle: null,
  startExpanded: false,
}

export default compose(
  withState('expanded', 'setExpanded', ({ startExpanded }) => startExpanded),
  withHandlers({
    toggle:
      ({ expanded, setExpanded, onToggle }) =>
      () => {
        setExpanded(!expanded)

        if (typeof onToggle === 'function') {
          onToggle(!expanded)
        }
      },
  }),
)(Accordion)
