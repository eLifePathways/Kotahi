import { useState, type ReactNode } from 'react'
import { Input } from 'antd'
import styled from 'styled-components'
import { grid } from '@coko/client'

import Button from '../../shared/Button'
import ButtonGroup from '../../shared/ButtonGroup'
import { useWax } from '../editor'
import {
  getSelectedImage,
  setImageDescription,
  type SelectedImage,
} from '../features/images'
import { PanelHeading } from './Panel'

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${grid(1)};
`

type ImageFormProps = {
  image: SelectedImage
}

const ImageForm = ({ image }: ImageFormProps): ReactNode => {
  const view = useWax(s => s.view)
  const [alt, setAlt] = useState(image.alt)
  const [longDescription, setLongDescription] = useState(image.longDescription)

  const save = (): void => {
    if (!view) return
    setImageDescription(
      alt,
      image.hasLongDescription ? longDescription : undefined,
    )(view.state, view.dispatch)
    view.focus()
  }

  return (
    <Form
      onSubmit={(event): void => {
        event.preventDefault()
        save()
      }}
    >
      <Input
        aria-label="Alternative text"
        onChange={(event): void => setAlt(event.target.value)}
        placeholder="Alternative text"
        value={alt}
      />
      {image.hasLongDescription ? (
        <Input.TextArea
          aria-label="Long description"
          autoSize={{ minRows: 2 }}
          onChange={(event): void => setLongDescription(event.target.value)}
          placeholder="Long description"
          value={longDescription}
        />
      ) : null}
      <ButtonGroup justify="right">
        <Button htmlType="submit" size="small" type="primary">
          Save
        </Button>
      </ButtonGroup>
    </Form>
  )
}

type ImageDetailsProps = {
  className?: string
}

const ImageDetails = ({ className }: ImageDetailsProps): ReactNode => {
  const image: SelectedImage | null = useWax(
    ({ state }) => (state ? getSelectedImage(state) : null),
    (a, b) => JSON.stringify(a) === JSON.stringify(b),
  )

  if (!image) return null

  return (
    <section aria-label="Image details" className={className}>
      <PanelHeading>Image</PanelHeading>
      <ImageForm image={image} key={image.pos} />
    </section>
  )
}

export default ImageDetails
