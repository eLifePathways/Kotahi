import styled from 'styled-components'
import { Modal as AntModal } from 'antd'

import { grid } from '@coko/client'

const ModalFooter = styled.div`
  margin-top: ${grid(3)};
  text-align: right;

  > button:not(:last-of-type) {
    margin-right: ${grid(2)};
  }
`

const ModalHeader = styled.h2`
  font-size: unset;
  margin: 0;
`

const Modal = Object.assign(AntModal, {
  header: ModalHeader,
  footer: ModalFooter,
})

export default Modal
