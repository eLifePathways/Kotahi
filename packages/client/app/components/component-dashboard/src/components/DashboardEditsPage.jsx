/* eslint-disable react-hooks/exhaustive-deps */

import { useMutation } from '@apollo/client/react'
import { useEffect } from 'react'

import { UPDATE_TAB } from '../../../../queries'
import EditorTable from './sections/EditorTable'

const DashboardEditsPage = () => {
  const [updateTab] = useMutation(UPDATE_TAB)

  useEffect(() => {
    updateTab({
      variables: {
        tab: 'edits',
      },
    })
  }, [])

  return <EditorTable />
}

export default DashboardEditsPage
