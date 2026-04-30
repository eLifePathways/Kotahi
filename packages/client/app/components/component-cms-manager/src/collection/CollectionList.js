/* eslint-disable react/prop-types */

import { useState } from 'react'

import styled from 'styled-components'
import { grid, th } from '@coko/client'
import { v4 as uuid } from 'uuid'
import { useTranslation } from 'react-i18next'
import { cloneDeep, pick, isArray } from 'lodash'
import { color } from '../../../../theme'

import CollectionTable from './CollectionTable'
import { HeadingCell } from '../../../component-production/src/components/styles'
import {
  Action,
  ActionButton,
  Container,
  HeadingWithAction,
  Heading,
  PaddedContent,
  SectionContent,
  WidthLimiter,
  LabelBadge,
} from '../../../shared'
import CollectionModalForm from './CollectionModalForm'

const CmsHeadStyled = styled.div`
  button {
    font-size: ${th('fontSizeBase')};
    line-height: 53px;
  }
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-between;
`

export const CollectionsHeading = styled.div`
  align-items: center;
  background-color: ${color.backgroundA};
  border-top: 1px solid ${color.gray90};
  column-gap: ${grid(2)};
  display: flex;
  flex-direction: row;
  line-height: 1.4em;
  text-align: left;
  width: 100%;

  &:first-child {
    border-top: none;
    padding: ${grid(0.5)} ${grid(2)};
  }

  &:not(:first-child) {
    padding: ${grid(1.5)} ${grid(2)};
  }
`

const NoCollectionSpan = styled.span`
  display: block;
  font-size: ${th('fontSizeHeading4')};
  padding: 20px;
  text-align: center;
  width: 100%;
`

const formatManuscriptObject = collections => {
  return isArray(collections)
    ? cloneDeep(collections).map(c => {
        c.manuscripts = c.manuscripts.map(m => ({
          value: m.id,
          label: JSON.parse(m.submission).$title,
        }))
        return c
      })
    : {
        ...collections,
        manuscripts: collections.manuscripts.map(m => ({
          value: m.id,
          label: JSON.parse(m.submission).$title,
        })),
      }
}

const CollectionList = ({
  deleteCollection,
  createCollection,
  updateCollection,
  manuscriptLoadOptions,
  data,
}) => {
  const [activeCollection, setActiveCollection] = useState(null)
  const { t } = useTranslation()

  const [publishCollection, setPublishCollection] = useState(
    formatManuscriptObject(data.publishingCollection),
  )

  const addUiCollection = () => {
    setActiveCollection({
      id: uuid(),
      formData: { title: '' },
      active: false,
      manuscripts: [],
      isNew: true,
    })
  }

  const deleteCollectionFn = async id => {
    await deleteCollection(id)
    const updated = publishCollection.filter(col => col.id !== id)

    setPublishCollection([...updated])
  }

  const onChange = ({ formData }) => {
    setActiveCollection({
      ...activeCollection,
      active: formData.active,
      manuscripts: formData.manuscripts,
      formData: pick(formData, [
        'description',
        'image',
        'issueNumber',
        'publicationDate',
        'title',
      ]),
    })
  }

  const submitCollection = async (input, id) => {
    let updatedResult = null

    if (activeCollection.isNew) {
      const result = await createCollection(input)
      updatedResult = result.data.createCollection
      setPublishCollection([...publishCollection, updatedResult])
      setActiveCollection(updatedResult)
    } else {
      const result = await updateCollection(id, input)

      updatedResult = formatManuscriptObject(result.data.updateCollection)

      setPublishCollection([
        ...publishCollection.map(collection =>
          collection.id === id ? updatedResult : collection,
        ),
      ])
    }
  }

  let counter = 1

  const columnsProps = [
    {
      name: 'id',
      centered: false,
      title: 'ID',
      // eslint-disable-next-line no-plusplus
      component: () => counter++,
    },
    {
      name: 'title',
      centered: false,
      title: 'Title',
      component: ({ collection }) => {
        return collection && collection.formData.title
      },
    },
    {
      name: 'published',
      centered: false,
      title: 'Published',
      component: ({ collection }) => {
        return collection.formData.publicationDate
          ? collection.formData.publicationDate
          : '-'
      },
    },
    {
      name: 'active',
      centered: false,
      title: 'Active',

      component: ({ collection }) => {
        return collection && collection.active ? (
          <LabelBadge color="#3aae2a">True</LabelBadge>
        ) : (
          <LabelBadge color="#ff0000">False</LabelBadge>
        )
      },
    },
    {
      name: 'Edit',
      centered: false,
      title: 'Edit',

      component: ({ collection }) => {
        const onClick = () => {
          setActiveCollection(
            publishCollection.find(mtd => mtd.id === collection.id),
          )
        }

        return (
          <ActionButton onClick={onClick} primary>
            Edit
          </ActionButton>
        )
      },
    },
  ]

  return (
    <>
      <link
        crossOrigin="anonymous"
        href="https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css"
        integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu"
        rel="stylesheet"
      />
      <Container>
        <HeadingWithAction>
          <Heading>{t('leftMenu.Collections')}</Heading>
        </HeadingWithAction>
        <WidthLimiter>
          <SectionContent>
            <PaddedContent>
              <CmsHeadStyled>
                <Action onClick={addUiCollection}>
                  + {t('cmsPage.metadata.addCollection')}
                </Action>
              </CmsHeadStyled>
              <CollectionsHeading>
                {columnsProps.map(info => (
                  <HeadingCell key={info.name}>{info.title}</HeadingCell>
                ))}
              </CollectionsHeading>
              {}
              <>
                {publishCollection.length === 0 ? (
                  <NoCollectionSpan>
                    {t('cmsPage.metadata.noCollections')}
                  </NoCollectionSpan>
                ) : (
                  publishCollection.map(collection => (
                    <CollectionTable
                      collection={collection}
                      columnDefinitions={columnsProps}
                      key={collection.id}
                    />
                  ))
                )}
              </>
              {activeCollection && (
                <CollectionModalForm
                  collection={activeCollection}
                  deleteCollection={deleteCollectionFn}
                  manuscriptLoadOptions={manuscriptLoadOptions}
                  onChange={onChange}
                  onClose={() => {
                    setActiveCollection(null)
                  }}
                  submitCollection={submitCollection}
                />
              )}
            </PaddedContent>
          </SectionContent>
        </WidthLimiter>
      </Container>
    </>
  )
}

export default CollectionList
