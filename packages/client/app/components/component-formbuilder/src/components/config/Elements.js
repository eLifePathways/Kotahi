import i18next from 'i18next'
import { required } from '../../../../xpub-validators/src'

const hiddenfield = {
  component: 'Hidden',
}

const textfield = {
  component: 'TextField',
}

const showHideTextfield = (toggleShow, componentProps, additionalProps) => {
  const { isRequired, ...restAdditionalProps } = additionalProps
  return {
    component: 'TextFieldShowHide',
    props: {
      validate: isRequired ? required : null,
      toggleShow,
      ...componentProps,
    },
    ...restAdditionalProps,
  }
}

const optionfield = {
  component: 'OptionsField',
  defaultValue: [],
  props: {
    description: i18next.t('formBuilder.dropDownDescription'),
  },
}

const editorfield = {
  component: 'AbstractField',
  defaultValue: '',
}

const textarea = {
  component: 'TextArea',
  props: {
    cols: 55,
    rows: 5,
  },
}

const requiredTextField = {
  component: 'TextField',
  props: {
    validate: required,
  },
}

const requiredTextFieldWithDefault = defaultValue => ({
  component: 'TextField',
  props: {
    validate: required,
  },
  defaultValue,
})

const shortDescriptionField = {
  component: 'TextField',
  props: { label: 'Short title (optional — used in concise listings)' },
}

// Decision and Review:
// - Don't have meta, but a single jsonData that can accomodate everything
const nameFieldRegex = /^[a-zA-Z]\w*$/

const nameField = {
  component: 'TextField',
  props: {
    label: 'Name (internal field name)',
    validate: val => (nameFieldRegex.test(val) ? null : 'Invalid name'),
  },
}

const submissionNameFieldRegex = /^submission\.[a-zA-Z]\w*$/

const submissionNameField = {
  component: 'TextField',
  props: {
    label: 'Name (internal field name)',
    description: i18next.t('formBuilder.internalNameDescription'),
    validate: val =>
      submissionNameFieldRegex.test(val) ? null : 'Invalid name',
  },
}

const validateText = {
  component: 'Select',
  props: {
    isMulti: true,
    isClearable: true,
    label: 'Validation options',
    options: [
      {
        value: 'required',
        label: 'Required',
      },
      {
        value: 'minChars',
        label: 'Minimum characters',
      },
      {
        value: 'maxChars',
        label: 'Maximum characters',
      },
    ],
  },
}

const validateCollection = {
  component: 'Select',
  props: {
    isMulti: true,
    isClearable: true,
    label: 'Validation options',
    options: [
      {
        value: 'required',
        label: 'Required',
      },
      {
        value: 'minSize',
        label: 'Minimum number of items',
      },
    ],
  },
}

const validateOther = {
  component: 'Select',
  props: {
    isMulti: true,
    isClearable: true,
    label: 'Validation options',
    options: [
      {
        value: 'required',
        label: 'Required',
      },
    ],
  },
}

const radiofield = {
  component: 'RadioBox',
  props: {
    inline: true,
    options: [
      {
        value: 'true',
        label: 'Yes',
      },
      {
        value: 'false',
        label: 'No',
      },
    ],
  },
  defaultValue: 'false',
}

const isReadOnlyField = {
  component: 'RadioBox',
  props: {
    inline: true,
    options: [
      {
        value: 'true',
        label: 'Yes',
      },
      {
        value: 'false',
        label: 'No',
      },
    ],
    label: 'Is read only?',
  },
  defaultValue: 'false',
}

const hideFromReviewersField = {
  component: 'RadioBox',
  props: {
    inline: true,
    options: [
      {
        value: 'true',
        label: 'Yes',
      },
      {
        value: 'false',
        label: 'No',
      },
    ],
    label: 'Hide from reviewers?',
  },
  defaultValue: 'false',
}

const hideFromAuthorsField = {
  component: 'RadioBox',
  props: {
    inline: true,
    options: [
      {
        value: 'true',
        label: 'Yes',
      },
      {
        value: 'false',
        label: 'No',
      },
    ],
    label: 'Hide from authors?',
  },
  defaultValue: 'false',
}

