/* eslint-disable react/prop-types */

import { Button } from '.'
import ModalFooter from './ModalFooter'

const ModalFooterDialog = props => {
  const {
    disableConfirm,
    onConfirm,
    onRequestClose,
    showCancelButton = true,
    showConfirmButton = true,
    textCancel = 'Cancel',
    textSuccess = 'Ok',
    buttonLabel,
  } = props

  const shouldDisableCancel =
    disableConfirm &&
    (buttonLabel === 'Validating' || buttonLabel === 'Generating')

  return (
    <ModalFooter>
      {showConfirmButton && (
        <Button
          disabled={disableConfirm}
          label={buttonLabel || textSuccess}
          onClick={onConfirm}
          title={buttonLabel || textSuccess}
        />
      )}
      {showCancelButton && (
        <Button
          danger
          disabled={shouldDisableCancel}
          label={textCancel}
          onClick={onRequestClose}
          title={textCancel}
        />
      )}
    </ModalFooter>
  )
}

export default ModalFooterDialog
