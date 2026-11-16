/* eslint-disable react/prop-types */

export const DragVerticalIcon = ({
  className,
  color = 'black',
  size = 24,
  strokeWidth = 2,
}) => {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
    >
      <polyline points="9,6 12,3 15,6" />
      <line x1="3" x2="7" y1="12" y2="12" />
      <line x1="10" x2="14" y1="12" y2="12" />
      <line x1="17" x2="21" y1="12" y2="12" />
      <polyline points="9,18 12,21 15,18" />
    </svg>
  )
}
