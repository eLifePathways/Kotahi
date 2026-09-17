import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { grid } from '@coko/client'

import useManuscriptsTable from '../../../../../pages/hooks/useManuscriptsTable'
import {
  SectionContent,
  SectionHeader,
  Title,
  CommsErrorBanner,
  Spinner,
} from '../../../../shared'
import ManuscriptsTable from '../../../../../ui/shared/ManuscriptsTable'

const TableWrapper = styled.div`
  padding: ${grid(3)} ${grid(2)};
`

const SubmissionsTable = () => {
  const { t } = useTranslation()
  const { loading, error, ...tableProps } = useManuscriptsTable('submitter')

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  return (
    <SectionContent>
      <SectionHeader>
        <Title>{t('dashboardPage.My Submissions')}</Title>
      </SectionHeader>

      <TableWrapper>
        <ManuscriptsTable {...tableProps} />
      </TableWrapper>
    </SectionContent>
  )
}

export default SubmissionsTable
