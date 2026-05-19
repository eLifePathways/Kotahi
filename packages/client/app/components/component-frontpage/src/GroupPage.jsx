/* stylelint-disable alpha-value-notation, color-function-notation */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { th, grid } from '@coko/client'
import styled from 'styled-components'
import { Spinner, CommsErrorBanner, Select } from '../../shared'
import { GET_GROUPS } from '../../../queries'
import theme, { color } from '../../../theme'
import { DynamicThemeProvider } from '../../theme/src'
import GlobalStyle from '../../../theme/elements/GlobalStyle'

const Container = styled.div`
  background: ${color.gray97};
  display: grid;
  height: 100vh;
  place-items: center;
`

const Content = styled.div`
  background: ${th('colorBackground')};
  border-radius: ${th('borderRadius')};
  box-shadow: 0 0 8px 0 rgb(0 0 0 / 25%);
  margin-bottom: 1rem;
  max-width: 40em;
  min-width: 20em;
  padding: ${grid(4)};
  text-align: left;
`

const Centered = styled.div`
  text-align: center;
`

const LoginSelect = styled(Select)`
  display: block;
  margin-top: ${grid(1)};
  width: 100%;
`

export const capitalizeFirstLetter = string => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const GroupPage = () => {
  const navigate = useNavigate()
  const [selectedOption, setSelectedOption] = useState('')
  const { loading, error, data } = useQuery(GET_GROUPS)

  if (loading && !data) return <Spinner />
  if (error)
    return (
      <Container>
        <Centered>
          <Content>
            <CommsErrorBanner error={error} />
          </Content>
        </Centered>
      </Container>
    )

  if (data?.groups.length === 1) {
    navigate(`/${data?.groups[0]?.name}`)
  }

  const redirectToLogin = value => {
    setSelectedOption(value)
    navigate(value)
  }

  const groups = data?.groups.map(group => {
    const activeConfig = group?.configs?.find(config => config?.active)
    const parsedData = JSON.parse(activeConfig?.formData)
    return {
      label:
        parsedData?.groupIdentity?.brandName ||
        capitalizeFirstLetter(group.name),
      value: `/${group.name}/login`,
    }
  })

  return (
    <DynamicThemeProvider theme={theme}>
      <GlobalStyle />
      <Container>
        <Content>
          Select group to login
          <LoginSelect
            aria-label="Select group"
            isClearable={false}
            label="Select group"
            onChange={selected => {
              redirectToLogin(selected.value)
            }}
            options={groups}
            placeholder="Select group"
            value={selectedOption}
            width="100%"
          />
        </Content>
      </Container>
    </DynamicThemeProvider>
  )
}

export default GroupPage
