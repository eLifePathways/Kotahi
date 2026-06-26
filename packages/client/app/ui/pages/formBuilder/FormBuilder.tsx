import { type ReactNode } from 'react'
import { useParams } from 'react-router-dom'

import CardGrid from '../../shared/CardGrid'

const FormBuilder = (): ReactNode => {
  const { groupName } = useParams()

  return (
    <CardGrid
      items={[
        {
          title: 'Submission Form',
          description:
            'Edit the form that authors will see when submitting a manuscript. Also affects the metadata fields available to editors and the data captured that will later be available for publishing.',
          url: `/${groupName}/admin/submission-form-builder`,
          key: 'submission',
        },
        {
          title: 'Review Form',
          description:
            'Edit the form that reviewers will see when submitting a review on a manuscript.',
          url: `/${groupName}/admin/review-form-builder`,
          key: 'review',
        },
        {
          title: 'Decision Form',
          description:
            'Edit the form that editors will see when making a decision on a manuscript.',
          url: `/${groupName}/admin/decision-form-builder`,
          key: 'decision',
        },
      ]}
    />
  )
}

export default FormBuilder