const permitPublishingField = {
  component: 'RadioBox',
  props: {
    options: [
      {
        value: 'false',
        label: 'Never',
      },
      {
        value: 'true',
        label: 'Ad hoc (Editor decides at time of sharing/publishing)',
      },
      {
        value: 'always',
        label: 'Always',
      },
    ],
    label: 'Include when sharing or publishing?',
  },
  defaultValue: 'false',
}

const showHideCredentials = formValues => {
  return formValues.uploadAttachmentSource === 'external'
}

const s3InputFields = {
  uploadAttachmentSource: {
    component: 'RadioBox',
    props: {
      inline: true,
      options: [
        {
          value: 'internal',
          label: 'Internal',
        },
        {
          value: 'external',
          label: 'External',
        },
      ],
      label: 'Select S3 Service',
      description: i18next.t('fields.uploadAttachmentSource.description'),
    },
    defaultValue: 'internal',
    showFieldTitle: true,
    title: i18next.t('fields.uploadAttachmentSource.title'),
  },
  s3Url: showHideTextfield(
    showHideCredentials,
    {},
    {
      title: i18next.t('fields.uploadAttachmentSource.s3Url'),
      showFieldTitle: true,
      isRequired: true,
    },
  ),
  s3Bucket: showHideTextfield(
    showHideCredentials,
    {
      validate: null,
    },
    {
      title: i18next.t('fields.uploadAttachmentSource.s3Bucket'),
      showFieldTitle: true,
      isRequired: true,
    },
  ),
  s3Region: showHideTextfield(
    showHideCredentials,
    {},
    {
      title: i18next.t('fields.uploadAttachmentSource.s3Region'),
      showFieldTitle: true,
      isRequired: true,
    },
  ),
  s3AccessToken: showHideTextfield(
    showHideCredentials,
    {
      placeholder: '*********',
    },
    {
      title: i18next.t('fields.uploadAttachmentSource.s3AccessToken'),
      showFieldTitle: true,
    },
  ),
  s3AccessId: showHideTextfield(
    showHideCredentials,
    {
      placeholder: '*********',
    },
    {
      title: i18next.t('fields.uploadAttachmentSource.s3AccessId'),
      showFieldTitle: true,
    },
  ),
}

const publishingTagField = {
  component: 'TextField',
  props: {
    label: 'Hypothesis tag',
    description:
      'You may specify a tag to use when sharing this field as a Hypothesis annotation.',
  },
}

const doiUniqueSuffixValidationField = {
  component: 'RadioBox',
  props: {
    inline: true,
    options: [
      {
        value: 'true',
        label: 'Yes',
      },
      {
        value: 'false',
        label: 'No',
      },
    ],
    label: 'Validate as a DOI suffix and ensure it is unique?',
  },
  defaultValue: 'false',
}

const presetTextField = name => ({
  component: 'Hidden',
  forcedValue: name,
})

const parseField = {
  component: 'Select',
  props: {
    label: 'Special parsing',
    options: [
      {
        value: 'false',
        label: 'None',
      },
      {
        value: 'split',
        label: 'Split at commas',
      },
    ],
  },
}

const formatField = {
  component: 'Select',
  props: {
    label: 'Special formatting',
    options: [
      {
        value: 'false',
        label: 'None',
      },
      {
        value: 'join',
        label: 'Join with commas',
      },
    ],
  },
}

const doiValidationField = {
  component: 'RadioBox',
  props: {
    inline: true,
    options: [
      {
        value: 'true',
        label: 'Yes',
      },
      {
        value: 'false',
        label: 'No',
      },
    ],
    label: 'Validate as a DOI?',
  },
  defaultValue: 'false',
}

const allowFutureDatesOnlyField = {
  component: 'RadioBox',
  props: {
    inline: true,
    options: [
      {
        value: 'true',
        label: 'Yes',
      },
      {
        value: 'false',
        label: 'No',
      },
    ],
    label: 'Allow to select future dates only?',
  },
  defaultValue: 'false',
}

