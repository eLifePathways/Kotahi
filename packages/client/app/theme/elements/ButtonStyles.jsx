import { css } from 'styled-components'

export default css`
  background: #fff;
  border: none;
  border-radius: 0;
  cursor: pointer;
  font-size: inherit;
  padding: 5px 10px;

  &:disabled {
    color: #ccc;
    pointer-events: none;
  }

  &:hover {
    background: #f6f6f6;
  }
`
