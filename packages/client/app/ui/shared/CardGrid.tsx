import { type ReactNode } from 'react'
import styled from 'styled-components'
import { grid, th, H2, Link as UILink } from '@coko/client'

import { ArrowRight } from '../base/Icons'

// #region styled
const Link = styled(UILink)`
  display: block;
`

const Title = styled(H2)`
  border-bottom: 2px solid ${th('colorPrimary')};
  border-color: ${th('colorPrimary')};
`

const Description = styled.div`
  flex-grow: 1;
  color: ${th('colorText')};
  padding-top: ${grid(4)};
`

const IconWrapper = styled.div`
  align-self: end;
  padding-bottom: ${grid(6)};
  opacity: 0;
  transition: opacity 0.3s ease;

  > span[role='img'] {
    font-size: 2rem;
    color: ${th('colorPrimary')};
  }
`

const Card = styled.div`
  min-height: ${grid(76)};
  border-radius: ${th('borderRadius')};
  box-shadow: ${th('boxShadow')};
  padding: ${grid(12)} ${grid(8)} 0;
  cursor: pointer;
  background-color: ${th('colorBackground')};
  transition: box-shadow 0.2s ease;

  display: flex;
  flex-direction: column;

  &:hover,
  ${Link}:focus & {
    box-shadow: 0 0 0 3px ${th('colorPrimary')};
  }

  &:hover ${IconWrapper}, ${Link}:focus & ${IconWrapper} {
    opacity: 1;
  }
`

const Wrapper = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${grid(110)}, 1fr));
  gap: ${grid(8)};
  list-style: none;
  margin: 0 auto;
  padding: 0;
`
// #endregion styled

type CardItem = {
  title: string
  description: string
  url: string
  key: string
}

type CardGridProps = {
  items: CardItem[]
}

const CardGrid = ({ items }: CardGridProps): ReactNode => {
  return (
    <Wrapper>
      {items.map(item => {
        return (
          <li key={item.key}>
            <Link data-testid={`card-link-${item.key}`} to={item.url}>
              <Card>
                <Title>{item.title}</Title>
                <Description>{item.description}</Description>

                <IconWrapper>
                  <ArrowRight aria-hidden />
                </IconWrapper>
              </Card>
            </Link>
          </li>
        )
      })}
    </Wrapper>
  )
}

export default CardGrid
