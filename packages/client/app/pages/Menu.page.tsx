import { type ReactNode, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useParams, Navigate } from 'react-router-dom'
import { useApolloClient, useQuery } from '@apollo/client/react'

import { ConfigContext } from '../components/config/src'
import Menu from '../components/Menu'
import { CURRENT_USER } from '../queries'

// const loginLink = `${urlFrag}/login?next=${homeLink}`

type Link = {
  name: string

  link?: string
  icon?: string
  hasAlert?: boolean
  menu?: string
  links?: Link[]
}

const MenuPage = (): ReactNode => {
  const location = useLocation()
  const params = useParams()
  const { t } = useTranslation()
  const client = useApolloClient()

  const config = useContext(ConfigContext)
  const { urlFrag, instanceName } = config

  // TO DO - this should be in a more generic place than the menu
  const { loading, error, data } = useQuery(CURRENT_USER)

  if (loading) return null

  // @ts-ignore
  const currentUser = data?.currentUser

  // @ts-ignore
  const hasAlert = data?.userHasTaskAlerts

  let notice = ''

  // @ts-ignore
  if (error || !data?.currentUser) {
    // @ts-ignore
    if (error?.networkError) {
      notice = 'You are offline.'
    } else {
      if (localStorage.getItem('token') !== null) {
        localStorage.removeItem('token')
      }

      client.cache.reset()

      localStorage.setItem('intendedPage', location.pathname + location.search)
      const redirectlocation = `${urlFrag}/login`
      return <Navigate replace to={redirectlocation} />
    }
  }

  const submissionFormBuilderLink = `${urlFrag}/admin/submission-form-builder`
  const reviewFormBuilderLink = `${urlFrag}/admin/review-form-builder`
  const decisionFormBuilderLink = `${urlFrag}/admin/decision-form-builder`
  const configurationLink = `${urlFrag}/admin/configuration`
  const manuscriptsLink = `${urlFrag}/admin/manuscripts`
  const userAdminLink = `${urlFrag}/admin/users`
  const tasksTemplateLink = `${urlFrag}/admin/tasks`
  const CMSPagesPageLink = `${urlFrag}/admin/cms/pages`
  const CMSLayoutPageLink = `${urlFrag}/admin/cms/layout`
  const CMSArticlePageLink = `${urlFrag}/admin/cms/article`
  const CMSFileBrowserLink = `${urlFrag}/admin/cms/filebrowser`
  const CMSMetadataPageLink = `${urlFrag}/admin/cms/metadata`
  const CMSPublishingCollectionPageLink = `${urlFrag}/admin/cms/collections`
  const profileLink = `${urlFrag}/profile`
  const reportsLink = `${urlFrag}/admin/reports`
  const homeLink = `${urlFrag}/dashboard`

  const showLinks = location.pathname.match(/^\/(submit|manuscript)/g)

  const isUser = currentUser?.groupRoles?.includes('user')
  const isGroupManager = currentUser?.groupRoles?.includes('groupManager')
  const isGroupAdmin = currentUser?.groupRoles?.includes('groupAdmin')
  const isAdmin = currentUser?.globalRoles?.includes('admin')

  let links: Link[] = []

  if (showLinks) {
    const baseLink = `${urlFrag}/versions/${params.version}`
    const submitLink = `${baseLink}/submit`
    const manuscriptLink = `${baseLink}/manuscript`

    links = [
      { link: submitLink, name: t('leftMenu.Summary Info') },
      {
        link: manuscriptLink,
        name: t('leftMenu.Manuscript'),
      },
    ]
  }

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

  return (
    <Menu
      navLinkComponents={links}
      notice={notice}
      profileLink={profileLink}
      user={currentUser}
    />
  )
}

export default MenuPage
