import { QuestionsNodeView } from '../../../../../ui/wax/wax-prosemirror-core'

export default class CalloutPopUpContainerNodeView extends QuestionsNodeView {
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
  }

  static name() {
    return 'callout'
  }

  stopEvent(event) {
    return (
      this.context.pmViews[this.node.attrs.id] !== undefined &&
      event.target !== undefined &&
      this.context.pmViews[this.node.attrs.id].dom.contains(event.target)
    )
  }
}
