/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { th } from '@coko/client'
import { useTranslation } from 'react-i18next'
import SimpleWaxEditor from '../../../wax-collab/src/SimpleWaxEditor'
import { Icon, Action, LooseRow, LabelBadge } from '../../../shared'

const DetailPane = styled.div`
  background: ${th('colorSecondaryBackground')};
  border: 1px solid ${th('colorFurniture')};
  border-radius: ${th('borderRadius')};
  margin-bottom: 8px;
  padding: 8px;

  & > h2 {
    font-size: ${th('fontSizeHeading5')};
    font-weight: bold;
    margin-right: 1em;
  }
`

const RightLooseRow = styled(LooseRow)`
  float: right;
  width: unset;
`

const FormSummary = ({ form, isActive, openFormSettingsDialog }) => {
  const { t } = useTranslation()
  return (
    <DetailPane>
      <RightLooseRow>
        {isActive && (
          <LabelBadge color={th('colorPrimary')}>
            {t('formBuilder.Active')}
          </LabelBadge>
        )}
        <Action
          onClick={openFormSettingsDialog}
          title={t('formBuilder.Edit form settings')}
        >
          <Icon noPadding>settings</Icon>
        </Action>
      </RightLooseRow>
      <h2>{form.structure.name}</h2>
      <SimpleWaxEditor
        key={form.structure.description}
        readonly
        value={form.structure.description}
      />
    </DetailPane>
  )
}

export default FormSummary
