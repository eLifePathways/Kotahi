import { Children } from 'react'
import PropTypes from 'prop-types'

/**
 * Each component
 *
 * This component is useful for conditionally rendering a list of items using a provided render function.
 * If the condition is true, it maps over the `of` array and applies the `render` function to each item.
 * If the condition is false, it renders the `fallback` component.
 *
 * Using `Children.toArray` ensures that each item is assigned a unique key, avoiding the need to manually set keys.
 *
 * @param {Object} props - The properties object.
 * @param {Function} props.render - The function to render each item in the `of` array.
 * @param {Array} props.of - The array of items to be rendered.
 * @param {boolean} props.condition - The condition to determine whether to render the items or the fallback.
 * @param {Function} props.fallback - The fallback component to render if the condition is false.
 * @returns {React.ReactNode} The rendered list of items or the fallback component.
 */
const Each = ({ render, of, condition, fallback }) =>
  condition ? Children.toArray(of.map((item, i) => render(item, i))) : fallback

Each.propTypes = {
  render: PropTypes.func,
  of: PropTypes.instanceOf(Array),
  condition: PropTypes.bool,
  fallback: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
}

Each.defaultProps = {
  render: null,
  of: [],
  condition: true,
  fallback: null,
}

export default Each
