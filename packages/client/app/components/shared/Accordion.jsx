/* eslint-disable react/prop-types */

import { useState } from 'react'
import styled from 'styled-components'
import { ChevronDown, ChevronUp } from 'react-feather'
import { grid } from '@coko/client'
import MinimalButton from './MinimalButton'
import { MediumRow, MediumRowSpaced } from './Containers'

const AccordionHead = styled(MinimalButton)`
  padding: 0;
  width: 100%;
`

const AccordionBody = styled.div`
  padding: 0 ${grid(1)} ${grid(2)} ${grid(4)};
  width: 100%;
`

const Accordion = ({
  label,
  caretIsOnRight,
  children,
  isOpenInitially,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(!!isOpenInitially)
  const chevron = isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />

  return (
    <div className={className}>
      <AccordionHead onClick={() => setIsOpen(open => !open)}>
        {caretIsOnRight ? (
          <MediumRowSpaced>
            {label}
            {chevron}
          </MediumRowSpaced>
        ) : (
          <MediumRow>
            {chevron}
            {label}
          </MediumRow>
        )}
      </AccordionHead>
      {isOpen && <AccordionBody>{children}</AccordionBody>}
    </div>
  )
}

export default Accordion
