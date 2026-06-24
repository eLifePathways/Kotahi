/* eslint-disable react/prop-types */

import { Sidebar } from 'react-feather'

const PinButton = props => {
  return (
    <button type="submit" {...props}>
      <Sidebar />
      {props.children}
    </button>
  )
}

export default PinButton
