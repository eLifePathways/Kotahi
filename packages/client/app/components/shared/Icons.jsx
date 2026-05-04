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

export const SemanticScholarIcon = ({ className, height, width }) => {
  return (
    <svg
      className={className}
      height={height}
      viewBox="0 0 80 60"
      width={width}
    >
      <path
        clipRule="evenodd"
        d="M83.2 18.3c-2.9 1.8-5 2.9-7.4 4.3-14.4 8.7-28.3 18.4-39 31.1L31.6 60 15.8 34.8c3.5 2.8 12.4 10.7 16 12.5l11.6-8.8c8.1-5.7 31-18.1 39.8-20.2z"
        fill="#f3d25e"
        fillRule="evenodd"
      />
      <path
        d="M23.2 37.1c.4.3.7.6 1.1.9-3.1-8.7-8.6-17.4-16.4-24.9H0c10 7.2 17.8 15.6 23.2 24z"
        fill="#638bc4"
      />
      <path
        d="M25.8 39.4c.3.3.7.5 1 .8-.5-11.8-4.9-23.9-13.3-34.3H6c10.7 9.9 17.3 21.9 19.8 33.5z"
        fill="#305ca5"
      />
      <path
        d="M27.9 41.1c1.2 1 2.4 1.9 3.4 2.6 2.6-12.7.4-26.4-6.5-38.3 11.7-.2 23.4-.3 35-.5 2.6 5.8 4.1 12 4.5 18.4 1-.5 2-1 3.1-1.5-.5-6.6-2.3-13.6-5.8-21.8H13.7c10.4 12.3 15.1 27.2 14.2 41.1z"
        fill="#273d72"
      />
    </svg>
  )
}

export const SendIcon = ({ className, height, width, stroke }) => {
  return (
    <svg
      className={className}
      fill="none"
      height={height}
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="22" x2="11" y1="2" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

export const CoarIcon = ({ className, height, width }) => {
  return (
    <svg className={className} height={height} width={width}>
      <path
        clipRule="evenodd"
        d="M14.8334 1.48492C18.1727 1.55797 19.6727 3.19804 19.3334 6.40514C18.0017 8.62002 16.1684 9.16669 13.8334 8.04521C11.4017 5.46551 11.735 3.27877 14.8334 1.48492Z"
        fill="#83C553"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M1.16663 6.73315C2.49996 6.73315 3.83329 6.73315 5.16663 6.73315C5.09363 7.11857 5.20473 7.44659 5.49996 7.7172C7.26209 6.69953 9.15096 6.48085 11.1666 7.06117C11.7223 8.2639 12.611 9.13858 13.8333 9.68528C14.166 12.739 14.2773 15.8004 14.1666 18.8697C12.7223 18.8697 11.2776 18.8697 9.83329 18.8697C9.88863 16.2433 9.83329 13.6192 9.66663 10.9973C8.24379 10.0516 6.91046 10.161 5.66663 11.3254C5.50006 13.8376 5.44449 16.3525 5.49996 18.8697C4.05553 18.8697 2.61106 18.8697 1.16663 18.8697C1.16663 14.8243 1.16663 10.7787 1.16663 6.73315Z"
        fill="#7FC44F"
        fillRule="evenodd"
      />
    </svg>
  )
}
