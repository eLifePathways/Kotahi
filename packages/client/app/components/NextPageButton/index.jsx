import { useEffect, useRef } from 'react'
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

  const sentinelRef = useRef(null)

  useEffect(() => {
    if (automatic === false || isFetchingMore) return undefined

    const rootMargin = `${topOffset ?? -250}px 0px ${bottomOffset ?? -250}px 0px`
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchMore()
      },
      { rootMargin },
    )

    const el = sentinelRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [automatic, isFetchingMore, fetchMore, topOffset, bottomOffset])

  return (
    <HasNextPage
      as={href ? Link : 'div'}
      data-cy="load-previous-messages"
      onClick={evt => {
        evt.preventDefault()
        fetchMore()
      }}
      to={href}
    >
      <NextPageButton ref={sentinelRef}>
        {isFetchingMore ? (
          <Spinner color="brand.default" size={16} />
        ) : (
          children || 'Load more'
        )}
      </NextPageButton>
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
