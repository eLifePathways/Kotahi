/* eslint-disable react/prop-types */

import { useState, useContext } from 'react'
import { Redirect } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Field, Formik } from 'formik'

import { Button, Checkbox, Spinner, TextArea } from '../../../pubsweet'
import { ADD_EMAIL_TO_BLACKLIST } from '../../../../queries/index'
import {
  UPDATE_INVITATION_RESPONSE,
  UPDATE_INVITATION_STATUS,
  GET_INVITATION_STATUS,
  GET_LOGGED_IN_USER,
} from '../../../../queries/invitation'
import { ConfigContext } from '../../../config/src'

import {
  ButtonWrapper,
  Centered,
  DeclinedInfoString,
  FeedbackForm,
  FormInput,
  InvitationContainer,
  InvitationContent,
  SubmitFeedbackNote,
  ThankYouString,
} from '../style'

import AuthorsInput from '../../../component-submit/src/components/AuthorsInput'
import { validateAuthors } from '../../../../shared/authorsFieldDefinitions'
import { InvalidLabel, LinkAction } from '../../../shared'
import InvitationError from './InvitationError'

const SuggestedReviewersContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  margin: 7px auto;
  width: 100%;

  > div > div {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
  }
`

const SuggestedReviewersScrollable = styled.div`
  max-height: 256px;
  overflow-y: scroll;
  width: 100%;
`

const SuggestedReviewersSectionLabel = styled.h4`
  font-weight: bold;
  margin-bottom: 5px;
`

const StyledFormInput = styled(FormInput)`
  label > span {
    color: #666;
    font-size: 16px;
    font-weight: 500;
  }
