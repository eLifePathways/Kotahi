/* eslint-disable react/prop-types */

import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import styled from 'styled-components'
import { Trans, useTranslation } from 'react-i18next'

import { th, grid, serverUrl } from '@coko/client'

import { Button } from '../../pubsweet'
import { ConfigContext } from '../../config/src'
import { getQueryStringByName } from '../../../shared/urlUtils'
import { color } from '../../../theme'

const getNextUrl = config => {
  const url = new URL(window.location.href)

  const redirectLink = `${
    config?.urlFrag + config?.dashboard?.loginRedirectUrl
  }`

  return `${url.searchParams.get('next') || redirectLink}`
}

const RegisterLinkButton = styled.button`
  border: 0;
  border-radius: 0;
  display: block;
  font-size: 1em;
  font-weight: 500;
  margin: 1em;
  padding: 0.25em 1em;
`

const RegisterInfoString = styled.p`
  color: #33444d;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.15em 1em;
  text-align: center;
`

const LoginButton = styled(Button)`
  display: block;
  margin-top: ${grid(3)};
  width: 100%;
`

// TODO: Shared?
const Container = styled.div`
  background: linear-gradient(
    134deg,
    ${color.brand1.base},
    ${color.brand1.tint25}
  );
  display: grid;
  height: 100vh;
  place-items: center;
`

const Content = styled.div`
  background: ${th('colorBackground')};
  border-radius: ${th('borderRadius')};
  box-shadow: ${th('boxShadow')};
  margin-bottom: 1rem;
  max-width: 40em;
  padding: ${grid(4)};
  text-align: center;

  h1 {
    margin-bottom: ${grid(2)};
  }

  img {
    height: auto;
    max-height: 307px;
    max-width: 475px;
    width: auto;
  }
`

const Centered = styled.div`
  text-align: center;
`

const ORCIDIcon = ({ className }) => (
  <span className={className}>
    <svg viewBox="0 0 256 256">
      <path
        d="M256,128c0,70.7-57.3,128-128,128C57.3,256,0,198.7,0,128C0,57.3,57.3,0,128,0C198.7,0,256,57.3,256,128z"
        fill="#A6CE39"
      />
      <g>
        <path d="M86.3,186.2H70.9V79.1h15.4v48.4V186.2z" fill="#FFFFFF" />
        <path
          d="M108.9,79.1h41.6c39.6,0,57,28.3,57,53.6c0,27.5-21.5,53.6-56.8,53.6h-41.8V79.1z M124.3,172.4h24.5   c34.9,0,42.9-26.5,42.9-39.7c0-21.5-13.7-39.7-43.7-39.7h-23.7V172.4z"
          fill="#FFFFFF"
        />
        <path
          d="M88.7,56.8c0,5.5-4.5,10.1-10.1,10.1c-5.6,0-10.1-4.6-10.1-10.1c0-5.6,4.5-10.1,10.1-10.1   C84.2,46.7,88.7,51.3,88.7,56.8z"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  </span>
)

const StyledORCIDIcon = styled(ORCIDIcon)`
  svg {
    height: 1rem;
  }
`

const Login = () => {
  const config = useContext(ConfigContext)
  const token = getQueryStringByName('token')
  const { t } = useTranslation()
  // If a JWT token is supplied as a query param (e.g. from OAuth)
  // go ahead and fetch the redirect URL
  let redirectLink = token ? getNextUrl(config) : null
  redirectLink =
    redirectLink && getQueryStringByName('redirectUrl')
      ? getQueryStringByName('redirectUrl')
      : redirectLink

  if (token) {
    window.localStorage.setItem('token', token)
    const intendedPage = localStorage.getItem('intendedPage')

    if (intendedPage) {
      redirectLink = intendedPage
      localStorage.removeItem('intendedPage')
    }

    return <Navigate replace to={redirectLink} />
  }

  const nextpage = `${serverUrl}/auth/orcid?group_id=${config?.groupId}`
  return redirectLink ? (
    <Navigate replace to={redirectLink} />
  ) : (
    <Container>
      <Centered>
        <Content>
          <img
            alt={config?.groupIdentity?.brandName}
            src={
              config?.logo?.storedObjects[0].url ||
              config?.groupIdentity?.logoPath
            }
          />
          <RegisterInfoString>
            <Trans
              components={[<StyledORCIDIcon key="icon" />]}
              i18nKey="loginPage.kotahiUses"
            />
          </RegisterInfoString>
          <LoginButton as="a" href={nextpage} primary>
            {t('loginPage.Login with ORCID')}
          </LoginButton>
          <RegisterLinkButton as="a" href={nextpage}>
            {t('loginPage.Register with ORCID')}
          </RegisterLinkButton>
        </Content>
      </Centered>
    </Container>
  )
}

export default Login
