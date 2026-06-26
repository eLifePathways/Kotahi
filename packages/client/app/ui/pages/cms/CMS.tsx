import { type ReactNode } from 'react'
import { useParams } from 'react-router-dom'

import CardGrid from '../../shared/CardGrid'

const CMS = (): ReactNode => {
  const { groupName } = useParams()

  return (
    <CardGrid
      items={[
        {
          title: 'Pages',
          description:
            'Manage what pages are available on your published website.',
          url: `/${groupName}/admin/cms/pages`,
          key: 'pages',
        },
        {
          title: 'Layout',
          description: "Control your website's colors, footer, logo and more.",
          url: `/${groupName}/admin/cms/layout`,
          key: 'layout',
        },
        {
          title: 'Article Template',
          description:
            'Control the strucure, styles and assets of the published article page.',
          url: `/${groupName}/admin/cms/article`,
          key: 'article',
        },
        {
          title: 'Publication Metadata',
          description:
            'Manage your journal name, ISSNs and contact information.',
          url: `/${groupName}/admin/cms/metadata`,
          key: 'metadata',
        },
        {
          title: 'File Browser',
          description:
            'View and edit all the files that will be included in your published website.',
          url: `/${groupName}/admin/cms/filebrowser`,
          key: 'filebrowser',
        },
        {
          title: 'Collections',
          description: 'Manage collections of articles.',
          url: `/${groupName}/admin/cms/collections`,
          key: 'collections',
        },
      ]}
    />
  )
}

export default CMS
