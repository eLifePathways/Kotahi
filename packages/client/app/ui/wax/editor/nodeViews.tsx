import {
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
  type ReactPortal,
} from 'react'
import { createPortal } from 'react-dom'
import type { Node } from 'prosemirror-model'
import { Plugin, PluginKey } from 'prosemirror-state'
import type { EditorView, NodeView } from 'prosemirror-view'

export type NodeViewProps = {
  node: Node
  view: EditorView
  getPos: () => number | undefined
  selected: boolean
}

export type NodeViews = Record<string, ComponentType<NodeViewProps>>

type PortalStore = {
  getPortals: () => ReactPortal[]
  subscribe: (listener: () => void) => () => void
  set: (key: string, portal: ReactPortal) => void
  remove: (key: string) => void
}

const interactive = 'input, textarea, select, button, a, [role="button"]'

export const createPortalStore = (): PortalStore => {
  let portals: ReactPortal[] = []
  const listeners = new Set<() => void>()
  const emit = (): void => listeners.forEach(listener => listener())

  return {
    getPortals: (): ReactPortal[] => portals,
    subscribe: (listener): (() => void) => {
      listeners.add(listener)
      return (): void => {
        listeners.delete(listener)
      }
    },
    set: (key, portal): void => {
      portals = [...portals.filter(p => p.key !== key), portal]
      emit()
    },
    remove: (key): void => {
      portals = portals.filter(p => p.key !== key)
      emit()
    },
  }
}

let nextKey = 0

class ReactNodeView implements NodeView {
  dom: HTMLElement

  key: string

  props: NodeViewProps

  constructor(
    node: Node,
    view: EditorView,
    getPos: () => number | undefined,
    private Component: ComponentType<NodeViewProps>,
    private store: PortalStore,
  ) {
    this.dom = document.createElement(node.isInline ? 'span' : 'div')
    this.dom.className = `node-view node-view-${node.type.name}`
    nextKey += 1
    this.key = `node-view-${nextKey}`
    this.props = { node, view, getPos, selected: false }
    this.render()
  }

  render(): void {
    const { Component } = this
    this.store.set(
      this.key,
      createPortal(<Component {...this.props} />, this.dom, this.key),
    )
  }

  update(node: Node): boolean {
    if (node.type !== this.props.node.type) return false
    this.props = { ...this.props, node }
    this.render()
    return true
  }

  selectNode(): void {
    this.dom.classList.add('ProseMirror-selectednode')
    this.props = { ...this.props, selected: true }
    this.render()
  }

  deselectNode(): void {
    this.dom.classList.remove('ProseMirror-selectednode')
    this.props = { ...this.props, selected: false }
    this.render()
  }

  stopEvent(event: Event): boolean {
    return !!(event.target as HTMLElement | null)?.closest?.(interactive)
  }

  ignoreMutation(): boolean {
    return true
  }

  destroy(): void {
    this.store.remove(this.key)
  }
}

export const nodeViewsPlugin = (
  nodeViews: NodeViews,
  store: PortalStore,
): Plugin =>
  new Plugin({
    key: new PluginKey('reactNodeViews'),
    props: {
      nodeViews: Object.fromEntries(
        Object.entries(nodeViews).map(([name, Component]) => [
          name,
          (
            node: Node,
            view: EditorView,
            getPos: () => number | undefined,
          ): NodeView =>
            new ReactNodeView(node, view, getPos, Component, store),
        ]),
      ),
    },
  })

type NodeViewPortalsProps = {
  store: PortalStore
}

export const NodeViewPortals = ({ store }: NodeViewPortalsProps): ReactNode =>
  useSyncExternalStore(store.subscribe, store.getPortals, store.getPortals)

export type { PortalStore }