const aiPromptField = {
  component: 'TextField',
  props: {
    label: 'AI prompt',
    description:
      'The prompt should be clear and specific so the AI understands what you want it to do.',
  },
}

const metadataMappingField = {
  component: 'TextField',
  props: {
    label: i18next.t('fields.metadataMapping.title'),
    description: i18next.t('fields.metadataMapping.description'),
  },
}

/** Most fields have at least these properties.
 * Components and fields can override these */
const prototypeComponent = category => ({
  id: hiddenfield,
  title: requiredTextField,
  name: category === 'submission' ? submissionNameField : nameField,
  shortDescription: shortDescriptionField,
  description: editorfield,
  validate: validateOther,
  hideFromAuthors: hideFromAuthorsField,
  isReadOnly: isReadOnlyField,
  hideFromReviewers: category === 'review' ? null : hideFromReviewersField,
  permitPublishing: permitPublishingField,
  publishingTag: publishingTagField,
  aiPrompt: aiPromptField,
  metadataMapping: category === 'submission' ? metadataMappingField : null,
})

/** All properties from all components must appear in this list,
 * which is used to establish correct order of display, and for
 * generating default properties for any field. The defaults for
 * a given field will contain all these properties, with properties
 * not used by the field set to null: this is to make Formik behave
 * nicely when we change field/component types and the form has to
 * be reorganised. */
const propertiesOrder = [
  'id',
  'title',
  'name',
  'options',
  'placeholder',
  'shortDescription',
  'description',
  'inline',
  'sectioncss',
  'validate',
  'parse',
  'format',
  'uploadAttachmentSource',
  's3Url',
  's3Bucket',
  's3Region',
  's3AccessId',
  's3AccessToken',
  'isReadOnly',
  'doiValidation', // TODO incorporate into validation
  'doiUniqueSuffixValidation', // TODO incorporate into validation
  'allowFutureDatesOnly',
  'hideFromAuthors',
  'hideFromReviewers',
  'permitPublishing',
  'publishingTag',
  'aiPrompt',
  'metadataMapping',
]

/** Component types refer to the React component used to represent the field
 * in a form.
 *
 * Every field type relies on an underlying component type, or in some cases,
 * a choice between multiple underlying component types (e.g., an Abstract
 * field could be represented by a Rich text component or a Text component).
 *
 * The properties for each of these component types override or extend those
 * given in {@link prototypeComponent}. Overriding with null removes the field.
 */
const getBaseComponentProperties = category => ({
  ManuscriptFile: {
    label: 'Attached manuscript',
    validate: null,
    permitPublishing: null,
    publishingTag: null,
  },
  SupplementaryFiles: {
    label: 'Attachments',
    publishingTag: null,
  },
  VisualAbstract: {
    label: 'Single image attachment',
    permitPublishing: null,
    publishingTag: null,
  },
  AuthorsInput: {
    label: 'List of contributors',
  },
  LinksInput: {
    label: 'List of links (URLs)',
    validate: validateCollection,
  },
  AbstractEditor: {
    label: 'Rich text',
    placeholder: textfield,
    validate: validateText,
  },
  ThreadedDiscussion: {
    label: 'Discussion',
  },
  TextField: {
    label: 'Text',
    placeholder: textfield,
    validate: validateText,
    parse: parseField,
    format: formatField,
    doiValidation: doiValidationField,
    doiUniqueSuffixValidation: doiUniqueSuffixValidationField,
  },
  Divider: {
    label: 'Text',
    description: hiddenfield,
    placeholder: hiddenfield,
    validate: hiddenfield,
    parse: hiddenfield,
    format: hiddenfield,
    doiValidation: hiddenfield,
    doiUniqueSuffixValidation: hiddenfield,
    hideFromAuthors: hiddenfield,
    hideFromReviewers: hiddenfield,
    permitPublishing: hiddenfield,
    shortDescription: hiddenfield,
    publishingTag: hiddenfield,
    aiPrompt: hiddenfield,
    metadataMapping: hiddenfield,
  },
  CheckboxGroup: {
    label: 'Checkboxes',
    options: optionfield,
    validate: validateCollection,
  },
  Select: {
    label: 'Dropdown selection',
    placeholder: textfield,
    options: optionfield,
  },
  RadioGroup: {
    label: 'Radio buttons',
    options: optionfield,
    inline: radiofield,
    sectioncss: textarea,
  },
  DatePicker: {
    label: 'Date Picker',
    allowFutureDatesOnly: allowFutureDatesOnlyField,
  },
})

