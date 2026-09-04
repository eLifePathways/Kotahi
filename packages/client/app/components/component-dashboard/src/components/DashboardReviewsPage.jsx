/* eslint-disable react-hooks/exhaustive-deps */

import { useMutation } from '@apollo/client/react'
import { useEffect, useContext } from 'react'
import { ConfigContext } from '../../../config/src'
import { UPDATE_TAB } from '../../../../queries'
import ReviewerTable from './sections/ReviewerTable'

const DashboardReviewsPage = () => {
  const config = useContext(ConfigContext)

  const [updateTab] = useMutation(UPDATE_TAB)

  useEffect(() => {
    updateTab({
      variables: {
        tab: 'reviews',
      },
    })
  }, [])

  const showReviews = config?.dashboard?.showSections?.includes('review')

  if (!showReviews) return null

  return <ReviewerTable />
}

export default DashboardReviewsPage
