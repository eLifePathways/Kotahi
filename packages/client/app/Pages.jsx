import Modal from 'react-modal'

import GlobalStyle from './theme/elements/GlobalStyle'

import AssetManager from './components/asset-manager/src/AssetManagerPage'
import { JournalProvider } from './components/xpub-journal'
import journal from '../config/journal'
import ModalProvider from './components/asset-manager/src/ui/Modal/ModalProvider'
import { XpubProvider } from './components/xpub-with-context/src/index'

import Router from './Router'

const modals = {
  assetManagerEditor: AssetManager,
}

const Pages = () => {
  Modal.setAppElement('#root')

  return (
    <XpubProvider>
      <JournalProvider journal={JSON.parse(JSON.stringify(journal))}>
        <ModalProvider modals={modals}>
          <GlobalStyle />
          <Router />
        </ModalProvider>
      </JournalProvider>
    </XpubProvider>
  )
}

export default <Pages />
