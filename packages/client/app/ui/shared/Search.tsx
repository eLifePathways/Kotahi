import React, { ComponentProps } from 'react'
import styled from 'styled-components'
import { Input } from 'antd'
import { th } from '@coko/client'

type SearchProps = ComponentProps<typeof Input.Search>

const StyledSearch = styled(Input.Search)`
  .ant-input-outlined {
    transition-property: all, outline, outline-offset;
    transition-duration: 0.2s, 0s, 0s;
  }

  .ant-input-outlined:focus,
  .ant-input-outlined:focus-within {
    box-shadow: none;
    outline: 2px solid ${th('colorPrimary')};
  }

  .ant-input-search-btn:focus-visible {
    outline: 2px solid ${th('colorPrimary')};
    outline-offset: 0;
  }
`

const Search = (props: SearchProps): React.ReactNode => {
  const { className, ...rest } = props

  return <StyledSearch className={className} {...rest} />
}

export default Search
