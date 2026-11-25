/* eslint no-underscore-dangle: 0 */
import React from 'react'
import { uuid } from '@coko/client'
import ToolGroupComponent from './ToolGroupComponent'

const ToolGroups = ({ toolGroups, view }) => {
  return toolGroups.map(toolGroup => {
    if (toolGroup._toolGroups.length > 0) {
      return <ToolGroups toolGroups={toolGroup._toolGroups} view={view} />
    }
    return (
      <ToolGroupComponent key={uuid()} tools={toolGroup._tools} view={view} />
    )
  })
}

export default ToolGroups
