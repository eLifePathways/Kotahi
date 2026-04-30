import React, { useContext } from 'react'
import { useMutation, useQuery, gql } from '@apollo/client'
import { omit } from 'lodash'
import { ConfigContext } from '../../config/src'
import {
  createCollectionMutation,
  deleteCollectionMutation,
  updateCollectionMutation,
  getManuscriptData,
} from './queries'
import { CommsErrorBanner, Spinner } from '../../shared'
import CollectionList from './collection/CollectionList'

const GET_COLLECTIONS = gql`
  query GetPublishingCollection($groupId: ID!) {
    publishingCollection(groupId: $groupId) {
      id
      created
      updated
      formData {
        title
        description
        publicationDate
        image
        issueNumber
      }
      active
      manuscripts {
        id
        submission
      }
      groupId
    }
  }
`

const useAsyncQuery = () => {
  const config = useContext(ConfigContext)

  const { refetch } = useQuery(getManuscriptData, {
    skip: true, // you should skip the initial query
  })

  const loadOptions = (inputValue, callback) => {
    // Add wildcard if input is at least three characters and ends with a word character
    const inputWithWildcard = /..\w$/.test(inputValue)
      ? `${inputValue}*`
      : inputValue

    const variables = {
      sort: null,
      offset: 0,
      limit: 10,
      filters: [{ field: 'search', value: inputWithWildcard }],
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
      groupId: config.groupId,
    }

    refetch(variables)
      .then(newData => {
        const formatData = newData.data.paginatedManuscripts.manuscripts.map(
          m => ({
            value: m.id,
            label: JSON.parse(m.submission).$title,
          }),
        )

        callback(formatData)
      })
      .catch(error => console.error(error))
  }

  return { loadOptions }
}

const CmsPublishingCollectionPage = () => {
  const config = useContext(ConfigContext)
  const [update] = useMutation(updateCollectionMutation)
  const [createCollection] = useMutation(createCollectionMutation)
  const [deleteCollection] = useMutation(deleteCollectionMutation)

  const { loadOptions: manuscriptLoadOptions } = useAsyncQuery()

  const { loading, error, data } = useQuery(GET_COLLECTIONS, {
    variables: { groupId: config.groupId },
    fetchPolicy: 'network-only',
  })

  if (loading && !data) return <Spinner />

  if (error) return <CommsErrorBanner error={error} />

  const updateCollectionFn = (collectionId, formData) => {
    return update({
      variables: {
        id: collectionId,
        input: {
          formData: omit(formData, ['active', 'manuscripts']),
          active: formData.active,
          manuscripts: formData.manuscripts,
        },
      },
    })
  }

  const createCollectionFn = async formData =>
    createCollection({
      variables: {
        file: formData.image,
        input: {
          formData: omit(formData, ['active', 'manuscripts']),
          active: formData.active,
          manuscripts: formData.manuscripts,
        },
      },
    })

  const deleteCollectionFn = id => {
    deleteCollection({ variables: { id } })
  }

  return (
    <CollectionList
      createCollection={createCollectionFn}
      data={data}
      deleteCollection={deleteCollectionFn}
      manuscriptLoadOptions={manuscriptLoadOptions}
      updateCollection={updateCollectionFn}
    />
  )
}

export default CmsPublishingCollectionPage
