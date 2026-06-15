import { type ReactNode, useContext } from 'react'
import { Route, Routes, Navigate, Outlet } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'

import AcceptArticleOwnershipPage from './components/component-dashboard/src/components/AcceptArticleOwnershipPage'
import ArticleArtifactPage from './components/component-published-artifact/components/ArticleArtifactPage'
import CMSArticlePage from './components/component-cms-manager/src/CMSArticlePage'
import CMSFileBrowserPage from './components/component-cms-manager/src/CMSFileBrowserPage'
import CMSLayoutPage from './components/component-cms-manager/src/CMSLayoutPage'
import CMSMetadataPage from './components/component-cms-manager/src/CMSMetadataPage'
import CMSPagesPage from './components/component-cms-manager/src/CMSPagesPage'
import CMSPublishingCollectionPage from './components/component-cms-manager/src/CMSPublishingCollectionPage'
import ConfigManagerPage from './components/component-config-manager/src/ConfigManagerPage'
import DashboardEditsPage from './components/component-dashboard/src/components/DashboardEditsPage'
import DashboardLayout from './components/component-dashboard/src/components/DashboardLayout'
import DashboardRedirect from './components/component-dashboard/src/components/DashboardRedirect'
import DashboardReviewsPage from './components/component-dashboard/src/components/DashboardReviewsPage'
import DashboardSubmissionsPage from './components/component-dashboard/src/components/DashboardSubmissionsPage'
import DecisionPage from './components/component-review/src/components/DecisionPage'
import DeclineArticleOwnershipPage from './components/component-dashboard/src/components/DeclineArticleOwnershipPage'
import FormBuilderPage from './components/component-formbuilder/src/components/FormBuilderPage'
import GroupsPage from './components/component-frontpage/src/GroupsPage'
import InvitationAcceptedPage from './components/component-dashboard/src/components/InvitationAcceptedPage'
import Login from './components/component-login/src'
import ManuscriptPage from './components/component-manuscript/src/components/ManuscriptPage'
import ManuscriptsPage from './components/component-manuscripts/src/ManuscriptsPage'
import NewSubmissionPage from './components/component-submit/src/components/NewSubmissionPage'
import { PageError } from './components/shared'
import ProductionPage from './components/component-production/src/components/ProductionPage'
import ProfilePage from './components/component-profile/src/ProfilePage'
import ReportPage from './components/component-reporting/src/ReportPage'
import ReviewPage from './components/component-review/src/components/ReviewPage'
import ReviewPreviewPage from './components/component-review/src/components/ReviewPreviewPage'
import SubmitRedirect from './components/component-submit/src/components/SubmitRedirect'
import TasksTemplatePage from './components/component-task-manager/src/TasksTemplatePage'
import UsersPage from './components/component-users-manager/src/UsersPage'

import { ConfigContext } from './components/config/src'
import { XpubContext } from './components/xpub-with-context/src'

import { AuthenticatedPage, GroupPage, MenuPage } from './pages'

import { CURRENT_USER } from './queries'

import Layout from './ui/base/Layout'

// #region helpers
enum Role {
  // global
  Admin = 'admin',
  // group
  User = 'user',
  GroupManager = 'groupManager',
  GroupAdmin = 'groupAdmin',
}

type RoleGateProps = {
  roles: Role[]
}

const RoleGate = (props: RoleGateProps): ReactNode => {
  const { roles } = props

  // switch to useCurrentUser once that has been wired up
  const { data, loading, error } = useQuery(CURRENT_USER)

  if (error) {
    // TO DO - handle this with ui
    console.error(error)
    return null
  }

  if (loading) {
    // TO DO - handle this with a spinner (or useCurrentUser should)
    return null
  }

  // @ts-ignore
  const currentUser = data.currentUser

  const pass = roles.some(role => {
    if (role === Role.Admin) {
      return currentUser.globalRoles.includes(role)
    }

    return currentUser.groupRoles.includes(role)
  })

  if (!pass) {
    return <PageError errorCode={403} />
  }

  return <Outlet />
}
// #endregion helpers

/**
 * TO DO - dashboard tabs don't need to be separate urls
 * (OR dashboard does not need tabs at all ???)
 *
 * kept separate here in order to call config context within config provider
 * (config provider starts at /:groupName)
 *
 * Clean solution for the above is to not use config in the router and simply
 * hide / show sections in the ui
 */
