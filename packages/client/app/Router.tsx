import { type ReactNode } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

import AcceptArticleOwnershipPage from './components/component-dashboard/src/components/AcceptArticleOwnershipPage'
import ArticleArtifactPage from './components/component-published-artifact/components/ArticleArtifactPage'
import DeclineArticleOwnershipPage from './components/component-dashboard/src/components/DeclineArticleOwnershipPage'
import GroupPage from './components/component-frontpage/src/GroupPage'
import InvitationAcceptedPage from './components/component-dashboard/src/components/InvitationAcceptedPage'
import Login from './components/component-login/src'

import { GroupWrapperPage } from './pages'

import AdminPage from './components/AdminPage'

const Router = (): ReactNode => {
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

        {/* AdminPage has nested routes within */}
        <Route element={<AdminPage />} path="*" />
      </Route>
    </Routes>
  )
}

export default Router
