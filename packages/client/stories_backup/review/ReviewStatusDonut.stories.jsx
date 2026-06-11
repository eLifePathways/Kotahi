import ReviewStatusDonut from '../../app/components/component-manuscripts-table/src/cell-components/ReviewStatusDonut'
import {
  manuscriptWithoutTeams,
  manuscriptWithSeveralReviewers,
  manuscriptWithTeams,
} from '../common/fixtures'

export default {
  component: ReviewStatusDonut,
  title: 'Review Status Counts',
}

const Template = args => <ReviewStatusDonut {...args} />

export const Default = Template.bind({})
Default.args = {
  manuscript: manuscriptWithTeams,
}

export const WithoutReviews = Template.bind({})
WithoutReviews.args = {
  manuscript: manuscriptWithoutTeams,
}

export const MultipleReviews = Template.bind({})
MultipleReviews.args = {
  manuscript: manuscriptWithSeveralReviewers,
}
