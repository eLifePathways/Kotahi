import { createContext } from 'react'

export default createContext({
  modalKey: null,
  modals: {},
  /* eslint-disable-next-line no-unused-vars */
  showModal: props => () => {},
  hideModal: () => {},
})