/** Field types for free representation of arbitrary data, available in all forms.
 * Importantly, these field types allow users to choose the field name, rather
 * than imposing a preset name.
 *
 * Each of these generic field types corresponds to a single underlying component type.
 */
const genericFieldOptions = [
  { label: 'Text', isCustom: true, fieldType: 'text', component: 'TextField' },
  {
    label: 'Rich text',
    isCustom: true,
    fieldType: 'richText',
    component: 'AbstractEditor',
  },
  {
    label: 'Dropdown selection',
    isCustom: true,
    fieldType: 'select',
    component: 'Select',
  },
  {
    label: 'Element Divider',
    isCustom: true,
    fieldType: 'divider',
    component: 'Divider',
  },
  {
    label: 'Radio buttons',
    isCustom: true,
    fieldType: 'radioGroup',
    component: 'RadioGroup',
  },
  {
    label: 'Checkboxes',
    isCustom: true,
    fieldType: 'checkboxes',
    component: 'CheckboxGroup',
  },
  {
    label: 'List of contributors',
    isCustom: true,
    fieldType: 'contributors',
    component: 'AuthorsInput',
  },
  {
    label: 'List of links (URLs)',
    isCustom: true,
    fieldType: 'links',
    component: 'LinksInput',
  },
  {
    label: 'Date picker',
    isCustom: true,
    fieldType: 'datePicker',
    component: 'DatePicker',
  },
  {
    label: 'S3 Uploader',
    isCustom: true,
    fieldType: 's3Uploader',
    component: 'GenericFiles',
    isS3Component: true,
    ...s3InputFields,
  },
]

/** Field options for use in the submission form. Some are specialised, imposing
 * preset names so they can be used for domain-specific functionality such as
 * importing or exporting various types of standardised data. Some of the
 * specialised fields support more than one underlying component type. e.g.
 * Text or Rich text.
 */
