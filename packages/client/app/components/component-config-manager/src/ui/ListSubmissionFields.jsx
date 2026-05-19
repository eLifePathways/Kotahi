/* eslint-disable react/prop-types */

import CreatableSelect from 'react-select/creatable'

import styled from 'styled-components'
// import { useTranslation } from 'react-i18next'

const SelectWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  > div {
    flex-grow: 1;
  }

  > div > div {
    border-radius: 4px 0 0 4px;
  }

  > button {
    border-radius: 0 6px 6px 0;
    min-height: 34px;
  }
`

const ListSubmissionFields = ({ submissionOptions, value, onChange }) => (
  <SelectWrapper>
    <CreatableSelect
      isMulti
      menuPortalTarget={document.body}
      menuPosition="absolute"
      onChange={onChange}
      options={submissionOptions}
      placeholder="Select submission fields..."
      value={value}
    />
  </SelectWrapper>
)

export default ListSubmissionFields
