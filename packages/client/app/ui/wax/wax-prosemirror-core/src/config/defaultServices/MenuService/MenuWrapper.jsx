/* eslint no-underscore-dangle: 0 */
/* eslint react/prop-types: 0 */

import { map } from 'lodash'

const MainMenuBar = ({ items = [], view }) => {
  return <>{map(items, item => item.renderTools(view))}</>
}

export default MainMenuBar
