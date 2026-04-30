/* eslint-disable react/prop-types */

import { useState } from 'react'
import styled from 'styled-components'
import { th } from '@coko/client'
import { Button } from '../../../../pubsweet'
import { JournalContext } from '../../../../xpub-journal/src'

const Root = styled.div``

const AccordionBody = styled.div``

const Title = styled.span`
  font-family: ${th('fontHeading')};
  font-size: ${th('fontSizeHeading5')};
  line-height: ${th('lineHeightHeading5')};
`

const ToggleReview = ({ open, toggle }) => (
  <Button onClick={toggle} plain>
    {open ? 'Hide' : 'Show'}
  </Button>
)

const Bullet = ({ journal, recommendation }) => {
  const recommendationColor = () =>
    recommendation
      ? journal?.recommendations?.find(item => item.value === recommendation)
          ?.color
      : 'black'

  const Dot = styled.span`
    background-color: ${recommendationColor};
    border-radius: 100%;
    display: inline-block;
    height: 10px;
    margin-right: 10px;
    width: 10px;
  `

  return <Dot />
}

const AccordionHeading = ({
  journal,
  name,
  open,
  ordinal,
  recommendation,
  toggleOpen,
  component,
  withDots,
}) => {
  // eslint-disable-next-line no-shadow
  const Root = styled.div`
    align-items: baseline;
    display: flex;
    margin-bottom: calc(${th('gridUnit')} * 3);
  `

  const Ordinal = styled(Title)``
  const Controls = styled.span``

  const Head = styled.div`
    align-items: baseline;
    display: flex;
    flex: 1;
    justify-content: space-between;
    ${() => !withDots && 'border-bottom: 1px solid #000;'};
  `

  const Dots = styled.span`
    background-image: linear-gradient(to right, #666 50%, white 0%);
    background-position: 0 90%;
    background-repeat: repeat-x;
    background-size: 6px 1px;
    flex: 1;
    height: 1px;
    margin-left: 10px;
    position: relative;
  `

  return (
    <Root>
      {recommendation && (
        <Bullet journal={journal} recommendation={recommendation} />
      )}
      <Head>
        <Ordinal>
          {name} {ordinal}
        </Ordinal>
        {withDots && <Dots />}
        <Controls>
          <ToggleReview open={open} toggle={toggleOpen} />
        </Controls>
      </Head>
      {component}
    </Root>
  )
}

const Accordion = ({ ordinal, title, status, Component, withDots }) => {
  const [open, setOpen] = useState(false)
  const toggleOpen = () => setOpen(!open)

  return (
    <Root>
      <JournalContext.Consumer>
        {journal => (
          <AccordionHeading
            journal={journal}
            name={title}
            open={open}
            ordinal={ordinal}
            recommendation={status}
            toggleOpen={toggleOpen}
            withDots={withDots || false}
          />
        )}
      </JournalContext.Consumer>
      {open && <AccordionBody>{Component}</AccordionBody>}
    </Root>
  )
}

export default Accordion