const submissionFieldOptions = [
  {
    fieldType: 'title',
    label: 'Title',
    component: ['TextField', 'AbstractEditor'],
    title: requiredTextFieldWithDefault('Title'),
    name: presetTextField('submission.$title'),
    doiValidation: null,
    doiUniqueSuffixValidation: null,
    parse: null,
    format: null,
    permitPublishing: { ...permitPublishingField, defaultValue: 'always' },
  },
  {
    fieldType: 'authors',
    label: 'Authors',
    component: 'AuthorsInput',
    title: requiredTextFieldWithDefault('Authors'),
    name: presetTextField('submission.$authors'),
    permitPublishing: { ...permitPublishingField, defaultValue: 'always' },
  },
  {
    fieldType: 'localContext',
    label: 'LocalContext',
    component: 'LocalContext',
    title: requiredTextFieldWithDefault('Local Context'),
    name: presetTextField('submission.$localContext'),
    permitPublishing: { ...permitPublishingField, defaultValue: 'always' },
  },
  {
    fieldType: 'dois',
    label: 'Multiple DOIs',
    component: 'DoisInput',
    title: requiredTextFieldWithDefault('Multiple DOIs'),
    name: presetTextField('submission.$dois'),
    doiValidation: { ...doiValidationField, defaultValue: 'true' },
    doiUniqueSuffixValidation: null,
    parse: null,
    format: null,
    validate: validateOther,
    permitPublishing: { ...permitPublishingField, defaultValue: 'always' },
  },
  {
    fieldType: 'issueNumber',
    label: 'Issue Number',
    component: 'TextField',
    title: requiredTextFieldWithDefault('Issue Number'),
    name: presetTextField('submission.$issueNumber'),
    parse: null,
    format: null,
    permitPublishing: { ...permitPublishingField, defaultValue: 'always' },
  },
  {
    fieldType: 'volumeNumber',
    label: 'Volume Number',
    component: 'TextField',
    title: requiredTextFieldWithDefault('Volume Number'),
    name: presetTextField('submission.$volumeNumber'),
    parse: null,
    format: null,
    permitPublishing: { ...permitPublishingField, defaultValue: 'always' },
  },
  {
    fieldType: 'issueYear',
    label: 'Issue Year',
    component: 'TextField',
    title: requiredTextFieldWithDefault('Issue Year'),
    name: presetTextField('submission.$issueYear'),
    parse: null,
    format: null,
    permitPublishing: { ...permitPublishingField, defaultValue: 'always' },
  },
  {
    fieldType: 'abstract',
    label: 'Abstract',
    component: ['AbstractEditor', 'TextField'],
    title: requiredTextFieldWithDefault('Abstract'),
    name: presetTextField('submission.$abstract'),
    doiValidation: null,
    doiUniqueSuffixValidation: null,
    parse: null,
    format: null,
    permitPublishing: { ...permitPublishingField, defaultValue: 'always' },
  },
  {
    fieldType: 'visualAbstract',
    label: 'Visual abstract',
    component: 'VisualAbstract',
    title: requiredTextFieldWithDefault('Visual abstract'),
    name: presetTextField('visualAbstract'),
  },
  /* {
    fieldType: 'keywords',
    label: 'Keywords',
    component: 'TextField',
    title: requiredTextFieldWithDefault('Keywords'),
    name: presetTextField('submission.keywords'),
  }, */
  {
    fieldType: 'attachments',
    label: 'Attachments',
    component: 'SupplementaryFiles',
    title: requiredTextFieldWithDefault('Attachments'),
    name: presetTextField('fileName'),
    ...s3InputFields,
  },
  {
    fieldType: 'doi',
    label: 'DOI',
    component: 'TextField',
    title: requiredTextFieldWithDefault('DOI'),
    name: presetTextField('submission.$doi'),
    doiValidation: { ...doiValidationField, defaultValue: 'true' },
    doiUniqueSuffixValidation: null,
    parse: null,
    format: null,
    validate: validateOther,
    permitPublishing: { ...permitPublishingField, defaultValue: 'always' },
  },
  {
    fieldType: 'doiSuffix',
    label: 'DOI suffix',
    component: 'TextField',
    title: requiredTextFieldWithDefault('DOI suffix'),
    name: presetTextField('submission.$doiSuffix'),
    doiValidation: null,
    doiUniqueSuffixValidation: {
      ...doiUniqueSuffixValidationField,
      defaultValue: 'true',
    },
    parse: null,
    format: null,
  },
  {
    fieldType: 'sourceUri',
    label: 'Manuscript source URI',
    component: 'TextField',
    title: requiredTextFieldWithDefault('Manuscript source URI'),
    name: presetTextField('submission.$sourceUri'),
    doiValidation: null,
    doiUniqueSuffixValidation: null,
    parse: null,
    format: null,
  },
  {
    fieldType: 'customStatus',
    label: 'Custom status',
    component: ['Select', 'RadioGroup'],
    title: requiredTextFieldWithDefault('Label'),
    name: presetTextField('submission.$customStatus'),
    options: {
      ...optionfield,
      defaultValue: [
        {
          label: 'Ready to evaluate',
          value: 'readyToEvaluate',
          id: '90eeb071-b99c-482c-9b62-3ed3e98bd6e8',
        },
        {
          label: 'Evaluated',
          value: 'evaluated',
          id: 'e10b7c15-7c3d-4eb6-b490-6194003a87d8',
        },
        {
          label: 'Ready to publish',
          value: 'readyToPublish',
          id: '939e2f13-19ad-4c28-8a6a-142a97ddbbd2',
        },
      ],
      doiValidation: null,
      doiUniqueSuffixValidation: null,
    },
  },
  {
    fieldType: 'editDate',
    label: 'Last edit date — read-only',
    component: 'TextField',
    title: requiredTextFieldWithDefault('Last edit date'),
    name: presetTextField('submission.$editDate'),
    isReadOnly: 'true',
    placeholder: null,
    doiValidation: null,
    doiUniqueSuffixValidation: null,
    parse: null,
    format: null,
    validate: null,
  },
  {
    fieldType: 'attachedManuscript',
    label: 'Attached manuscript — read-only',
    component: 'ManuscriptFile',
    title: requiredTextFieldWithDefault('Attached manuscript'),
    name: presetTextField('manuscriptFile'),
    validate: null,
  },
  {
    fieldType: 'embargoDate',
    label: 'Embargo date',
    component: 'DatePicker',
    title: requiredTextFieldWithDefault('Embargo date'),
    name: presetTextField('submission.$embargoDate'),
    placeholder: null,
    doiValidation: null,
    doiUniqueSuffixValidation: null,
    parse: null,
    format: null,
    validate: validateOther,
  },
  ...genericFieldOptions,
]

