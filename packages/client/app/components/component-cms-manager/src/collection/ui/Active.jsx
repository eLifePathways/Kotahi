/* eslint-disable react/prop-types */

import styled from 'styled-components'

const Label = styled.label`
  display: inline-block;
  height: 24px;

  input {
    height: 0;
    opacity: 0;
    width: 0;
  }

  input:checked + span {
    background-color: #3aae2a;
  }

  input:checked + span::before {
    transform: translateX(26px);
  }

  input:focus + span {
    box-shadow: 0 0 1px #3aae2a;
  }

  position: relative;
  width: 50px;
`

const SpanSlider = styled.span`
  background-color: #ccc;
  border-radius: 24px;
  inset: 0;

  cursor: pointer;
  position: absolute;
  transition: 0.4s;

  ::before {
    background-color: white;
    border-radius: 50%;
    bottom: 4px;
    content: '';
    height: 16px;
    left: 4px;
    position: absolute;
    transition: 0.4s;
    width: 16px;
  }
`

const Active = ({ setActive, value }) => {
  return (
    <Label>
      <input
        checked={!!value}
        onChange={() => setActive(!value)}
        type="checkbox"
      />
      <SpanSlider />
    </Label>
  )
}

export default Active
