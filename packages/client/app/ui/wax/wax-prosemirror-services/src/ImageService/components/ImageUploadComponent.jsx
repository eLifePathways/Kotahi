/* eslint-disable react/prop-types */
import { useContext } from 'react'
import {
  WaxContext,
  ApplicationContext,
} from '../../../../wax-prosemirror-core'
import { isEmpty } from 'lodash'
import fileUpload from '../fileUpload'
import ImageUpload from './ImageUpload'

const ImageUploadComponent = ({ view, config, pmplugins, item }) => {
  const context = useContext(WaxContext)
  const { app } = useContext(ApplicationContext)
  if (isEmpty(view)) return null

  const upload = fileUpload(
    view,
    config.get('fileUpload'),
    pmplugins.get('imagePlaceHolder'),
    context,
    app,
  )

  return (
    <ImageUpload
      fileUpload={upload}
      item={item.toJSON()}
      key="image-upload"
      view={view}
    />
  )

  // return displayed ? (
  //   <ImageUpload
  //     fileUpload={upload}
  //     item={item.toJSON()}
  //     key={uuid()}
  //     view={view}
  //   />
  // ) : null;
}

export default ImageUploadComponent
