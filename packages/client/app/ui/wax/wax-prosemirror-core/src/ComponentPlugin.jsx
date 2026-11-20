/* eslint-disable react-hooks/rules-of-hooks */

import { useContext } from 'react'

import { ApplicationContext } from './ApplicationContext'

const ComponentPlugin = renderArea => layoutProps => {
  const { app } = useContext(ApplicationContext)

  const inject = app?.container.isBound('Layout')
    ? { instance: app?.container.get('Layout') }
    : null

  const components = inject ? inject.instance.render(renderArea) : []

  return components
    ? components.map(({ component: Component, componentProps }, key) => {
        return (
          <Component
            key={`${renderArea}-${key}`}
            {...layoutProps}
            {...componentProps}
          />
        )
      })
    : null
}
export default ComponentPlugin
