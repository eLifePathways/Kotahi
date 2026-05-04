import PropTypes from 'prop-types'
import React from 'react'

const JournalContext = React.createContext()

const JournalProvider = ({ journal, children }) => (
  <JournalContext.Provider value={journal}>{children}</JournalContext.Provider>
)

JournalProvider.propTypes = {
  journal: PropTypes.oneOfType([PropTypes.object]).isRequired,
  children: PropTypes.oneOfType([PropTypes.object]).isRequired,
}

export { JournalContext, JournalProvider }
