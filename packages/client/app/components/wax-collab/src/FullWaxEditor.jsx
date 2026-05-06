/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, react-hooks/use-memo */
/* eslint-disable react/prop-types */

/* eslint-disable new-cap */
/* eslint-disable jsx-a11y/no-autofocus */

import { useRef, useState, useEffect, useContext, useCallback } from 'react'
import PropTypes from 'prop-types'
import { ThemeProvider } from 'styled-components'
import { debounce } from 'lodash'
import { Wax } from 'wax-prosemirror-core'
import { JournalContext } from '../../xpub-journal'
import waxTheme from './layout/waxTheme'
import fullWaxEditorConfig from './config/FullWaxEditorConfig'
import yjsConfig from './config/yjsConfig'
import FullWaxEditorLayout from './layout/FullWaxEditorLayout'
import ProductionWaxEditorLayout from './layout/ProductionWaxEditorLayout'

// TODO Save this image via the server
const renderImage = file => {
  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    // Some extra delay to make the asynchronicity visible
    setTimeout(() => {
      reader.readAsDataURL(file)
    }, 150)
  })
}

const FullWaxEditor = ({
  aiConfig,
  onAssetManager,
  commentsToolPosition,
  hideNotes,
  hideImages,
  value = '',
  validationStatus,
  readonly = false,
  autoFocus = false,
  saveSource = () => {},
  getComments,
  setComments,
  placeholder = '',
  useComments = false,
  authorComments = false,
  // fileUpload,
  user = {},
  manuscriptId,
  getActiveViewDom,
  wsProvider,
  ydoc,
  name,
}) => {
  const handleAssetManager = () => onAssetManager(manuscriptId)

  const [config, setConfig] = useState(
    fullWaxEditorConfig(
      handleAssetManager,
      getComments,
      setComments,
      readonly,
      aiConfig,
    ),
  )

  const journal = useContext(JournalContext)

  const debouncedSave = useCallback(
    debounce(source => {
      if (saveSource && !ydoc) saveSource(source)
    }, 6000),
    [],
  )

  const removeToolFromConfig = tool => {
    config.MenuService.forEach(menuItem => {
      if (menuItem.templateArea === 'topBar') {
        const index = menuItem.toolGroups.indexOf(tool)
        menuItem.toolGroups.splice(index, 1)
      }
    })
  }

  useEffect(() => {
    if (hideNotes) removeToolFromConfig('Notes')
    if (hideImages) removeToolFromConfig('Images')

    return () => !ydoc && debouncedSave.flush()
  }, [])

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
    setConfig(
      yjsConfig(config, {
        wsProvider,
        ydoc,
        yjsType: name,
      }),
    )
  }, [name, wsProvider?.roomname, ydoc?.guid])

  return (
    <ThemeProvider theme={{ textStyles: journal.textStyles, ...waxTheme }}>
      <div className={validationStatus} style={{ width: '100%' }}>
        <Wax
          autoFocus={autoFocus}
          config={config}
          fileUpload={file => renderImage(file)}
          key={`readonly-${readonly}`}
          layout={
            useComments
              ? ProductionWaxEditorLayout(
                  readonly,
                  authorComments,
                  false,
                  commentsToolPosition,
                )
              : FullWaxEditorLayout(readonly, getActiveViewDom)
          }
          onChange={source => !ydoc && debouncedSave(source)}
          placeholder={placeholder}
          readonly={readonly}
          ref={editorRef}
          user={waxUser}
          value={!ydoc && value}
        />
      </div>
    </ThemeProvider>
  )
}

FullWaxEditor.propTypes = {
  value: PropTypes.string,
  validationStatus: PropTypes.string,
  readonly: PropTypes.bool,
  autoFocus: PropTypes.bool,
  saveSource: PropTypes.func,
  placeholder: PropTypes.string,
  // fileUpload: PropTypes.func,
  authorComments: PropTypes.bool,
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

export default FullWaxEditor
