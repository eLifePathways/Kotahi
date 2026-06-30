import Modal from 'react-modal'
import { ThemeProvider } from 'styled-components'

import theme from './theme'
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
          <ThemeProvider theme={theme}>
            <GlobalStyle />
            <Router />
          </ThemeProvider>
        </ModalProvider>
      </JournalProvider>
    </XpubProvider>
  )
}

export default <Pages />
