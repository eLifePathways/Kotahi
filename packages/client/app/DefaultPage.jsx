import Modal from 'react-modal'
import { LazyMotion } from 'framer-motion'

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

const loadDomAnimationFeatures = () =>
  import('framer-motion').then(res => res.domAnimation)

const DefaultPage = () => {
  Modal.setAppElement('#root')

  return (
    <LazyMotion features={loadDomAnimationFeatures} strict>
      <XpubProvider>
        <JournalProvider journal={JSON.parse(JSON.stringify(journal))}>
          <ModalProvider modals={modals}>
            <GlobalStyle />
            <Router />
          </ModalProvider>
        </JournalProvider>
      </XpubProvider>
    </LazyMotion>
  )
}

export default <DefaultPage />
