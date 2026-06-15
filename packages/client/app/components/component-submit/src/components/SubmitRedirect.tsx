import { type ReactNode, useContext } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'

import { ConfigContext } from '../../../config/src'
import SubmitPage from './SubmitPage'

const SubmitRedirect = (): ReactNode => {
  const location = useLocation()
  const { groupName, version } = useParams()
  const config = useContext(ConfigContext)

  const isPreprint = ['preprint1', 'preprint2'].includes(config.instanceName)
  const onEvaluation = location.pathname.endsWith('/evaluation')

  if (isPreprint && !onEvaluation) {
    return (
      <Navigate replace to={`/${groupName}/versions/${version}/evaluation`} />
    )
  }

  if (!isPreprint && onEvaluation) {
    return <Navigate replace to={`/${groupName}/versions/${version}/submit`} />
  }

  return <SubmitPage />
}

export default SubmitRedirect
