/* eslint-disable react/prop-types */

/* stylelint-disable declaration-block-no-redundant-longhand-properties */

import { useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../../pubsweet'
import { SectionHeader, SectionRow } from '../../../shared'
import { UserAction } from '../../../component-manuscripts-table/src/style'
import DeclinedReviewer from './DeclinedReviewer'

const DropdownTitleContainer = styled.div`
  cursor: pointer;
  display: flex;
  font-size: 18px;
  place-content: center space-between;
`

const DeclinedReviewerContainer = styled.div`
  background-color: #f8f8f9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 1em;
`

const AddBorder = styled.div`
  :not(:last-child) {
    border-bottom: 0.8px solid #bfbfbf;
  }
`

const ReviewersDeclined = ({ members }) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const declinations = members.filter(user => {
    return user.status === 'rejected' // internal name for "Declined"
  })

  return (
    <>
      <SectionHeader onClick={() => setOpen(!open)}>
        <DropdownTitleContainer>
          <UserAction>
            {open
              ? t('decisionPage.Hide Declined')
              : t('decisionPage.See Declined', { count: declinations.length })}
          </UserAction>
          <Icon color="#9e9e9e">{open ? 'chevron-up' : 'chevron-down'}</Icon>
        </DropdownTitleContainer>
      </SectionHeader>

      {open &&
        (declinations && declinations.length > 0 ? (
          <DeclinedReviewerContainer>
            {declinations.map(declined => {
              return (
                <AddBorder key={declined.id}>
                  <DeclinedReviewer declined={declined} />
                </AddBorder>
              )
            })}
          </DeclinedReviewerContainer>
        ) : (
          <SectionRow>{t('decisionPage.No Declined Reviewers')}</SectionRow>
        ))}
    </>
  )
}

export default ReviewersDeclined
