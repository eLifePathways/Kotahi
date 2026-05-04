import SimpleWaxEditor from '../../../../wax-collab/src/SimpleWaxEditor'

import Image from './Image'
import Active from './Active'

const generateSchema = (
  t,
  image,
  setImage,
  setActive,
  manuscriptLoadOptions,
) => {
  const schema = {
    type: 'object',
    required: ['title'],
    properties: {
      title: {
        type: 'string',
        description: `${t('cmsPage.metadata.title')} *`,
        default: '',
      },
      description: {
        type: 'string',
        description: t('cmsPage.metadata.description'),
        default: '',
      },
      publicationDate: {
        type: 'string',
        description: t('cmsPage.metadata.publicationDate'),
        default: '',
      },
      image: {
        type: ['string', 'null'],
        description: t('cmsPage.metadata.image'),
        default: '',
      },
      issueNumber: {
        type: 'string',
        description: t('cmsPage.metadata.issueNumber'),
        default: '',
      },
      manuscripts: {
        description: t('manuscriptsPage.Manuscripts'),
        type: 'array',
        items: {
          type: 'object',
        },
      },
      active: {
        type: 'boolean', // Use boolean type for checkboxes
        title: t('cmsPage.metadata.isActive'),
        description: t('cmsPage.metadata.isActive'),
        default: false,
      },
    },
  }

  const uiSchema = {
    'ui:rootFieldId': 'publishCollection',
    active: {
      'ui:widget': ({ value }) => {
        return <Active setActive={setActive} value={value} />
      },
    },
    image: {
      'ui:widget': props => (
        <Image
          inputProps={props}
          mimeTypesToAccept={'image/*'}
          previewImage={image.previewImage}
          setImage={setImage}
        />
      ),
      'ui:options': {
        accept: 'image/*',
      },
    },
    manuscripts: {
      'ui:field': 'AsyncSelectWidget',
      'ui:options': {
        manuscriptLoadOptions,
      },
    },
    description: {
      'ui:widget': ({ value, onChange }) => (
        <SimpleWaxEditor onChange={onChange} value={value} />
      ),
    },
  }

  return { schema, uiSchema }
}

export default generateSchema
