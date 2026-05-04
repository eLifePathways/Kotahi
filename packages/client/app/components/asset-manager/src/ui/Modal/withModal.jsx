import ModalContext from './ModalContext'

const withModal = props => {
  const { render } = props

  return (
    <ModalContext.Consumer>
      {({ hideModal, showModal, data = {}, modals, modalKey }) => {
        const ModalComponent = modals[modalKey]
        return (
          <>
            {modalKey && (
              <ModalComponent
                data={data}
                hideModal={hideModal}
                isOpen={modalKey !== undefined}
              />
            )}
            {render({ hideModal, showModal })}
          </>
        )
      }}
    </ModalContext.Consumer>
  )
}

export default withModal
