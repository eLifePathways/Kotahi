/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps, react-hooks/use-memo */
/* eslint-disable react/prop-types */
/* eslint-disable new-cap */

/* stylelint-disable alpha-value-notation, color-function-notation */

import { useCallback, useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Formik, ErrorMessage } from 'formik'
import { unescape, get, set, debounce } from 'lodash'
import { sanitize } from 'isomorphic-dompurify'
import { th } from '@coko/client'
import { useTranslation } from 'react-i18next'

import {
  ColorBadge,
  Section as Container,
  Select,
  FilesUpload,
  Attachment,
  FieldPublishingSelector,
  TextInput,
  Divider,
  CheckboxGroup,
  RichTextEditor,
  RadioGroup,
  DatePicker,
} from '../../../shared'
import {
  FullWaxField,
  CollaborativeTextField,
} from '../../../component-formbuilder/src/components/builderComponents'
import FormCollaborateWax from '../../../component-formbuilder/src/components/FormCollaborativeWax'
import { Heading1, Section, Legend, SubNote } from '../style'
import AuthorsInput from './AuthorsInput'
import LocalContext from './LocalContext'
import DoisInput from './MultipleDoi'
import LinksInput from './LinksInput'
import ValidatedFieldFormik from './ValidatedField'
import Confirm from './Confirm'
import { articleStatuses } from '../../../../globals'
import { validateFormField } from '../../../../shared/formValidation'
import ThreadedDiscussion from '../../../component-formbuilder/src/components/builderComponents/ThreadedDiscussion/ThreadedDiscussion'
import ActionButton from '../../../shared/ActionButton'
import { hasValue } from '../../../../shared/htmlUtils'
import { ConfigContext } from '../../../config/src'
import Modal from '../../../component-modal/src/Modal'
import PublishingResponse from '../../../component-review/src/components/publishing/PublishingResponse'

const FormContainer = styled(Container)`
  background: white;
  padding: 0;

  header {
    border-bottom: 1px solid #e8e8e8;
    display: ${({ noHeader }) => (noHeader ? 'none' : 'flex')};
    flex-direction: column;
    justify-content: center;
    /* account for <NoteRight> */
    padding: 28px 28px 44px;

    h1 {
      font-weight: 700;
      margin: 0;
      padding: 0;
    }
  }

  form {
    padding: ${({ noPadding }) => (noPadding ? 0 : '30px')};

    section {
      margin: 0 0 44px;
    }
  }
`

const Intro = styled.div`
  line-height: 1.4;

  p {
    margin: 0;
  }
`

const ModalWrapper = styled.div`
  align-items: center;
  background: rgb(255 255 255 / 95%);
  display: flex;
  inset: 0;
  justify-content: center;
  position: fixed;
  z-index: 10000;
`

const MessageWrapper = styled.div`
  color: ${th('colorError')};
  display: flex;
  font-family: ${th('fontInterface')};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
  margin-left: 12px;
  margin-top: -${({ theme }) => theme.spacing[1]}px;
`

const SafeRadioGroup = styled(RadioGroup)`
  position: relative;
`

const NoteRight = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
  padding: ${({ theme }) => `${theme.spacing.e} ${theme.spacing.f}`};
  text-align: right;
`

const FieldHead = styled.div`
  align-items: baseline;
  display: flex;
  width: auto;

  & > label {
    /* this is to make "publish" on decision page go flush right */
    margin-left: auto;
  }
`

const CollaborativeBadge = styled.div`
  flex-basis: 100%;
  padding-top: 10px;