`

const DeclineArticleOwnershipPage = ({ match }) => {
  const [isFormSubmitted, setIsFormSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const config = useContext(ConfigContext)
  const { invitationId } = match.params

  const { data, loading } = useQuery(GET_INVITATION_STATUS, {
    variables: { id: invitationId },
    onError: () => {
      setErrorMessage('invalidInviteId')
    },
  })

  const { data: loggedInUserData, loading: loggedInUserLoading } =
    useQuery(GET_LOGGED_IN_USER)

  const loggedInUserId = loggedInUserData?.currentUser?.id

  const { t } = useTranslation()

  const [updateInvitationStatus] = useMutation(UPDATE_INVITATION_STATUS, {
    onCompleted: () => {
      localStorage.removeItem('invitationId')
      localStorage.removeItem('inviteAction')
    },
  })

  const [addEmailToBlacklist] = useMutation(ADD_EMAIL_TO_BLACKLIST, {
    onCompleted: () => {
      setIsFormSubmitted(true)
    },
  })

  const [updateInvitationResponse] = useMutation(UPDATE_INVITATION_RESPONSE, {
    onCompleted: blacklistData => {
      // TODO It would be cleaner and safer to have this logic in the server, rather than allowing the client to initiate these actions.
      if (
        blacklistData.updateInvitationResponse.declinedReason ===
        'DO_NOT_CONTACT'
      ) {
        addEmailToBlacklist({
          variables: {
            email: blacklistData.updateInvitationResponse.toEmail,
            groupId: config.groupId,
          },
        })
      } else {
        setIsFormSubmitted(true)
      }
    },
  })

  const handleDeclineAction = ({
    feedbackComment,
    doNotContact,
    suggestedReviewers,
  }) => {
    if (data && data.invitationStatus.status === 'UNANSWERED') {
      updateInvitationStatus({
        variables: {
          id: invitationId,
          status: 'REJECTED',
          responseDate: new Date(),
        },
      })
    }

    updateInvitationResponse({
      variables: {
        id: invitationId,
        responseComment: feedbackComment,
        declinedReason: doNotContact ? 'DO_NOT_CONTACT' : null,
        suggestedReviewers: suggestedReviewers.map(reviewer => ({
          firstName: reviewer.firstName,
          lastName: reviewer.lastName,
          email: reviewer.email,
          affiliation: reviewer.ror?.label,
        })),
      },
    })
  }

  if (isFormSubmitted) {
    return (
      <InvitationContainer>
        <Centered>
          <InvitationContent>
            <img
              alt={config?.groupIdentity?.brandName}
              src={
                config?.logo?.storedObjects[0].url ||
                config?.groupIdentity?.logoPath
              }
            />
            <ThankYouString>{t('declineReviewPage.thanks')}</ThankYouString>
          </InvitationContent>
        </Centered>
      </InvitationContainer>
    )
  }

  if (loading || loggedInUserLoading) return <Spinner />

  if (errorMessage) {
    localStorage.removeItem('invitationId')
    localStorage.removeItem('inviteAction')
    return (
      <InvitationError
        errorHeading={t('invitationAcceptedPage.declineError')}
        errorMessage={t(`invitationAcceptedPage.${errorMessage}`)}
        link={
          loggedInUserId ? (
            <LinkAction to={`${config.urlFrag}/dashboard`}>
              {t('invitationAcceptedPage.returnToDashboard')}
            </LinkAction>
          ) : null
        }
      />
    )
  }

  const { userId: invitedUserId, status } = data.invitationStatus

  if (
    !loggedInUserLoading &&
    invitedUserId &&
    loggedInUserId !== invitedUserId
  ) {
    if (!loggedInUserId) {
      localStorage.setItem('inviteAction', 'decline')
      localStorage.setItem('invitationId', invitationId)
      return <Redirect to={`${config?.urlFrag}/login`} />
    }

    setErrorMessage('invalidUser')
  }

  if (status === 'REJECTED') {
    setErrorMessage('invitedAlreadyRejected')
  }

  if (status === 'ACCEPTED') {
    setErrorMessage('invitedAlreadyAccepted')
  }

  if (status === 'EXPIRED') {
    setErrorMessage('linkExpiredPage')
  }

  if (status === 'UNANSWERED') {
    return (
      <InvitationContainer>
        <Centered>
          <InvitationContent>
            <img
              alt={config?.groupIdentity?.brandName}
              src={
                config?.logo?.storedObjects[0].url ||
                config?.groupIdentity?.logoPath
              }
            />
            <Formik
              initialValues={{
                feedbackComment: '',
                suggestedReviewers: [],
                doNotContact: false,
              }}
              onSubmit={handleDeclineAction}
              validate={values => {
                const errors = {}

                const authorError = validateAuthors(values.suggestedReviewers, {
                  requireEmail: true,
                })

                if (authorError) {
                  errors.suggestedReviewers = authorError
                }

                return errors
              }}
            >
              {formikProps => {
                const {
                  values: { feedbackComment, suggestedReviewers, doNotContact },
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                  errors,
                } = formikProps

                return (
                  <form onSubmit={handleSubmit}>
                    <FeedbackForm>
                      <DeclinedInfoString>
                        {t('declineReviewPage.youHaveDeclined')}
                      </DeclinedInfoString>
                      <SubmitFeedbackNote>
                        {t('declineReviewPage.reason')}
                      </SubmitFeedbackNote>
                      <StyledFormInput>
                        <Field
                          as={TextArea}
                          id="feedbackComment"
                          name="feedbackComment"
                          onChange={handleChange}
                          placeholder={t('declineReviewPage.messageHere')}
                          rows={4}
                          value={feedbackComment}
                        />
                        <SuggestedReviewersContainer>
                          <SuggestedReviewersSectionLabel>
                            {t('declineReviewPage.suggestedReviewers')}
                          </SuggestedReviewersSectionLabel>
                          <SuggestedReviewersScrollable>
                            <AuthorsInput
                              {...formikProps}
                              fullWidth
                              onChange={newReviewers => {
                                setFieldValue(
                                  'suggestedReviewers',
                                  newReviewers,
                                )
                              }}
                              overrideButtonLabel="Add Suggested Reviewer"
                              requireEmail
                              rorMenuPlacement="top"
                              value={suggestedReviewers}
                            />
                          </SuggestedReviewersScrollable>
                          {errors.suggestedReviewers && (
                            <InvalidLabel>
                              {t('declineReviewPage.invalidReviewers')}
                            </InvalidLabel>
                          )}
                        </SuggestedReviewersContainer>
                        <Field
                          as={Checkbox}
                          checked={doNotContact}
                          id="doNotContact"
                          label={t('declineReviewPage.dontWantContact')}
                          name="doNotContact"
                          onChange={handleChange}
                        />
                      </StyledFormInput>
                      <ButtonWrapper>
                        <Button primary type="submit">
                          {t('declineReviewPage.Decline Invitation')}
                        </Button>
                      </ButtonWrapper>
                    </FeedbackForm>
                  </form>
                )
              }}
            </Formik>
          </InvitationContent>
        </Centered>
      </InvitationContainer>
    )
  }

  return <Spinner />
}

export default DeclineArticleOwnershipPage
