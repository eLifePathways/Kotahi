import { useMemo, useState, type ReactNode } from 'react'

import { WaxProvider } from '../editor'
import type { Comment } from '../features/comments'
import type { AssetFile } from '../features/images'
import {
  CalloutView,
  CitationView,
  JatsSideMenu,
  ReferenceServicesProvider,
  type ReferenceServices,
} from '../ui'
import { productionFeatures } from './featureSets'
import { SaveOnUnmount } from './shared/EditorEffects'
import useImageUpload, { type UploadImage } from './shared/imageUpload'
import { ProductionLayout } from './shared/ManuscriptLayout'
import { FullToolbar, type AiConfig } from './shared/toolbars'
import useLatest from './shared/useLatest'
import { allowAll, toWaxUser, type KotahiUser } from './shared/user'
import useYjsFeatures, { yjsKey, type YjsProps } from './shared/yjs'

const nodeViews = { reference: CitationView, callout: CalloutView }

export type ProductionWaxEditorProps = YjsProps & {
  aiConfig?: AiConfig
  updateAnystyle?: ReferenceServices['anyStyle']
  updateCrossRef?: ReferenceServices['crossRef']
  updateCiteProc?: ReferenceServices['citeProc']
  updateCallout?: ReferenceServices['updateCallout']
  value?: string
  validationStatus?: string
  readonly?: boolean
  saveSource?: ((html: string) => void) | null
  getComments?: (comments: Comment[]) => void
  setComments?: () => Comment[]
  placeholder?: string
  useComments?: boolean
  user?: KotahiUser
  manuscriptId?: string
  onAssetManager?: (
    manuscriptId?: string,
  ) => Promise<AssetFile | AssetFile[] | null>
  isAuthorProofingVersion?: boolean
  getDataFromDatacite?: boolean
  citationStyleName?: string
  uploadImage?: UploadImage
  suggesting?: boolean
  onSuggestingChange?: (suggesting: boolean) => void
}

const ProductionWaxEditor = ({
  aiConfig,
  updateAnystyle,
  updateCrossRef,
  updateCiteProc,
  updateCallout,
  value = '',
  validationStatus = '',
  readonly = false,
  saveSource,
  getComments,
  setComments,
  placeholder = '',
  useComments = true,
  user,
  manuscriptId,
  onAssetManager,
  isAuthorProofingVersion = false,
  getDataFromDatacite = false,
  citationStyleName,
  uploadImage,
  suggesting = false,
  onSuggestingChange,
  wsProvider,
  ydoc,
  name,
}: ProductionWaxEditorProps): ReactNode => {
  const upload = useImageUpload(uploadImage, manuscriptId)
  const latest = useLatest({ getComments })
  const [fullScreen, setFullScreen] = useState(false)
  const [initialComments] = useState(() => setComments?.() ?? [])
  const yjsFeatures = useYjsFeatures({ wsProvider, ydoc, name })
  const waxUser = toWaxUser(user)
  const { userId, username } = waxUser
  const trackingOn = isAuthorProofingVersion || suggesting

  const features = useMemo(
    () => [
      ...productionFeatures({
        initialComments,
        onCommentsChange: (comments): void =>
          latest.current?.getComments?.(comments),
        trackChanges: { enabled: trackingOn, user: { userId, username } },
      }),
      ...yjsFeatures,
    ],
    [initialComments, latest, yjsFeatures, trackingOn, userId, username],
  )

  const references = useMemo<ReferenceServices>(
    () => ({
      anyStyle: updateAnystyle,
      crossRef: updateCrossRef,
      citeProc: updateCiteProc,
      updateCallout: isAuthorProofingVersion ? undefined : updateCallout,
      getDataFromDatacite,
      readOnly: readonly,
      styleName: citationStyleName,
    }),
    [
      updateAnystyle,
      updateCrossRef,
      updateCiteProc,
      updateCallout,
      isAuthorProofingVersion,
      getDataFromDatacite,
      readonly,
      citationStyleName,
    ],
  )

  const toolbar = (
    <FullToolbar
      ai={isAuthorProofingVersion ? undefined : aiConfig}
      fullScreen={{ value: fullScreen, onChange: setFullScreen }}
      images={{
        upload,
        pickFromAssets: onAssetManager
          ? (): Promise<AssetFile | AssetFile[] | null> =>
              onAssetManager(manuscriptId)
          : undefined,
      }}
      tracking={
        onSuggestingChange
          ? {
              suggesting: trackingOn,
              onChange: onSuggestingChange,
              locked: isAuthorProofingVersion,
            }
          : undefined
      }
    />
  )

  return (
    <div className={validationStatus}>
      <ReferenceServicesProvider value={references}>
        <WaxProvider
          features={features}
          key={yjsKey({ wsProvider, ydoc, name })}
          nodeViews={nodeViews}
          onChange={saveSource ?? undefined}
          placeholder={placeholder}
          value={value}
        >
          <SaveOnUnmount onSave={saveSource} />
          <ProductionLayout
            comments={
              useComments
                ? {
                    user: {
                      userId: waxUser.userId,
                      displayName: waxUser.username,
                      username: waxUser.username,
                    },
                    permissions: allowAll(!readonly),
                  }
                : undefined
            }
            fullScreen={fullScreen}
            readonly={readonly}
            sideMenu={<JatsSideMenu />}
            toolbar={toolbar}
          />
        </WaxProvider>
      </ReferenceServicesProvider>
    </div>
  )
}

export default ProductionWaxEditor