/** Field options for use in the decision form, including specialised and
 * generic types.
 */
const decisionFieldOptions = [
  {
    fieldType: 'verdict',
    label: 'Verdict',
    component: ['RadioGroup', 'Select'],
    title: requiredTextFieldWithDefault('Decision'),
    name: presetTextField('$verdict'),
  },
  {
    isCustom: true,
    fieldType: 'discussion',
    label: 'Discussion',
    component: 'ThreadedDiscussion',
  },
  ...genericFieldOptions,
  {
    isCustom: true,
    fieldType: 'attachments',
    label: 'Attachments',
    component: 'SupplementaryFiles',
    ...s3InputFields,
  },
  {
    fieldType: 'doiSuffix',
    label: 'DOI suffix',
    component: 'TextField',
    title: requiredTextFieldWithDefault('DOI suffix'),
    name: presetTextField('$doiSuffix'),
    doiValidation: null,
    doiUniqueSuffixValidation: {
      ...doiUniqueSuffixValidationField,
      defaultValue: 'true',
    },
    parse: null,
    format: null,
  },
  {
    fieldType: 'coarEndorsement',
    label: 'Endorsement Statement',
    component: 'AbstractEditor',
    title: requiredTextFieldWithDefault('Endorsement Statement'),
    name: presetTextField('$coarEndorsement'),
  },
  {
    fieldType: 'coarLinkedResource',
    label: 'Linked Resource',
    component: 'TextField',
    title: requiredTextFieldWithDefault('Linked Resource'),
    name: presetTextField('$coarLinkedResource'),
  },
]

/** Field options for use in the review form, including specialised and
 * generic types.
 */
const reviewFieldOptions = [
  {
    fieldType: 'verdict',
    label: 'Verdict',
    component: ['RadioGroup', 'Select'],
    title: requiredTextFieldWithDefault('Recommended action'),
    name: presetTextField('$verdict'),
  },
  ...genericFieldOptions,
  {
    isCustom: true,
    fieldType: 'fullWax',
    label: ' Document',
    component: 'FullWaxField',
  },
  {
    isCustom: true,
    fieldType: 'attachments',
    label: 'Attachments',
    component: 'SupplementaryFiles',
    ...s3InputFields,
  },
  {
    fieldType: 'doiSuffix',
    label: 'DOI suffix',
    component: 'TextField',
    title: requiredTextFieldWithDefault('DOI suffix'),
    name: presetTextField('$doiSuffix'),
    doiValidation: null,
    doiUniqueSuffixValidation: {
      ...doiUniqueSuffixValidationField,
      defaultValue: 'true',
    },
    parse: null,
    format: null,
  },
]

