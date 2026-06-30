/* eslint-disable react/prop-types */

import { useContext } from 'react'
import { th, grid } from '@coko/client'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

import { Button } from '../../../pubsweet'
import { HiddenTabsContainer, Tab, TabContainer } from '../../../shared'
import Page from '../../../../ui/shared/Page'
import SearchControl from '../../../component-manuscripts/src/SearchControl'
import { ControlsContainer } from '../../../component-manuscripts/src/style'
import {
  URI_PAGENUM_PARAM,
  URI_SEARCH_PARAM,
  useQueryParams,
} from '../../../../shared/urlParamUtils'
import { FlexRow } from '../../../../globals'
import { ConfigContext } from '../../../config/src'

const TabLink = styled(Link)`
  color: ${th('colorText')};
  text-decoration: none;
`

const Tabs = styled.div`
  display: flex;
  margin-top: ${grid(1)};
`

const TabRow = styled(FlexRow)`
  width: 100%;
`

const RightControls = styled(ControlsContainer)`
  margin-left: auto;
  margin-bottom: ${grid(1)};
`

const DashboardLayout = ({ children }) => {
  const config = useContext(ConfigContext)
  const navigate = useNavigate()
  const location = useLocation()
  const { groupName } = useParams()
  const applyQueryParams = useQueryParams()
  const uriQueryParams = new URLSearchParams(location.search)
  const currentSearchQuery = uriQueryParams.get(URI_SEARCH_PARAM)
  const dashboardPages = []

  const { t } = useTranslation()

  if (config.dashboard?.showSections?.includes('submission'))
    dashboardPages.push({
      href: '/dashboard/submissions',
      label: t('dashboardPage.My Submissions'),
    })

  if (config.dashboard?.showSections?.includes('review'))
    dashboardPages.push({
      href: '/dashboard/reviews',
      label: t('dashboardPage.To Review'),
    })

  if (config.dashboard?.showSections?.includes('editor'))
    dashboardPages.push({
      href: '/dashboard/edits',
      label: t("dashboardPage.Manuscripts I'm editor of"),
    })

  return (
    <Page title={t('dashboardPage.Dashboard')}>
      {/* TODO The following block should be replaced with a new LinkTabs component */}
      <HiddenTabsContainer $sticky={false}>
        <TabRow>
          <Tabs>
            {dashboardPages.map(({ href, label }) => (
              <TabContainer key={href}>
                <TabLink to={`/${groupName}${href}`}>
                  <Tab $active={location.pathname.endsWith(href)}>
                    <div>{label}</div>
                  </Tab>
                </TabLink>
              </TabContainer>
            ))}
          </Tabs>
          <RightControls>
            <SearchControl
              applySearchQuery={newQuery =>
                applyQueryParams({
                  [URI_SEARCH_PARAM]: newQuery,
                  [URI_PAGENUM_PARAM]: 1,
                })
              }
              currentSearchQuery={currentSearchQuery}
            />
            <Button
              $primary
              onClick={() => navigate(`/${groupName}/newSubmission`)}
            >
              {t('dashboardPage.New submission')}
            </Button>
          </RightControls>
        </TabRow>
      </HiddenTabsContainer>
      {children}
    </Page>
  )
}

export default DashboardLayout
