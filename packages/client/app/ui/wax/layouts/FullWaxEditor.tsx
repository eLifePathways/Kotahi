import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { debounce } from 'lodash'
import { ThemeProvider, useTheme } from 'styled-components'

import { WaxProvider } from '../editor'
import type { Comment } from '../features/comments'
import type { AssetFile } from '../features/images'
import { CalloutView, CitationView, ReferenceServicesProvider } from '../ui'
import { fullFeatures } from './featureSets'
import { ActiveViewDom } from './shared/EditorEffects'
import useImageUpload from './shared/imageUpload'
import { FullLayout, ProductionLayout } from './shared/ManuscriptLayout'
import { FullToolbar, type AiConfig } from './shared/toolbars'
import useLatest from './shared/useLatest'
import { allowAll, toWaxUser, type KotahiUser } from './shared/user'
import useYjsFeatures, { type YjsProps } from './shared/yjs'
import waxTheme from './styles/waxTheme'

const nodeViews = { reference: CitationView, callout: CalloutView }

export type FullWaxEditorProps = YjsProps & {
  aiConfig?: AiConfig
  onAssetManager?: (
    manuscriptId?: string,
  ) => Promise<AssetFile | AssetFile[] | null>
  commentsToolPosition?: CSSProperties['position']
  hideNotes?: boolean
  hideImages?: boolean
  value?: string
  validationStatus?: string
  readonly?: boolean
  autoFocus?: boolean
  saveSource?: (html: string) => void
  getComments?: (comments: Comment[]) => void
  setComments?: () => Comment[]
  placeholder?: string
  useComments?: boolean
  authorComments?: boolean
  user?: KotahiUser
  manuscriptId?: string
  getActiveViewDom?: (html: string) => void
  citationStyleName?: string
}

const FullWaxEditor = ({
  aiConfig,
  onAssetManager,
  commentsToolPosition,
  hideNotes = false,
  hideImages = false,
  value = '',
  validationStatus,
  readonly = false,
  autoFocus = false,
  saveSource,
  getComments,
  setComments,
  placeholder = '',
  useComments = false,
  authorComments = false,
  user,
  manuscriptId,
  getActiveViewDom,
  citationStyleName,
  wsProvider,
  ydoc,
  name,
}: FullWaxEditorProps): ReactNode => {
  const theme = useTheme()
  const upload = useImageUpload(manuscriptId)
  const latest = useLatest({ saveSource, getComments, ydoc })
  const [fullScreen, setFullScreen] = useState(false)
  const [suggesting, setSuggesting] = useState(false)
  const [initialComments] = useState(() => setComments?.() ?? [])

  const references = useMemo(
    () => ({ readOnly: true, styleName: citationStyleName }),
    [citationStyleName],
  )
  const yjsFeatures = useYjsFeatures({ wsProvider, ydoc, name })

  const features = useMemo(
    () => [
      ...fullFeatures({
        initialComments,
        onCommentsChange: (comments): void =>
          latest.current?.getComments?.(comments),
      }),
      ...yjsFeatures,
    ],
    [initialComments, latest, yjsFeatures],
  )

  const save = useMemo(
    () =>
      debounce((html: string) => {
        if (!latest.current?.ydoc) latest.current?.saveSource?.(html)
      }, 500),
    [latest],
  )

  useEffect(() => {
    const flush = (): void => {
      save.flush()
    }

    window.addEventListener('pagehide', flush)

    return (): void => {
      window.removeEventListener('pagehide', flush)
      save.flush()
    }
  }, [save])

  const waxUser = toWaxUser(user)
  const permissions = allowAll(!readonly)

  const toolbar = (
    <FullToolbar
      ai={aiConfig}
      fullScreen={{ value: fullScreen, onChange: setFullScreen }}
      images={
        hideImages
          ? undefined
          : {
              upload,
              pickFromAssets: onAssetManager
                ? (): Promise<AssetFile | AssetFile[] | null> =>
                    onAssetManager(manuscriptId)
                : undefined,
            }
      }
      notes={!hideNotes}
      tracking={{ suggesting, onChange: setSuggesting }}
    />
  )

  return (
    <ThemeProvider theme={{ ...theme, ...waxTheme }}>
      <div className={validationStatus}>
        <ReferenceServicesProvider value={references}>
          <WaxProvider
            features={features}
            focusOnMount={autoFocus}
            nodeViews={nodeViews}
            onChange={ydoc ? undefined : save}
            placeholder={placeholder}
            readonly={readonly}
            trackChanges={suggesting}
            user={waxUser}
            value={ydoc ? '' : value}
          >
            <ActiveViewDom onChange={getActiveViewDom} />
            {useComments ? (
              <ProductionLayout
                comments={{
                  user: {
                    userId: waxUser.userId,
                    displayName: waxUser.username,
                    username: waxUser.username,
                  },
                  permissions,
                  hideTools: authorComments,
                  toolsPosition: commentsToolPosition,
                }}
                fullScreen={fullScreen}
                readonly={readonly}
                toolbar={toolbar}
              />
            ) : (
              <FullLayout
                fullScreen={fullScreen}
                readonly={readonly}
                toolbar={toolbar}
              />
            )}
          </WaxProvider>
        </ReferenceServicesProvider>
      </div>
    </ThemeProvider>
  )
}

export default FullWaxEditor
