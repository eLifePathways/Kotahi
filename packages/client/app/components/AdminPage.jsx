/* eslint-disable react-hooks/exhaustive-deps, react-hooks/immutability, react-hooks/refs */

import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import { throttle } from 'lodash'
import PropTypes from 'prop-types'
import { useContext, useEffect, useRef } from 'react'
import Modal from 'react-modal'
import {
  matchPath,
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
} from 'react-router-dom'
import styled from 'styled-components'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { JournalContext } from './xpub-journal/src'
import { XpubContext } from './xpub-with-context/src'
import { ConfigContext } from './config/src'
import { getLanguages } from '../i18n'

import FormBuilderPage from './component-formbuilder/src/components/FormBuilderPage'
import ManuscriptPage from './component-manuscript/src/components/ManuscriptPage'
import ManuscriptsPage from './component-manuscripts/src/ManuscriptsPage'
import ProductionPage from './component-production/src/components/ProductionPage'
import ProfilePage, {
  UPDATE_LANGUAGE,
} from './component-profile/src/ProfilePage'
import ReportPage from './component-reporting/src/ReportPage'
import DecisionPage from './component-review/src/components/DecisionPage'
import ReviewPage from './component-review/src/components/ReviewPage'
import ReviewPreviewPage from './component-review/src/components/ReviewPreviewPage'
import NewSubmissionPage from './component-submit/src/components/NewSubmissionPage'
import SubmitPage from './component-submit/src/components/SubmitPage'
import TasksTemplatePage from './component-task-manager/src/TasksTemplatePage'
import UsersPage from './component-users-manager/src/UsersPage'
import ConfigManagerPage from './component-config-manager/src/ConfigManagerPage'

import CMSPagesPage from './component-cms-manager/src/CMSPagesPage'
import CMSLayoutPage from './component-cms-manager/src/CMSLayoutPage'
import CMSArticlePage from './component-cms-manager/src/CMSArticlePage'
import CMSMetadataPage from './component-cms-manager/src/CMSMetadataPage'
import CMSPublishingCollectionPage from './component-cms-manager/src/CMSPublishingCollectionPage'
import CMSFileBrowserPage from './component-cms-manager/src/CMSFileBrowserPage'
import QUERY from './adminPageQueries'

import Menu from './Menu'
import { Spinner, PageError } from './shared'

import DashboardEditsPage from './component-dashboard/src/components/DashboardEditsPage'
import DashboardLayout from './component-dashboard/src/components/DashboardLayout'
import DashboardReviewsPage from './component-dashboard/src/components/DashboardReviewsPage'
import DashboardSubmissionsPage from './component-dashboard/src/components/DashboardSubmissionsPage'

const getParams = ({ routerPath, path }) => {
  return matchPath(routerPath, path).params
}

const Root = styled.div`
  display: flex;
  height: 100vh;
  max-height: 100vh;
  ${({ converting }) =>
    converting &&
    `
     button,
     a {
       pointer-events: none;
     }
  `};
  overflow: hidden;
  position: relative;
  width: 100vw;
  z-index: 0;
`

// TODO: Redirect if token expires
const PrivateRoute = ({ component: Component, redirectLink, ...rest }) => {
  const config = useContext(ConfigContext)
  const { urlFrag, instanceName } = config

  if (
    ['journal', 'prc'].includes(instanceName) &&
    rest.currentUser &&
    !rest.currentUser.email &&
    rest.path !== `${urlFrag}/profile` // TODO configure this url via config manager
  ) {
    return <Redirect to={`${urlFrag}/profile`} />
  }

  return (
    <Route
      {...rest}
      render={props => {
        return localStorage.getItem('token') ? (
          <Component {...rest} {...props} />
        ) : (
          <Redirect to={redirectLink} />
        )
      }}
    />
  )
}

PrivateRoute.propTypes = {
  component: PropTypes.func.isRequired,
  redirectLink: PropTypes.string.isRequired,
}

