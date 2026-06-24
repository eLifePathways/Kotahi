import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { th } from '@coko/client'
import { color } from '../../theme'

export const HasNextPage = styled(Link)`
  align-items: center;
  background: ${th('colorBackground')};
  display: flex;
  justify-content: center;
  text-decoration: none;
  width: 100%;
`

export const NextPageButton = styled.span`
  border-bottom: 1px solid ${color.brand1.tint90};
  border-top: 1px solid ${color.brand1.tint90};
  color: ${color.brand1.base};
  display: flex;
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  justify-content: center;
  margin-top: 16px;
  min-height: 40px;
  padding: 8px;
  position: relative;
  width: 100%;

  &:hover {
    background: ${color.brand1.tint50};
    color: ${color.brand1.base};
    cursor: pointer;
  }
`
