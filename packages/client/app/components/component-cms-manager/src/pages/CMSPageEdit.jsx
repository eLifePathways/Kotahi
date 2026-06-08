/* eslint-disable react/prop-types */

import { useState, useRef } from 'react'
import { Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import CMSPageEditForm from './CMSPageEditForm'

import { CmsWidthAndHeightContainer } from '../style'

const CMSPageEdit = ({
  isNewPage,
  cmsPage,
  updatePageDataQuery,
  rebuildFlaxSiteQuery,
  createNewCMSPage,
  showPage,
  deleteCMSPage,
  flaxSiteUrlForGroup,
}) => {
  const { t } = useTranslation()
  const [customFormErrors, setCustomFormErrors] = useState({})

  const [submitButtonState, setSubmitButtonState] = useState({
    state: null,
    text: t('cmsPage.pages.Publish'),
  })

  const formikRef = useRef()

  const autoSubmit = () => {
    if (formikRef.current) {
      formikRef.current.handleSubmit()
    }
  }

  const autoSaveData = async (id, data) => {
    if (isNewPage && data.content && data.content !== '') {
      autoSubmit() // Auto submitting form as asset manager needs ID!
    }

    if (isNewPage) {
      return
    }

    const inputData = { ...data, edited: new Date() }
    await updatePageDataQuery({
      variables: { id, input: inputData },
    })
  }

  const publish = async formData => {
    setSubmitButtonState({
      state: 'pending',
      text: t('cmsPage.pages.Saving data'),
    })
    const timeStamp = new Date()

    const inputData = {
      title: formData.title,
      content: formData.content,
      url: formData.url,
      published: timeStamp,
    }

    await updatePageDataQuery({
      variables: {
        id: cmsPage.id,
        input: inputData,
      },
    })

    setSubmitButtonState({
      state: 'pending',
      text: t('cmsPage.pages.Rebuilding'),
    })
    await rebuildFlaxSiteQuery({
      variables: {
        params: JSON.stringify({
          path: 'pages',
        }),
      },
    })
    setSubmitButtonState({
      state: 'success',
      text: t('cmsPage.pages.Published'),
    })
  }

  const createNewPage = async formData => {
    const inputData = {
      title: formData.title,
      content: formData.content,
      url: formData.url,
    }

    const newCMSPageResults = await createNewCMSPage({
      variables: {
        input: inputData,
      },
    })

    const newCmsPage = newCMSPageResults.data.createCMSPage

    if (newCmsPage.success) {
      return showPage(newCmsPage.cmsPage)
    }

    const errors = {}
    errors[newCmsPage.column] = newCmsPage.errorMessage
    setCustomFormErrors(errors)
    return true
  }

  const onDelete = async currentCMSPage => {
    await deleteCMSPage({
      variables: { id: currentCMSPage.id },
    })
    rebuildFlaxSiteQuery({
      variables: {
        params: JSON.stringify({
          path: 'pages',
        }),
      },
    })
    showPage({ id: '' })
  }

  const resetCustomErrors = () => setCustomFormErrors({})

  return (
    <CmsWidthAndHeightContainer>
      <Formik
        initialValues={{
          title: cmsPage.title || '',
          content: cmsPage.content || '',
          url: cmsPage.url || '',
        }}
        innerRef={formikRef}
        onSubmit={async values =>
          isNewPage ? createNewPage(values) : publish(values)
        }
      >
        {formikProps => {
          return (
            <CMSPageEditForm
              autoSaveData={autoSaveData}
              autoSubmit={autoSubmit}
              cmsPage={cmsPage}
              currentValues={formikProps.values}
              customFormErrors={customFormErrors}
              flaxSiteUrlForGroup={flaxSiteUrlForGroup}
              isNewPage={isNewPage}
              onDelete={onDelete}
              onSubmit={formikProps.handleSubmit}
              resetCustomErrors={resetCustomErrors}
              setFieldValue={formikProps.setFieldValue}
              setTouched={formikProps.setTouched}
              submitButtonText={
                isNewPage ? t('common.Save') : submitButtonState.text
              }
            />
          )
        }}
      </Formik>
    </CmsWidthAndHeightContainer>
  )
}

export default CMSPageEdit