const AdminPage = () => {
  Modal.setAppElement('#root')
  const history = useHistory()
  const journal = useContext(JournalContext)
  const [conversion] = useContext(XpubContext)
  const config = useContext(ConfigContext)
  const { urlFrag, instanceName } = config
  const location = useLocation()
  const { t } = useTranslation()
  const client = useApolloClient()

  const { loading, error, data, refetch } = useQuery(QUERY, {
    fetchPolicy: 'network-only',
  })

  const previousDataRef = useRef(null)

  const [updateLanguage] = useMutation(UPDATE_LANGUAGE)
  useEffect(() => {
    if (!data?.currentUser) return

    if (!data.currentUser.preferredLanguage) {
      updateLanguage({
        variables: { id: currentUser.id, preferredLanguage: i18next.language },
      })
    } else {
      const languageValues = getLanguages().map(l => l.value)
      i18next.changeLanguage(
        languageValues.includes(currentUser.preferredLanguage)
          ? currentUser.preferredLanguage
          : 'en',
      )
    }
  }, [data?.currentUser])

  // Do this to prevent polling-related flicker
  if (loading && !previousDataRef.current) {
    return <Spinner />
  }

  let notice = ''

  if (error || !data.currentUser) {
    if (error?.networkError) {
      notice = 'You are offline.'
    } else {
      if (localStorage.getItem('token') !== null) {
        localStorage.removeItem('token')
      }

      client.cache.reset()

      localStorage.setItem('intendedPage', location.pathname + location.search)
      const redirectlocation = `${urlFrag}/login`
      return <Redirect to={redirectlocation} />
    }
  }

  const currentUser = data?.currentUser
  journal.textStyles = data?.builtCss.css
  const hasAlert = data?.userHasTaskAlerts

  previousDataRef.current = data

  const { pathname } = history.location
  const showLinks = pathname.match(/^\/(submit|manuscript)/g)
  let links = []
  const submissionFormBuilderLink = `${urlFrag}/admin/submission-form-builder`
  const reviewFormBuilderLink = `${urlFrag}/admin/review-form-builder`
  const decisionFormBuilderLink = `${urlFrag}/admin/decision-form-builder`
  const configurationLink = `${urlFrag}/admin/configuration`
  const homeLink = `${urlFrag}/dashboard`
  const dashboardSubmissionsLink = `${urlFrag}/dashboard/submissions`
  const dashboardReviewsLink = `${urlFrag}/dashboard/reviews`
  const dashboardEditsLink = `${urlFrag}/dashboard/edits`
  const profileLink = `${urlFrag}/profile`
  const manuscriptsLink = `${urlFrag}/admin/manuscripts`
  const reportsLink = `${urlFrag}/admin/reports`
  const userAdminLink = `${urlFrag}/admin/users`
  const tasksTemplateLink = `${urlFrag}/admin/tasks`
  const CMSPagesPageLink = `${urlFrag}/admin/cms/pages`
  const CMSLayoutPageLink = `${urlFrag}/admin/cms/layout`
  const CMSArticlePageLink = `${urlFrag}/admin/cms/article`
  const CMSFileBrowserLink = `${urlFrag}/admin/cms/filebrowser`
  const CMSMetadataPageLink = `${urlFrag}/admin/cms/metadata`
  const CMSPublishingCollectionPageLink = `${urlFrag}/admin/cms/collections`
  const loginLink = `${urlFrag}/login?next=${homeLink}`
  const path = `${urlFrag}/versions/:version`
  const redirectLink = `${urlFrag}/login?next=${homeLink}`

  if (showLinks) {
    const params = getParams(pathname, path)
    const baseLink = `${urlFrag}/versions/${params.version}`
    const submitLink = `${baseLink}/submit`
    const manuscriptLink = `${baseLink}/manuscript`

    links = showLinks
      ? [
          { link: submitLink, name: t('leftMenu.Summary Info') },
          {
            link: manuscriptLink,
            name: t('leftMenu.Manuscript'),
          },
        ]
      : null
  }

  const isUser = currentUser?.groupRoles?.includes('user')
  const isGroupManager = currentUser?.groupRoles?.includes('groupManager')
  const isGroupAdmin = currentUser?.groupRoles?.includes('groupAdmin')
  const isAdmin = currentUser?.globalRoles?.includes('admin')

  if (
    currentUser &&
    (isUser || isGroupManager || isGroupAdmin || isAdmin) &&
    ['journal', 'prc', 'preprint2'].includes(instanceName) // TODO: remove instance based logic and refactor it to be enabled and disabled from config manager
  ) {
    links.push({
      link: homeLink,
      name: t('leftMenu.Dashboard'),
      icon: 'home',
      hasAlert,
    })
  }

  if (isGroupManager || isGroupAdmin) {
    links.push({
      link: manuscriptsLink,
      name: t('leftMenu.Manuscripts'),
      icon: 'file-text',
    })
    if (config?.report?.showInMenu && isGroupAdmin)
      links.push({
        link: reportsLink,
        name: t('leftMenu.Reports'),
        icon: 'activity',
      })
  }

  if (isGroupAdmin || isAdmin) {
    links.push({
      menu: 'Settings',
      name: t('leftMenu.Settings'),
      icon: 'settings',
      links: [
        {
          menu: 'Forms',
          name: t('leftMenu.Forms'),
          icon: 'check-square',
          links: [
            {
              link: submissionFormBuilderLink,
              name: t('leftMenu.Submission'),
            },
            {
              link: reviewFormBuilderLink,
              name: t('leftMenu.Review'),
            },
            {
              link: decisionFormBuilderLink,
              name: t('leftMenu.Decision'),
            },
          ],
        },
        {
          link: tasksTemplateLink,
          name: t('leftMenu.Tasks'),
          icon: 'list',
        },
        {
          link: userAdminLink,
          name: t('leftMenu.Users'),
          icon: 'users',
        },
        {
          link: configurationLink,
          name: t('leftMenu.Configuration'),
          icon: 'sliders',
        },
        {
          menu: 'CMS',
          name: t('leftMenu.CMS'),
          icon: 'layout',
          links: [
            {
              link: CMSPagesPageLink,
              name: t('leftMenu.Pages'),
              icon: '',
            },
            {
              link: CMSLayoutPageLink,
              name: t('leftMenu.Layout'),
              icon: '',
            },
            {
              link: CMSArticlePageLink,
              name: t('leftMenu.Article'),
              icon: '',
            },
            {
              link: CMSMetadataPageLink,
              name: t('leftMenu.Metadata'),
              icon: '',
            },
            {
              link: CMSFileBrowserLink,
              name: t('leftMenu.FileBrowser'),

              icon: '',
            },
            {
              link: CMSPublishingCollectionPageLink,
              name: t('leftMenu.Collections'),
              icon: '',
            },
          ],
        },
      ],
    })
  }

  const invitationId = window.localStorage.getItem('invitationId')
    ? window.localStorage.getItem('invitationId')
    : ''

  const inviteAction = window.localStorage.getItem('inviteAction')
    ? window.localStorage.getItem('inviteAction')
    : ''

  const dashboardRedirectUrl = currentUser?.recentTab
    ? `${urlFrag}/dashboard/${currentUser.recentTab}`
    : dashboardSubmissionsLink

  const dashboardRedirect = () =>
    invitationId ? (
      <Redirect
        to={`${urlFrag}/${
          inviteAction === 'decline'
            ? 'decline/'.concat(invitationId)
            : 'invitation/accepted'
        }`}
      />
    ) : (
      <Redirect to={dashboardRedirectUrl} />
    )

  // Throttled refetch query `currentUser` once every 2mins
  const throttledRefetch = throttle(refetch, 120000, { trailing: false })

  // Triggered by captured events onClick and onKeyDown
  const handleEvent = () => {
    throttledRefetch()
  }

  return (
    <Root
      converting={conversion.converting}
      onClickCapture={handleEvent}
      onKeyDownCapture={handleEvent}
    >
      <Menu
        brand={config?.groupIdentity?.brandName}
        brandLink={homeLink}
        className=""
        loginLink={loginLink}
        navLinkComponents={links}
        notice={notice}
        profileLink={profileLink}
        user={currentUser}
      />
      <Switch>
        <PrivateRoute
          component={ProfilePage}
          currentUser={currentUser}
          exact
          path={profileLink}
          redirectLink={redirectLink}
        />
        {(isUser || isGroupManager || isGroupAdmin || isAdmin) && [
          <PrivateRoute
            component={ProfilePage}
            currentUser={currentUser}
            exact
            key="profile"
            path={`${urlFrag}/profile/:id`}
            redirectLink={redirectLink}
          />,
          <PrivateRoute
            component={NewSubmissionPage}
            currentUser={currentUser}
            exact
            key="new-submission"
            path={`${urlFrag}/newSubmission`}
            redirectLink={redirectLink}
          />,
          <PrivateRoute
            component={ReviewPage}
            currentUser={currentUser}
            exact
            key="review"
            path={`${urlFrag}/versions/:version/review`}
            redirectLink={redirectLink}
          />,
          <PrivateRoute
            component={ReviewPreviewPage}
            currentUser={currentUser}
            exact
            key="review-preview"
            path={`${urlFrag}/versions/:version/reviewPreview`}
            redirectLink={redirectLink}
          />,
          <PrivateRoute
            component={DecisionPage}
            currentUser={currentUser}
            exact
            key="decision"
            path={`${urlFrag}/versions/:version/decision`}
            redirectLink={redirectLink}
          />,
          <PrivateRoute
            component={SubmitPage}
            currentUser={currentUser}
            exact
            key="submit"
            path={`${urlFrag}/versions/:version/${
              ['preprint1', 'preprint2'].includes(config.instanceName)
                ? 'evaluation'
                : 'submit'
            }`} // TODO: Remove instance based custom submit page and refactor it use config manager flag in future
            redirectLink={redirectLink}
          />,
          <Route exact key="dashboard" path={`${urlFrag}/dashboard/:path?`}>
            <DashboardLayout urlFrag={urlFrag}>
              <Switch>
                <PrivateRoute
                  component={dashboardRedirect}
                  currentUser={currentUser}
                  exact
                  path={homeLink}
                  redirectLink={redirectLink}
                />
                {config?.dashboard?.showSections?.includes('submission') && (
                  <PrivateRoute
                    component={DashboardSubmissionsPage}
                    currentUser={currentUser}
                    exact
                    key="submission"
                    path={dashboardSubmissionsLink}
                    redirectLink={redirectLink}
                  />
                )}
                {config?.dashboard?.showSections?.includes('review') && (
                  <PrivateRoute
                    component={DashboardReviewsPage}
                    currentUser={currentUser}
                    exact
                    path={dashboardReviewsLink}
                    redirectLink={redirectLink}
                  />
                )}
                {config?.dashboard?.showSections?.includes('editor') && (
                  <PrivateRoute
                    component={DashboardEditsPage}
                    currentUser={currentUser}
                    exact
                    path={dashboardEditsLink}
                    redirectLink={redirectLink}
                  />
                )}
              </Switch>
            </DashboardLayout>
          </Route>,
          <PrivateRoute
            component={ProductionPage}
            currentUser={currentUser}
            key="production"
            path={`${urlFrag}/versions/:version/production`}
            redirectLink={redirectLink}
          />,
        ]}
        {(isGroupAdmin || isAdmin) && [
          // We use array instead of <></> because of https://stackoverflow.com/a/68637108/6505513
          <PrivateRoute
            component={FormBuilderPage}
            currentUser={currentUser}
            exact
            key="form-builder"
            path={`${urlFrag}/admin/form-builder`}
            redirectLink={redirectLink}
          />,
          <PrivateRoute
            category="submission"
            component={FormBuilderPage}
            currentUser={currentUser}
            exact
            key="submission-form-builder"
            path={`${urlFrag}/admin/submission-form-builder`}
            redirectLink={redirectLink}
          />,
          <PrivateRoute
            category="review"
            component={FormBuilderPage}
            currentUser={currentUser}
            exact
            key="review-form-builder"
            path={`${urlFrag}/admin/review-form-builder`}
            redirectLink={redirectLink}
          />,
          <PrivateRoute
            category="decision"
            component={FormBuilderPage}
            currentUser={currentUser}
            exact
            key="decision-form-builder"
            path={`${urlFrag}/admin/decision-form-builder`}
            redirectLink={redirectLink}
          />,
          <PrivateRoute
            component={UsersPage}
            currentUser={currentUser}
            key="users"
            path={`${urlFrag}/admin/users`}
            redirectLink={redirectLink}
          />,
          <PrivateRoute
            component={TasksTemplatePage}
            key="tasks"
            path={`${urlFrag}/admin/tasks`}
            redirectLink={redirectLink}
          />,

          <PrivateRoute
            component={CMSPagesPage}
            currentUser={currentUser}
            key="CMSPagesPage"
            path={`${CMSPagesPageLink}/:pageId?`}
            redirectLink={redirectLink}
          />,

          <PrivateRoute
            component={CMSLayoutPage}
            currentUser={currentUser}
            key="CMSPagesPage"
            path={`${CMSLayoutPageLink}`}
            redirectLink={redirectLink}
          />,

          <PrivateRoute
            component={CMSArticlePage}
            currentUser={currentUser}
            key="CMSPagesPage"
            path={`${CMSArticlePageLink}`}
            redirectLink={redirectLink}
          />,

          <PrivateRoute
            component={CMSFileBrowserPage}
            currentUser={currentUser}
            key="CMSPagesPage"
            path={`${CMSFileBrowserLink}`}
            redirectLink={redirectLink}
          />,

          <PrivateRoute
            component={CMSMetadataPage}
            currentUser={currentUser}
            key="CMSPagesPage"
            path={`${CMSMetadataPageLink}`}
            redirectLink={redirectLink}
          />,

          <PrivateRoute
            component={CMSPublishingCollectionPage}
            currentUser={currentUser}
            key="CMSPagesPage"
            path={`${CMSPublishingCollectionPageLink}`}
            redirectLink={redirectLink}
          />,

          <PrivateRoute
            component={ConfigManagerPage}
            key="configuration"
            path={`${urlFrag}/admin/configuration`}
            redirectLink={redirectLink}
          />,
        ]}
        {(isGroupManager || isGroupAdmin) && [
          <PrivateRoute
            component={ManuscriptPage}
            currentUser={currentUser}
            exact
            key="manuscript"
            path={`${urlFrag}/versions/:version/manuscript`}
            redirectLink={redirectLink}
          />,
          <PrivateRoute
            component={ManuscriptsPage}
            currentUser={currentUser}
            key="manuscripts"
            path={`${urlFrag}/admin/manuscripts`}
            redirectLink={redirectLink}
          />,
        ]}
        {isGroupAdmin && [
          <PrivateRoute
            component={ReportPage}
            currentUser={currentUser}
            key="reports"
            path={reportsLink}
            redirectLink={redirectLink}
          />,
        ]}

        {isUser || isGroupManager || isGroupAdmin || isAdmin ? (
          <Route>
            <PageError errorCode={404} />
          </Route>
        ) : (
          <Route>
            <PageError errorCode={403} />
          </Route>
        )}
      </Switch>
    </Root>
  )
}

export default AdminPage
