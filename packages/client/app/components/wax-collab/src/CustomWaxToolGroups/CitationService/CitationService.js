/* eslint-disable new-cap */

import { Service } from 'wax-prosemirror-core'
import ReferenceTool from './ReferenceTool'
import CitationComponent from './components/CitationComponent'
import referenceDefinition from './schema/reference'
import CitationPlugin from './plugins/citationPlugin'

import CitationNodeView from './CitationNodeView'

// TODO: This doesn't currently come out as JATS.

class CitationService extends Service {
  name = 'CitationService'

  boot() {
    // This will send something in the config to the plugin
    this.app.PmPlugins.add(
      'citationPlugin',
      CitationPlugin('citationPlugin', this.config),
    )
  }

  register() {
    this.container.bind('Reference').to(ReferenceTool)
    const addPortal = this.container.get('AddPortal')
    const createNode = this.container.get('CreateNode')
    // console.log(this.config) // check to make sure that config is coming through
    createNode(
      {
        reference: referenceDefinition,
      },
      { toWaxSchema: true },
    )
    addPortal({
      nodeView: CitationNodeView,
      component: CitationComponent,
      context: this.app,
    })
  }

  selectNode() {
    this.context.pmViews[this.node.attrs.id].focus()
  }

  update(node) {
    if (node.type.name === 'paragraph') {
      // console.log('type name is paragraph!')
      if (!node.sameMarkup(this.node)) return false
    } // else {
    // console.log('type name is not paragraph!')
    // }

    return super.update(node)
  }
}

export default CitationService
