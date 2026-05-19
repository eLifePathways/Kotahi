/* eslint-disable react/prop-types */

import PropTypes from 'prop-types'
import styled from 'styled-components'
import { sanitize } from 'isomorphic-dompurify'
import { unescape } from 'lodash'
import { th } from '@coko/client'
import { useTranslation } from 'react-i18next'
import { PlainButton } from '../../../pubsweet'
import { Heading1 } from '../style'
import { ActionButton } from '../../../shared'

const Wrapper = styled.div`
  background: ${th('colorBackground')};
  color: ${th('colorText')};
  line-height: ${th('lineHeightBase')};
  max-height: 100%;
  max-width: 60em;
  overflow-y: auto;
  padding: calc(${th('gridUnit')} * 6);
`

const Paragraph = styled.p`
  font-size: ${th('fontSizeBase')};
  margin-bottom: calc(${th('gridUnit')} * 3);
  width: 100%;
`

const Divider = styled.span`
  margin: 0 ${th('gridUnit')};
`

const createMarkup = encodedHtml => ({
  __html: sanitize(unescape(encodedHtml)),
})

const Confirm = ({ toggleConfirming, form, isSubmitting, submit, errors }) => {
  const { t } = useTranslation()
  return (
    <Wrapper>
      <article>
        {Object.keys(errors).length > 0 ? (
          <>
            <Heading1>
              {t('manuscriptSubmit.Errors in your submission')}
            </Heading1>
            <Paragraph>
              {t('manuscriptSubmit.errorsList')} {JSON.stringify(errors)}
            </Paragraph>
          </>
        ) : (
          <>
            <Heading1 dangerouslySetInnerHTML={createMarkup(form.popuptitle)} />
            <Paragraph
              dangerouslySetInnerHTML={createMarkup(form.popupdescription)}
            />
            <ActionButton
              dataTestid="confirm-submit"
              onClick={submit}
              primary
              status={isSubmitting ? 'pending' : null}
              type="submit"
            >
              {t('manuscriptSubmit.Submit')}
            </ActionButton>
            <Divider> {t('manuscriptSubmit.or')} </Divider>
          </>
        )}
        <PlainButton onClick={toggleConfirming}>
          {t('manuscriptSubmit.get back to your submission')}
        </PlainButton>
      </article>
    </Wrapper>
  )
}

Confirm.propTypes = {
  toggleConfirming: PropTypes.func.isRequired,
  form: PropTypes.shape({
    popuptitle: PropTypes.string.isRequired,
    popupdescription: PropTypes.string.isRequired,
  }).isRequired,
  submit: PropTypes.func.isRequired,
  errors: PropTypes.objectOf(PropTypes.any).isRequired,
}

export default Confirm