`

const filterFileManuscript = files =>
  files.filter(file => file.tags.includes('manuscript'))

/** Definitions for available field types */
const elements = {
  Title: TextInput,
  Authors: AuthorsInput,
  Abstract: RichTextEditor,
  Keywords: TextInput,
  TextField: TextInput,
  FullWaxField,
  AbstractEditor: RichTextEditor,
  RadioGroup: SafeRadioGroup,
  CheckboxGroup,
  AuthorsInput,
  LocalContext,
  DoisInput,
  Select,
  Divider,
  LinksInput,
  ThreadedDiscussion,
  DatePicker,
}

const collaborativeElements = {
  ...elements,
  Abstract: FormCollaborateWax(RichTextEditor),
  AbstractEditor: FormCollaborateWax(RichTextEditor),
  FullWaxField: FormCollaborateWax(FullWaxField),
  TextField: CollaborativeTextField,
}

/** Shallow clone props, leaving out all specified keys, and also stripping all keys with (string) value 'false'. */
const rejectProps = (obj, keys) =>
  Object.keys(obj)
    .filter(k => !keys.includes(k))
    .map(k => ({ [k]: obj[k] }))
    .reduce(
      (res, o) =>
        Object.values(o).includes('false') ? { ...res } : Object.assign(res, o),
      {},
    )

const link = (urlFrag, manuscriptId) =>
  String.raw`<a href=${urlFrag}/versions/${manuscriptId}/manuscript>view here</a>`

const createMarkup = encodedHtml => ({
  __html: sanitize(unescape(encodedHtml)),
})

/** Rename some props so the various formik components can understand them */
const prepareFieldProps = rawField => ({
  ...rawField,
  options:
    rawField.options &&
    rawField.options.map(e => ({ ...e, color: e.labelColor })),
})

// This is not being kept as state because we need to access it
// outside of the render thread. This is a global variable, NOT
// per component, but that's OK for our purposes.
let lastChangedField = null

const FormTemplate = ({
  form,
  formikOptions,
  initialValues,
  manuscriptId,
  manuscriptShortId,
  // manuscriptStatus,
  submissionButtonText,
  onChange,
  republish,
  onSubmit,
  showEditorOnlyFields,
  urlFrag,
  displayShortIdAsIdentifier,
  validateDoi,
  validateSuffix,
  validationOrcid,
  createFile,
  deleteFile,
  isSubmission,
  isCollaborative,
  reviewId,
  shouldStoreFilesInForm,
  initializeReview,
  tagForFiles,
  noPadding,
  noHeader,
  threadedDiscussionProps: tdProps,
  fieldsToPublish,
  setShouldPublishField,
  shouldShowOptionToPublish = false,
  collaborativeObject,
}) => {
  const config = useContext(ConfigContext)
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const toggleConfirming = () => {
    setConfirming(confirm => !confirm)
  }

  const sumbitPendingThreadedDiscussionComments = async values => {
    await Promise.all(
      form.children
        .filter(field => field.component === 'ThreadedDiscussion')
        .map(field => get(values, field.name))
        .filter(Boolean)
        .map(async threadedDiscussionId =>
          tdProps.completeComments({
            variables: { threadedDiscussionId },
          }),
        ),
    )
  }

  const createBlankSubmissionBasedOnForm = value => {
    const allBlankedFields = {}
    const fieldNames = value.children.map(field => field.name)
    fieldNames.forEach(fieldName => set(allBlankedFields, fieldName, ''))
    return allBlankedFields
  }

  const initialValuesWithDummyValues = {
    ...createBlankSubmissionBasedOnForm(form),
    ...initialValues,
  }

  const debounceChange = useCallback(
    debounce(
      onChange
        ? (...params) => {
            onChange(...params)
          }
        : () => {},
      1000,
    ),
    [],
  )

  useEffect(() => debounceChange.flush, [])

  const handleSubmitForm = async (values, actions) => {
    setSubmitting(true)
    await sumbitPendingThreadedDiscussionComments(values)

    if (onSubmit) {
      await onSubmit(values, actions)
      setSubmitting(false)
    }
  }

  return (
    <Formik
      displayName={form.name}
      initialValues={initialValuesWithDummyValues}
      onSubmit={handleSubmitForm}
      validateOnBlur
      validateOnChange={false}
      {...formikOptions}
    >
      {({
        handleSubmit,
        setTouched,
        values,
        setFieldValue,
        errors,
        validateForm,
        isSubmitting,
        submitCount,
      }) => {
        const innerOnChange = (value, fieldName) => {
          if (fieldName !== lastChangedField) {
            debounceChange.flush()
            lastChangedField = fieldName
          }

          debounceChange(value, fieldName)
        }

        const [submitSucceeded, setSubmitSucceeded] = useState(false)
        const [buttonIsPending, setButtonIsPending] = useState(false)
        const [publishingResponse, setPublishingResponse] = useState([])
        const { t } = useTranslation()

        const [publishErrorsModalIsOpen, setPublishErrorsModalIsOpen] =
          useState(false)

        const submitButton = (text, haspopup = false) => {
          return (
            <div>
              <ActionButton
                dataTestid={`${form.name
                  ?.toLowerCase()
                  .replace(/ /g, '-')
                  .replace(/[^\w-]+/g, '')}-action-btn`}
                onClick={async () => {
                  setButtonIsPending(true)

                  const hasErrors =
                    Object.keys(await validateForm()).length !== 0

                  // If there are errors, do a fake submit
                  // to focus on the error
                  if (
                    hasErrors ||
                    values.status === articleStatuses.evaluated ||
                    values.status === articleStatuses.submitted ||
                    !haspopup
                  ) {
                    await handleSubmit()
                    setSubmitSucceeded(!hasErrors)
                  } else {
                    toggleConfirming()
                  }

                  if (!hasErrors && republish) {
                    const response = (await republish(
                      manuscriptId,
                      config.groupId,
                    )) || {
                      steps: [],
                    }

                    setPublishingResponse(response)
                    if (response.steps.some(step => !step.succeeded))
                      setPublishErrorsModalIsOpen(true)
                  }

                  setButtonIsPending(false)
                }}
                primary
                status={
                  /* eslint-disable no-nested-ternary */
                  buttonIsPending || isSubmitting
                    ? 'pending'
                    : publishingResponse?.steps?.some(step => !step.succeeded)
                      ? 'failure'
                      : Object.keys(errors).length && submitCount
                        ? 'failure' // TODO Make this case 'failure', once we've fixed the validation delays in the form
                        : submitSucceeded
                          ? 'success'
                          : ''
                  /* eslint-enable no-nested-ternary */
                }
              >
                {text}
              </ActionButton>
            </div>
          )
        }

        // this is whether the form includes a popup
        const hasPopup = form.haspopup ? JSON.parse(form.haspopup) : false

        // this is whether to show a popup
        const showPopup = hasPopup && values.status !== 'revise'

        // this is whether or not to show a submit button

        let showSubmitButton = !isCollaborative

        showSubmitButton =
          showSubmitButton &&
          submissionButtonText &&
          (isSubmission
            ? !['submitted', 'revise'].includes(values.status) ||
              (['preprint1', 'preprint2'].includes(config.instanceName) &&
                values.status === 'submitted')
            : true)

        const manuscriptFiles = filterFileManuscript(values.files || [])

        const submittedManuscriptFile =
          isSubmission && manuscriptFiles.length ? manuscriptFiles[0] : null

        return (
          <FormContainer noHeader={noHeader} noPadding={noPadding}>
            {displayShortIdAsIdentifier && (
              <NoteRight>
                {t('decisionPage.metadataTab.Manuscript Number')}{' '}
                {manuscriptShortId}
              </NoteRight>
            )}
            <header>
              <Heading1>{form.name}</Heading1>
              <Intro
                dangerouslySetInnerHTML={createMarkup(
                  (form.description || '').replace(
                    '###link###',
                    link(urlFrag, manuscriptId),
                  ),
                )}
              />
              {isCollaborative && (
                <CollaborativeBadge>
                  <ColorBadge color={config.groupIdentity.primaryColor}>
                    {t('reviewPage.isCollaborative')}
                  </ColorBadge>
                </CollaborativeBadge>
              )}
            </header>
            <form>
              {(form.children || [])
                .filter(
                  element =>
                    element.component &&
                    (showEditorOnlyFields ||
                      element.hideFromAuthors !== 'true'),
                )
                .map(element => {
                  if (isCollaborative && Array.isArray(element.validate)) {
                    // Filter Out when there is a collaborative form the required validation
                    const validate = element.validate.filter(
                      rule => rule.value !== 'required',
                    )

                    return { ...element, validate }
                  }

                  return element
                })
                .map(prepareFieldProps)
                .map(element => {
                  const disabledElement = element.isReadOnly === 'true'

                  let threadedDiscussionProps

                  if (element.component === 'ThreadedDiscussion') {
                    const setShouldPublishComment =
                      shouldShowOptionToPublish &&
                      element.permitPublishing === 'true' &&
                      ((id, val) =>
                        setShouldPublishField(`${element.name}:${id}`, val))

                    threadedDiscussionProps = {
                      ...tdProps,
                      threadedDiscussion: tdProps.threadedDiscussions.find(
                        d => d.id === values[element.name],
                      ),
                      threadedDiscussions: undefined,
                      commentsToPublish: fieldsToPublish
                        .filter(f => f.startsWith(`${element.name}:`))
                        .map(f => f.split(':')[1]),
                      setShouldPublishComment,
                      userCanAddThread: true,
                    }
                  }

                  let markup = createMarkup(element.title)

                  // add an '*' to the markup if it is marked required
                  if (Array.isArray(element.validate)) {
                    // element.validate can specify multiple validation functions; we're looking for 'required'
                    if (element.validate.some(v => v.value === 'required'))
                      markup = createMarkup(`${element.title} *`)
                  }

                  return (
                    <Section
                      cssOverrides={JSON.parse(element.sectioncss || '{}')}
                      key={`${element.id}`}
                    >
                      <FieldHead>
                        <Legend dangerouslySetInnerHTML={markup} />
                        {shouldShowOptionToPublish &&
                          element.permitPublishing === 'true' &&
                          element.component !== 'ThreadedDiscussion' && (
                            <FieldPublishingSelector
                              onChange={val =>
                                setShouldPublishField(element.name, val)
                              }
                              value={fieldsToPublish.includes(element.name)}
                            />
                          )}
                        <MessageWrapper>
                          <ErrorMessage name={element.name} />
                        </MessageWrapper>
                      </FieldHead>
                      {element.component === 'GenericFiles' && (
                        <FilesUpload
                          createFile={createFile}
                          deleteFile={deleteFile}
                          fieldName={
                            shouldStoreFilesInForm ? element.name : 'files'
                          } // TODO Store files in form for submissions too: should simplify code both frontend and back.
                          fileType={element.name}
                          formElementId={element.id}
                          initializeReview={initializeReview}
                          manuscriptId={manuscriptId}
                          onChange={
                            shouldStoreFilesInForm ? innerOnChange : null
                          }
                          reviewId={reviewId}
                          values={values}
                        />
                      )}
                      {element.component === 'SupplementaryFiles' && (
                        <FilesUpload
                          createFile={createFile}
                          deleteFile={deleteFile}
                          fieldName={
                            shouldStoreFilesInForm ? element.name : 'files'
                          } // TODO Store files in form for submissions too: should simplify code both frontend and back.
                          fileType={tagForFiles || 'supplementary'}
                          formElementId={element.id}
                          initializeReview={initializeReview}
                          manuscriptId={manuscriptId}
                          onChange={
                            shouldStoreFilesInForm ? innerOnChange : null
                          }
                          reviewId={reviewId}
                          values={values}
                        />
                      )}
                      {element.component === 'VisualAbstract' && (
                        <FilesUpload
                          acceptMultiple={false}
                          createFile={createFile}
                          deleteFile={deleteFile}
                          fieldName={
                            shouldStoreFilesInForm ? element.name : 'files'
                          }
                          fileType={tagForFiles || 'visualAbstract'}
                          formElementId={element.id}
                          initializeReview={initializeReview}
                          manuscriptId={manuscriptId}
                          mimeTypesToAccept="image/*"
                          onChange={
                            shouldStoreFilesInForm ? innerOnChange : null
                          }
                          reviewId={reviewId}
                          values={values}
                        />
                      )}
                      {element.component === 'ManuscriptFile' &&
                      submittedManuscriptFile ? (
                        <Attachment
                          file={submittedManuscriptFile}
                          key={submittedManuscriptFile.storedObjects[0].url}
                          uploaded
                        />
                      ) : null}
                      {![
                        'GenericFiles',
                        'SupplementaryFiles',
                        'VisualAbstract',
                        'ManuscriptFile',
                      ].includes(element.component) && (
                        <ValidatedFieldFormik
                          {...rejectProps(element, [
                            'component',
                            'title',
                            'sectioncss',
                            'parse',
                            'format',
                            'validate',
                            'validateValue',
                            'description',
                            'shortDescription',
                            'labelColor',
                          ])}
                          aria-label={element.placeholder || element.title}
                          collaborativeObject={collaborativeObject}
                          component={
                            isCollaborative
                              ? collaborativeElements[element.component]
                              : elements[element.component]
                          }
                          data-testid={element.name} // TODO: Improve this
                          disabled={disabledElement}
                          isClearable={
                            element.component === 'Select' &&
                            element.name === 'submission.$customStatus'
                          }
                          isRoRMulti={element.component === 'AuthorsInput'}
                          key={`validate-${element.id}`}
                          name={element.name}
                          onChange={value => {
                            // TODO: Perhaps split components remove conditions here
                            let val

                            if (value?.target) {
                              val = value.target.value
                            } else if (value?.value) {
                              val = value.value
                            } else {
                              val = value
                            }

                            setFieldValue(element.name, val, false)
                            innerOnChange(val, element.name)
                          }}
                          setTouched={setTouched}
                          shouldAllowFieldSpecChanges={[
                            'ThreadedDiscussion',
                          ].includes(element.component)}
                          showMiddleName={element.component === 'AuthorsInput'}
                          showOrcidId={element.component === 'AuthorsInput'}
                          spellCheck
                          threadedDiscussionProps={threadedDiscussionProps}
                          validate={validateFormField(
                            element.validate,
                            element.validateValue,
                            element.name,
                            JSON.parse(element.doiValidation || false),
                            JSON.parse(
                              element.doiUniqueSuffixValidation || false,
                            ),
                            validateDoi,
                            validateSuffix,
                            validationOrcid,
                            element.component,
                            threadedDiscussionProps,
                          )}
                          validationOrcid={validationOrcid}
                          values={values}
                        />
                      )}
                      {hasValue(element.description) && (
                        <SubNote
                          dangerouslySetInnerHTML={createMarkup(
                            element.description,
                          )}
                        />
                      )}
                    </Section>
                  )
                })}

              {showSubmitButton
                ? submitButton(submissionButtonText, showPopup)
                : null}

              {confirming && (
                <ModalWrapper>
                  <Confirm
                    errors={errors}
                    form={form}
                    isSubmitting={submitting}
                    submit={handleSubmit}
                    toggleConfirming={toggleConfirming}
                  />
                </ModalWrapper>
              )}
              <Modal
                isOpen={publishErrorsModalIsOpen}
                onClose={() => setPublishErrorsModalIsOpen(false)}
                subtitle={t(
                  'modals.publishError.Some targets failed to publish',
                )}
                title={t('modals.publishError.Publishing error')}
              >
                <PublishingResponse response={publishingResponse} />
              </Modal>
            </form>
          </FormContainer>
        )
      }}
    </Formik>
  )
}

FormTemplate.propTypes = {
  form: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    children: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        sectioncss: PropTypes.string,
        id: PropTypes.string.isRequired,
        component: PropTypes.string.isRequired,
        group: PropTypes.string,
        placeholder: PropTypes.string,
        validate: PropTypes.arrayOf(PropTypes.object.isRequired),
        validateValue: PropTypes.objectOf(
          PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        ),
        hideFromAuthors: PropTypes.string,
        readonly: PropTypes.bool,
      }).isRequired,
    ).isRequired,
    popuptitle: PropTypes.string,
    popupdescription: PropTypes.string,
    haspopup: PropTypes.string.isRequired, // bool as string
  }).isRequired,
  formikOptions: PropTypes.shape({
    enableReinitialize: PropTypes.bool,
  }),
  manuscriptId: PropTypes.string.isRequired,
  manuscriptShortId: PropTypes.number,
  manuscriptStatus: PropTypes.string,
  initialValues: PropTypes.shape({
    files: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        tags: PropTypes.arrayOf(PropTypes.string.isRequired),

        storedObjects: PropTypes.arrayOf(PropTypes.object),
      }).isRequired,
    ),
    status: PropTypes.string,
  }),
  isCollaborative: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  republish: PropTypes.func,
  submissionButtonText: PropTypes.string,
  showEditorOnlyFields: PropTypes.bool.isRequired,
  shouldStoreFilesInForm: PropTypes.bool,
  /** If supplied, any uploaded files will be tagged with this rather than 'supplementary' or 'visualAbstract' */
  tagForFiles: PropTypes.string,
  initializeReview: PropTypes.func,
}
FormTemplate.defaultProps = {
  isCollaborative: false,
  onSubmit: undefined,
  initialValues: null,
  republish: null,
  submissionButtonText: '',
  manuscriptStatus: null,
  manuscriptShortId: 1,
  shouldStoreFilesInForm: false,
  tagForFiles: null,
  initializeReview: null,
  formikOptions: {
    enableReinitialize: false,
  },
}

export default FormTemplate
