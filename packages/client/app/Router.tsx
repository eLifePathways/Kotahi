import { type ReactNode, useContext } from 'react'
import { Route, Routes, Navigate, Outlet } from 'react-router-dom'

import AcceptArticleOwnershipPage from './components/component-dashboard/src/components/AcceptArticleOwnershipPage'
import ArticleArtifactPage from './components/component-published-artifact/components/ArticleArtifactPage'
import DeclineArticleOwnershipPage from './components/component-dashboard/src/components/DeclineArticleOwnershipPage'
import GroupPage from './components/component-frontpage/src/GroupPage'
import InvitationAcceptedPage from './components/component-dashboard/src/components/InvitationAcceptedPage'
import Login from './components/component-login/src'
import { XpubContext } from './components/xpub-with-context/src'

import { GroupWrapperPage, MenuPage } from './pages'

import Layout from './ui/base/Layout'

import AdminPage from './components/AdminPage'

const Router = (): ReactNode => {
  const [conversion] = useContext(XpubContext)

  return (
    <Routes>
      <Route element={<GroupPage />} path="/" />

      <Route element={<GroupWrapperPage />} path="/:groupName">
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

        <Route
          element={<ArticleArtifactPage />}
          path={`versions/:version/artifacts/:artifactId`}
        />

        <Route
          element={
            <Layout converting={conversion.converting}>
              <MenuPage />
              <Outlet />
            </Layout>
          }
        >
          <Route element={<AdminPage />} path="*" />
        </Route>
      </Route>
    </Routes>
  )
}

export default Router
