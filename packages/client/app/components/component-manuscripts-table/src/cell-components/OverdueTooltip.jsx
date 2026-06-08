/* eslint-disable react/prop-types */

import Tooltip from 'rc-tooltip'
import { StyledAlertCircle } from '../style'

const OverdueTooltip = ({ manuscript }) => {
  return (
    <div>
      {manuscript.hasOverdueTasksForUser && (
        <Tooltip
          overlay={<p color="red">Overdue Task</p>}
          overlayInnerStyle={{
            backgroundColor: 'White',
            borderColor: 'LightGray',
            fontWeight: 'bold',
            color: 'red',
          }}
          placement="top"
        >
          <StyledAlertCircle />
        </Tooltip>
      )}
    </div>
  )
}

export default OverdueTooltip
