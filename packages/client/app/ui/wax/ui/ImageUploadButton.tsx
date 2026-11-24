import { useRef, type ChangeEvent, type ReactNode } from 'react'
import { PictureOutlined } from '@ant-design/icons'

import Button from '../../shared/Button'
import { useWax } from '../editor'
import {
  canInsertImage,
  insertAssetImages,
  uploadImage,
  type AssetFile,
  type UploadResult,
} from '../features/images'

type ImageUploadButtonProps = {
  upload: (file: File) => Promise<UploadResult>
  pickFromAssets?: () => Promise<AssetFile | AssetFile[] | null | undefined>
  showLongDesc?: boolean
  accept?: string
}

const ImageUploadButton = ({
  upload,
  pickFromAssets,
  showLongDesc = false,
  accept = 'image/*',
}: ImageUploadButtonProps): ReactNode => {
  const view = useWax(s => s.view)
  const enabled: boolean = useWax(({ state }) =>
    Boolean(state && canInsertImage(state)),
  )
  const input = useRef<HTMLInputElement>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (view && file) uploadImage(view, file, upload, { showLongDesc })
  }

  return (
    <>
      <Button
        aria-label="Insert image"
        disabled={!enabled}
        icon={<PictureOutlined />}
        onClick={async (): Promise<void> => {
          if (!pickFromAssets) {
            input.current?.click()
            return
          }

          const picked = await pickFromAssets()
          if (!view || !picked) return
          insertAssetImages(Array.isArray(picked) ? picked : [picked])(
            view.state,
            view.dispatch,
          )
        }}
        onMouseDown={(event): void => event.preventDefault()}
        size="small"
        title="Insert image"
        type="text"
      />
      <input
        accept={accept}
        hidden
        onChange={handleChange}
        ref={input}
        type="file"
      />
    </>
  )
}

export default ImageUploadButton
