import { useState, type ReactNode } from 'react'

import preview from '../../.storybook/preview'
import Button from '../../app/ui/shared/Button'
import Modal from '../../app/ui/shared/Modal'

const BaseDemo = (): ReactNode => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={(): void => setIsOpen(true)}>Open modal</Button>
      <Modal
        onCancel={(): void => setIsOpen(false)}
        onOk={(): void => setIsOpen(false)}
        open={isOpen}
      >
        <p>This is a modal</p>
      </Modal>
    </>
  )
}

const HooksDemo = (): ReactNode => {
  const [modal, contextHolder] = Modal.useModal()
  const ModalFooter = Modal.footer

  const infoDialog = (): void => {
    modal.info({
      title: 'Info dialog',
      content: <p>Some important information</p>,
    })
  }

  const confirmationDialog = (): void => {
    modal.confirm({
      title: 'Confirmation dialog',
      content: <p>Are you sure you want to do this?</p>,
    })
  }

  const errorDialog = (): void => {
    const instance = modal.error({
      title: 'Error dialog',
      content: <p>There was an error while performing the action</p>,
      footer: (
        <ModalFooter>
          <Button onClick={(): void => instance.destroy()}>Nevermind</Button>
          <Button onClick={(): void => instance.destroy()} type="primary">
            Try again
          </Button>
        </ModalFooter>
      ),
      maskClosable: true,
    })
  }

  const successDialog = (): void => {
    modal.success({
      title: 'Success dialog',
      content: <p>Your request was successful!</p>,
    })
  }

  return (
    <>
      <Button onClick={infoDialog}>Info</Button>{' '}
      <Button onClick={confirmationDialog}>Confirm</Button>{' '}
      <Button onClick={errorDialog}>Error (custom footer)</Button>{' '}
      <Button onClick={successDialog}>Success</Button>
      {contextHolder}
    </>
  )
}

const meta = preview.meta({
  component: Modal,
})

export const Base = meta.story({
  render: () => <BaseDemo />,
})

export const Hooks = meta.story({
  render: () => <HooksDemo />,
})
