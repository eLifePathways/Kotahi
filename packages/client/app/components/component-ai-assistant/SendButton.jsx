const SendIcon = ({ ...rest }) => {
  return (
    <svg
      preserveAspectRatio="none"
      version="1.1"
      viewBox="0 0 18 18"
      x="0px"
      xmlns="http://www.w3.org/2000/svg"
      y="0px"
      {...rest}
    >
      <defs>
        <g id="Layer0_0_FILL">
          <path
            d="
M 6.65 9.9
L 5.65 14.6 15.4 9.4 5.65 4.2 6.65 8.9 9.25 9.4 6.65 9.9 Z"
            stroke="none"
          />
        </g>
      </defs>

      <g transform="matrix( 1, 0, 0, 1, 0,0) ">
        <use xlinkHref="#Layer0_0_FILL" />
      </g>
    </svg>
  )
}

export default SendIcon
