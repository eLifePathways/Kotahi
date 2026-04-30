/* eslint-disable react/prop-types */
/* eslint-disable promise/catch-or-return, promise/always-return */

import React from 'react'
import { mimetypeHelpers } from './Modal'

import UploadButton from './UploadButton'

const { assetManagerFileExtensions } = mimetypeHelpers
class UploadFilesButton extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      uploading: false,
    }
  }

  handleFilesUpload = e => {
    e.preventDefault()
    const { handler } = this.props
    const { target } = e
    const { files } = target
    const self = this

    this.setState({ uploading: true })
    handler(files).then(() => {
      self.setState({ uploading: false })
      // target.value = ''
    })
  }

  render() {
    const { uploading } = this.state

    const labelText = uploading ? 'Uploading ...' : 'Upload Images'

    return (
      <UploadButton
        accept={assetManagerFileExtensions}
        disabled={uploading}
        id="assets"
        label={labelText}
        multiple
        onChange={this.handleFilesUpload}
      />
    )
  }
}

export default UploadFilesButton
