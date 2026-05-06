/* eslint-disable react/prop-types */

import Button from './Button'

const PlainButton = ({ className, children, type, disabled, onClick }) => (
  <Button
    className={className}
    disabled={disabled}
    onClick={onClick}
    plain
    type={type}
  >
    {children}
  </Button>
)

export default PlainButton
