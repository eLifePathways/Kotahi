/* eslint-disable react-hooks/rules-of-hooks, react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */

import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { clone, uniqueId } from 'lodash'
import { override } from '@coko/client'

import CommentItem from './CommentItem'

const Wrapper = styled.div`
  padding: 8px 16px;

  > div:not(:last-of-type) {
    margin-bottom: 16px;
  }
  /* stylelint-disable order/properties-alphabetical-order */
  ${override(
    'Wax.CommentItemWrapper',
  )}/* stylelint-enable order/properties-alphabetical-order */
`

const More = styled.span`
  background: gray;
  border-radius: 3px;
  color: white;
  /* cursor: default; */
  display: inline-block;
  padding: 4px 8px;

  /* stylelint-disable order/properties-alphabetical-order */
  ${override(
    'Wax.CommentMore',
  )}/* stylelint-enable order/properties-alphabetical-order */
`

const CommentItemList = props => {
  const { active, className, data } = props
  if (!data || data.length === 0) return null

  const [items, setItems] = useState(data)

  useEffect(() => {
    if (!active) {
      const first = clone(data[0])
      const threshold = 100 // after how many characters do you trunctate

      if (first.content.length > threshold) {
        first.content = `${first.content.substring(1, threshold)}...`
      }

      setItems([first])
    } else {
      setItems(data)
    }
  }, [active, data])

  return (
    <Wrapper active={active} className={className}>
      {items.map(item => (
        <CommentItem
          active={active}
          content={item.content}
          displayName={item.displayName}
          key={uniqueId('comment-item-')}
          timestamp={item.timestamp}
        />
      ))}

      {!active && data.length > 1 && (
        <div>
          <More>{data.length - 1} more</More>
        </div>
      )}
    </Wrapper>
  )
}

CommentItemList.propTypes = {
  /** Whether this list belongs to the current active comment */
  active: PropTypes.bool,
  /** List of objects containing data for comment items */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      content: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
      timestamp: PropTypes.number.isRequired,
    }),
  ),
}

CommentItemList.defaultProps = {
  active: false,
  data: [],
}

export default CommentItemList
