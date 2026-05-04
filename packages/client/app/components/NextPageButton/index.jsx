import VisibilitySensor from 'react-visibility-sensor'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Spinner } from '../shared'
import { HasNextPage, NextPageButton } from './style'

const NextPageButtonWrapper = props => {
  const {
    isFetchingMore,
    fetchMore,
    href,
    children,
    automatic,
    topOffset,
    bottomOffset,
  } = props

  const onChange = isVisible => {
    if (isFetchingMore || !isVisible) return undefined
    return fetchMore()
  }

  return (
    <HasNextPage
      as={href ? Link : 'div'}
      data-cy="load-previous-messages"
      onClick={evt => {
        evt.preventDefault()
        onChange(true)
      }}
      to={href}
    >
      <VisibilitySensor
        active={automatic !== false && !isFetchingMore}
        delayedCall
        intervalDelay={150}
        offset={{
          top: topOffset,
          bottom: bottomOffset,
        }}
        onChange={onChange}
        partialVisibility
        scrollCheck
      >
        <NextPageButton>
          {isFetchingMore ? (
            <Spinner color="brand.default" size={16} />
          ) : (
            children || 'Load more'
          )}
        </NextPageButton>
      </VisibilitySensor>
    </HasNextPage>
  )
}

// TODO: Set default props
NextPageButtonWrapper.propTypes = {
  isFetchingMore: PropTypes.bool,
  href: PropTypes.string,
  fetchMore: PropTypes.func.isRequired,
  children: PropTypes.string,
  automatic: PropTypes.bool,
  topOffset: PropTypes.number,
  bottomOffset: PropTypes.number,
}

NextPageButtonWrapper.defaultProps = {
  isFetchingMore: false,
  href: undefined,
  children: undefined,
  automatic: true,
  topOffset: -250,
  bottomOffset: -250,
}

export default NextPageButtonWrapper