const DashboardRoutes = (): ReactNode => {
  const config = useContext(ConfigContext)
  return (
    <Routes>
      <Route element={<DashboardRedirect />} path="" />
      {config?.dashboard?.showSections?.includes('submission') && (
        <Route element={<DashboardSubmissionsPage />} path="submissions" />
      )}
      {config?.dashboard?.showSections?.includes('review') && (
        <Route element={<DashboardReviewsPage />} path="reviews" />
      )}
      {config?.dashboard?.showSections?.includes('editor') && (
        <Route element={<DashboardEditsPage />} path="edits" />
      )}
    </Routes>
  )
}

const Router = (): ReactNode => {
  // TO DO - look into how to get rid of these two
  const [conversion] = useContext(XpubContext)

  return (
    <Routes>
      <Route element={<GroupsPage />} path="/" />

      <Route element={<GroupPage />} path="/:groupName">
        <Route element={<Navigate replace to="login"></Navigate>} index />
        <Route element={<Login />} path="login" />

        {/* Invitations */}
        <Route
          element={<DeclineArticleOwnershipPage />}
          path="decline/:invitationId"
        />

        <Route
          element={<AcceptArticleOwnershipPage />}
          path="acceptarticle/:invitationId"
        />

        <Route
          element={<InvitationAcceptedPage />}
          path="invitation/accepted"
        />

        {/* TO DO - should this be public? */}
        <Route
          element={<ArticleArtifactPage />}
          path="versions/:version/artifacts/:artifactId"
        />

        <Route element={<AuthenticatedPage />}>
          <Route
            element={
              <Layout converting={conversion.converting}>
                <MenuPage />
                <Outlet />
              </Layout>
            }
          >
            <Route element={<RoleGate roles={[Role.Admin]} />}>
              <Route element={<ProfilePage />} path="profile/:id" />
            </Route>

            <Route element={<RoleGate roles={[Role.User]} />}>
              <Route element={<ProfilePage />} path="profile" />
              <Route element={<NewSubmissionPage />} path="newSubmission" />
              <Route element={<ReviewPage />} path="versions/:version/review" />

              <Route
                element={<ReviewPreviewPage />}
                path="versions/:version/reviewPreview"
              />

              <Route
                element={<DecisionPage />}
                path="versions/:version/decision"
              />

              <Route
                element={<SubmitRedirect />}
                path="versions/:version/submit"
              />

              <Route
                element={<SubmitRedirect />}
                path="versions/:version/evaluation"
              />

              <Route
                element={<ProductionPage />}
                path="versions/:version/production"
              />

              <Route
                element={
                  <DashboardLayout>
                    <DashboardRoutes />
                  </DashboardLayout>
                }
                path="dashboard/*"
              />
            </Route>

            <Route path="admin">
              <Route
                element={<RoleGate roles={[Role.GroupAdmin, Role.Admin]} />}
              >
                <Route element={<ReportPage />} path="reports" />

                <Route
                  element={<FormBuilderPage category="submission" />}
                  path="submission-form-builder"
                />

                <Route
                  element={<FormBuilderPage category="review" />}
                  path="review-form-builder"
                />

                <Route
                  element={<FormBuilderPage category="decision" />}
                  path="decision-form-builder"
                />

                <Route element={<UsersPage />} path="users" />
                <Route element={<TasksTemplatePage />} path="tasks" />

                <Route path="cms">
                  <Route element={<CMSPagesPage />} path="pages/:pageId?" />
                  <Route element={<CMSLayoutPage />} path="layout" />
                  <Route element={<CMSArticlePage />} path="article" />
                  <Route element={<CMSFileBrowserPage />} path="filebrowser" />
                  <Route element={<CMSMetadataPage />} path="metadata" />
                  <Route
                    element={<CMSPublishingCollectionPage />}
                    path="collections"
                  />
                </Route>

                <Route element={<ConfigManagerPage />} path="configuration" />
              </Route>

              <Route
                element={
                  <RoleGate
                    roles={[Role.GroupManager, Role.GroupAdmin, Role.Admin]}
                  />
                }
              >
                <Route element={<ManuscriptsPage />} path="manuscripts" />,
              </Route>
            </Route>

            <Route
              element={
                <RoleGate
                  roles={[Role.GroupManager, Role.GroupAdmin, Role.Admin]}
                />
              }
            >
              <Route
                element={<ManuscriptPage />}
                key="manuscript"
                path={`versions/:version/manuscript`}
              />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route element={<PageError errorCode={404} />} path="*" />
    </Routes>
  )
}

export default Router