/** Compile an array of field options for the given formCategory (submission, review
 * or decision), each restructured to contain an array of componentOptions.
 * Each componentOption contains the properties used by the field if that component
 * is selected.
 */
const getFieldOptions = formCategory => {
  let opts = []
  if (formCategory === 'submission') opts = submissionFieldOptions
  else if (formCategory === 'decision') opts = decisionFieldOptions
  else if (formCategory === 'review') opts = reviewFieldOptions

  const result = []

  const prototypeProps = prototypeComponent(formCategory)

  opts.forEach(opt => {
    const permittedComponents = Array.isArray(opt.component)
      ? opt.component
      : [opt.component]

    const componentOptions = permittedComponents.map(compName => {
      const baseProps = getBaseComponentProperties(formCategory)[compName] || {}

      const props = {}
      propertiesOrder.forEach(propName => {
        if (opt[propName] === null) return // to skip the property

        const prop =
          opt[propName] || baseProps[propName] || prototypeProps[propName]

        if (prop) props[propName] = prop
      })

      return {
        props,
        component: compName,
        label: baseProps.label,
        value: compName, // To work with Select component
      }
    })

    result.push({
      fieldType: opt.fieldType,
      label: opt.label,
      isCustom: opt.isCustom,
      value: opt.fieldType, // To work with Select component
      isReadOnly: opt.isReadOnly,
      isS3Component: opt.isS3Component,
      readonly: opt.readonly,
      componentOptions,
    })
  })

  return result
}

/** An object providing precompiled arrays of field options for different form categories
 * (submission, review or decision). Each field option contains an array of one
 * or more componentOptions, containing the properties used by the field if that
 * component is selected.
 */
const fieldOptionsByCategory = {
  submission: getFieldOptions('submission'),
  decision: getFieldOptions('decision'),
  review: getFieldOptions('review'),
}

/** Determines which field option and component option to use for a given field.
 * First, if a reserved field name is encountered, this will determine the
 * field option, and best component option available for that field will be used
 * (which may not match currentComponent). Otherwise, this chooses a generic field
 * option that provides the specified component.
 *
 * Field type is not currently persisted for fields in a form, but is implied
 * using this function.
 */
const determineFieldAndComponent = (fieldName, currentComponent, category) => {
  const fieldOptions = fieldOptionsByCategory[category] || []

  const fieldOption =
    fieldOptions.find(
      opt =>
        fieldName &&
        opt.componentOptions.some(x => x.props.name?.forcedValue === fieldName),
    ) ||
    fieldOptions.find(
      opt =>
        opt.isCustom &&
        opt.componentOptions.some(x => x.component === currentComponent),
    )

  const componentOption =
    fieldOption?.componentOptions.find(x => x.component === currentComponent) ||
    fieldOption?.componentOptions[0]

  return { fieldOption, componentOption }
}

/** This fleshes out the provided values by adding defaults wherever a property is
 * null/undefined/''; it also overrides existing values for certain "forced" fields;
 * e.g., some component options may force the field name to have a particular value.
 * The default and forced values are determined by the component option.
 *
 * All properties used by all possible field/component options will be added, and those
 * not used by this particular field/component will be set to null. This is to
 * facilitate easy switching between field/component options in a Formik form.
 */
const combineExistingPropValuesWithDefaults = (values, componentOption) => {
  const result = {}

  // Each property is set according to the following rules:
  propertiesOrder.forEach(propName => {
    const { forcedValue, defaultValue } = componentOption?.props[propName] || {}

    let propVal = forcedValue ?? values[propName] // Use forcedValue if there is one, else use the existing value if there is one
    if (propVal === undefined || propVal === null || propVal === '')
      propVal = defaultValue // else use the default value
    if (propVal === undefined || propVal === '') propVal = null // else use null
    result[propName] = propVal
  })

  result.fieldType = values.fieldType
  result.component = values.component || null
  result.validateValue = values.validateValue || null
  return result
}

export {
  fieldOptionsByCategory,
  determineFieldAndComponent,
  combineExistingPropValuesWithDefaults,
}
