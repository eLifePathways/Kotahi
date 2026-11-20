/* eslint-disable react/prop-types */
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import BlockElement from './BlockElement'

const GroupName = styled.div`
  font-size: 14px;
  margin-bottom: 4px;
  text-transform: uppercase;
`

const ListWrapper = styled.div`
  > div:not(:last-child) {
    margin-bottom: 4px;
  }
`

const BlockElementGroup = ({ groupName, items, view }) => {
  const { t, i18n } = useTranslation()

  const translatedLabel = (translation, defaultLabel) => {
    return !isEmpty(i18n) && i18n.exists(translation)
      ? t(translation)
      : defaultLabel
  }

  return (
    <>
      <GroupName>
        {translatedLabel(`Wax.Various.${groupName}`, groupName)}
      </GroupName>
      <ListWrapper>
        {items &&
          items.map(item => (
            <BlockElement item={item} key={item.name} view={view} />
          ))}
      </ListWrapper>
    </>
  )
}

export default BlockElementGroup
