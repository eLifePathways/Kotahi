import { gql } from '@apollo/client'

const GET_VARIABLES = gql`
  query GetVariables($groupId: ID!) {
    getVariables(groupId: $groupId) {
      label
      value
      type
      form
    }
  }
`

export default GET_VARIABLES
