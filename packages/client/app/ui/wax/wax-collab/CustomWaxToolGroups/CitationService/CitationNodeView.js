import { QuestionsNodeView } from '../../../wax-prosemirror-core'

export default class CitationNodeView extends QuestionsNodeView {
  constructor(
    node,
    view,
    getPos,
    decorations,
    createPortal,
    Component,
    context,
  ) {
    super(node, view, getPos, decorations, createPortal, Component, context)

    this.node = node
    this.outerView = view
    this.getPos = getPos
    this.context = context
    this.decorations = decorations
  }

  static name() {
    return 'reference'
  }

  selectNode() {
    this.context.pmViews[this.node.attrs.id].focus()
  }

  update(node) {
    // console.log('\n\n\nUpdate fired!')

    if (node.type.name === 'paragraph') {
      // console.log('type name is paragraph!')
      // console.log('node.sameMarkup(this.node): ', node.sameMarkup(this.node))
      if (!node.sameMarkup(this.node)) return false
    } else {
      // console.log('type name is not paragraph!')
    }

    return super.update(node)
  }

  stopEvent(event) {
    const innerView = this.context.pmViews[this.node.attrs.id]
    return innerView && innerView.dom.contains(event.target)
  }
}
