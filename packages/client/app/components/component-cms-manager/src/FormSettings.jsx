/* eslint-disable react/prop-types, react/display-name */

import { set } from 'lodash'

import ContentWaxEditor from './editor/ContentWaxEditor'

import StaticTextInput from './components/StaticTextInput'

import { FormTextInput, SimpleWaxEditorContainer } from './style'

import { Checkbox } from '../../shared/Checkbox'

import { hasValue } from '../../../shared/htmlUtils'
import { ColorPicker } from '../../shared'

/* eslint-disable-next-line default-param-last */
const createEditorComponent = (EditorComponent, shouldWrap = true, simple) => {
  /* eslint-disable-next-line no-unused-vars */
  return ({ validationStatus, setTouched, onChange, ...rest }) => {
    const editorComponent = (
      <EditorComponent
        {...rest}
        onBlur={() => {
          setTouched(set({}, rest.name, true))
        }}
        onChange={val => {
          setTouched(set({}, rest.name, true))
          const cleanedVal = hasValue(val) ? val : ''
          onChange(cleanedVal)
        }}
        simple={simple}
      />
    )

    return shouldWrap ? (
      <SimpleWaxEditorContainer>{editorComponent}</SimpleWaxEditorContainer>
    ) : (
      editorComponent
    )
  }
}

const richEditor = createEditorComponent(ContentWaxEditor, false, false)
const simpleWaxEditor = createEditorComponent(ContentWaxEditor, false, true)

const staticTextInput = props => {
  return <StaticTextInput {...props} />
}

export const inputComponents = {
  TextField: FormTextInput,
  Checkbox,
  StaticTextInput: staticTextInput,
  SimpleWaxEditor: simpleWaxEditor,
  AbstractEditor: richEditor,
  ColorInput: ColorPicker,
}

export const inputFields = [
  {
    component: inputComponents.TextField,
    label: 'Page title*',
    name: 'title',
    type: 'text-input',
    isRequired: true,
  },
  {
    component: StaticTextInput,
    label: 'URL',
    name: 'url',
    type: 'text-input',
    isRequired: true,
  },
  {
    component: inputComponents.AbstractEditor,
    label: '',
    name: 'content',
    flexGrow: true,
    type: 'rich-editor',
    isRequired: true,
    otherProps: {},
  },
]

export const emailTemplateInputFields = [
  {
    component: inputComponents.TextField,
    label: 'Description',
    name: 'description',
    type: 'text-input',
    isRequired: true,
  },
  {
    component: inputComponents.TextField,
    label: 'Subject',
    name: 'subject',
    type: 'text-input',
    isRequired: true,
  },
  // {
  //   component: inputComponents.TextField,
  //   label: 'CC',
  //   name: 'cc',
  //   type: 'text-input',
  // },
  // {
  //   component: inputComponents.Checkbox,
  //   label: 'ccEditorsCheckboxDescription',
  //   name: 'ccEditors',
  //   type: 'checkbox',
  //   containerStyle: {
  //     display: 'flex',
  //     alignItems: 'center',
  //     flexDirection: 'row-reverse',
  //     marginRight: 'auto',
  //   },
  //   itemStyle: {
  //     marginBottom: '0px',
  //   },
  // },
  {
    component: inputComponents.SimpleWaxEditor,
    label: 'Body',
    name: 'body',
    flexGrow: true,
    type: 'SimpleWaxEditor',
    isRequired: true,
    otherProps: {},
  },
]
