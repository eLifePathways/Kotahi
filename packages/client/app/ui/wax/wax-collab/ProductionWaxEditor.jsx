/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

/* eslint-disable new-cap */
/* eslint-disable jsx-a11y/no-autofocus */

import { useCallback, useMemo, useRef, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import styled, { ThemeProvider, useTheme } from 'styled-components'
import { Wax } from '../wax-prosemirror-core'
import waxTheme from './layout/waxTheme'
import WaxAppContext from '../WaxAppContext'

import yjsConfig from './config/yjsConfig'

import productionWaxEditorConfig from './config/ProductionWaxEditorConfig'
import ProductionWaxEditorLayout from './layout/ProductionWaxEditorLayout'
import ProductionWaxEditorNoCommentsLayout from './layout/ProductionWaxEditorNoCommentsLayout'

import authorProofingWaxEditorConfig from './config/AuthorProofingWaxEditorConfig'
import AuthorProofingWaxEditorLayout from './layout/AuthorProofingWaxEditorLayout'

import useWaxImageUpload from './useWaxImageUpload'

const Wrapper = styled.div``

const ProductionWaxEditor = ({
  aiConfig,
  updateAnystyle,
  updateCrossRef,
  updateCiteProc,
  updateCallout,
  value = '',
  validationStatus = '',
  readonly = false,
  autoFocus = false,
  saveSource = () => {},
  getComments,
  setComments,
  placeholder = '',
  // fileUpload,
  useComments = true,
  user = {},
  manuscriptId,
  onAssetManager,
  isAuthorProofingVersion = false,
  getDataFromDatacite = false,
  fallbackOnCrossrefAfterDatacite = false,
  // yjsProvider,
  wsProvider,
  ydoc,
  name,
}) => {
  const theme = useTheme()

  const handleAssetManager = useCallback(
    () => onAssetManager(manuscriptId),
    [onAssetManager, manuscriptId],
  )

  const uploadImage = useWaxImageUpload(manuscriptId)

  const { textStyles } = useContext(WaxAppContext)

  const waxUser = {
    userId: user.id || '-',
    userColor: {
      addition: 'royalblue',
      deletion: 'indianred',
    },
    username: user.username || 'demo',
  }

  const editorRef = useRef(null)

  useEffect(() => {
    return () => {
      if (editorRef.current && saveSource !== null) {
        saveSource(editorRef.current.getContent())
      }
    }
  }, [])

  // eslint-disable-next-line no-nested-ternary
  const productionLayout = isAuthorProofingVersion
    ? AuthorProofingWaxEditorLayout(readonly)
    : useComments // TODO: Check if we actually ever use useComments in production mode?
      ? ProductionWaxEditorLayout(readonly)
      : ProductionWaxEditorNoCommentsLayout(readonly)

  const config = useMemo(() => {
    const baseConfig = isAuthorProofingVersion
      ? authorProofingWaxEditorConfig(
          handleAssetManager,
          updateAnystyle,
          updateCrossRef,
          updateCiteProc,
          getComments,
          setComments,
          aiConfig,
        )
      : productionWaxEditorConfig(
          handleAssetManager,
          updateAnystyle,
          updateCrossRef,
          updateCiteProc,
          getComments,
          setComments,
          updateCallout,
          readonly,
          getDataFromDatacite || false,
          aiConfig,
          fallbackOnCrossrefAfterDatacite || false,
        )

    return yjsConfig(baseConfig, { wsProvider, ydoc, yjsType: name })
  }, [
    isAuthorProofingVersion,
    handleAssetManager,
    updateAnystyle,
    updateCrossRef,
    updateCiteProc,
    getComments,
    setComments,
    updateCallout,
    readonly,
    getDataFromDatacite,
    aiConfig,
    fallbackOnCrossrefAfterDatacite,
    wsProvider,
    ydoc,
    name,
  ])

  return (
    <ThemeProvider theme={{ textStyles, ...theme, ...waxTheme }}>
      <Wrapper className={validationStatus}>
        <Wax
          autoFocus={autoFocus}
          config={config}
          fileUpload={uploadImage}
          key={`readonly-${readonly}`} // Force remount to overcome Wax bugs on changing between editable and readonly
          layout={productionLayout}
          onChange={source => {
            saveSource(source)
          }}
          placeholder={placeholder}
          readonly={readonly}
          ref={editorRef}
          scrollMargin={200}
          scrollThreshold={200}
          user={waxUser}
          value={value}
        />
      </Wrapper>
    </ThemeProvider>
  )
}

ProductionWaxEditor.propTypes = {
  value: PropTypes.string,
  validationStatus: PropTypes.string,
  readonly: PropTypes.bool,
  autoFocus: PropTypes.bool,
  saveSource: PropTypes.func,
  isAuthorProofingVersion: PropTypes.bool,
  placeholder: PropTypes.string,
  fileUpload: PropTypes.func,
  useComments: PropTypes.bool,
  user: PropTypes.shape({
    userId: PropTypes.string,
    userName: PropTypes.string,
    userColor: PropTypes.shape({
      addition: PropTypes.string,
      deletion: PropTypes.string,
    }),
  }),
}

export default ProductionWaxEditor
