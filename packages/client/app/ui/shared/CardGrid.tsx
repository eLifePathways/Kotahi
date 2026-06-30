import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { ArrowRightOutlined } from '@ant-design/icons'
import { grid, th, H3 } from '@coko/client'

// #region styled
const Title = styled(H3)`
  border-bottom: 2px solid ${th('colorPrimary')};
`

const Description = styled.div`
  flex-grow: 1;
  color: ${th('colorText')};
  padding-top: ${grid(2)};
`

const IconWrapper = styled.div`
  align-self: end;
  padding-bottom: ${grid(3)};
  opacity: 0;
  transition: opacity 0.3s ease;

  > span[role='img'] {
    font-size: 2rem;
    color: ${th('colorPrimary')};
  }
`

const Card = styled.div`
  min-height: ${grid(38)};
  border: 2px solid ${th('colorBorder')};
  border-radius: 3px;
  padding: ${grid(6)} ${grid(4)} 0;
  cursor: pointer;

  display: flex;
  flex-direction: column;

  ${Title} {
    border-color: ${th('colorPrimary')};
  }

  &:hover ${IconWrapper} {
    opacity: 1;
  }
`

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, ${grid(55)});
  gap: ${grid(4)};
  margin: 0 auto;
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
          <Link key={item.key} to={item.url}>
            <Card>
              <Title>{item.title}</Title>
              <Description>{item.description}</Description>

              <IconWrapper>
                <ArrowRightOutlined />
              </IconWrapper>
            </Card>
          </Link>
        )
      })}
    </Wrapper>
  )
}

export default CardGrid
