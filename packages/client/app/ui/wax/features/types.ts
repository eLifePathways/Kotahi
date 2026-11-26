import type {
  Attrs,
  DOMOutputSpec,
  Mark,
  MarkSpec,
  Node,
  NodeSpec,
  Schema,
} from 'prosemirror-model'
import type { InputRule } from 'prosemirror-inputrules'
import type {
  Command,
  EditorState,
  Plugin,
  Transaction,
} from 'prosemirror-state'

type Next = () => void

type HookParseRule = {
  tag?: string
  style?: string
  attrs?: Attrs
  getAttrs?: (
    hook: { dom: HTMLElement; [attr: string]: unknown },
    next: Next,
  ) => void
}

type HookToDOM<T> = (
  hook: { node: T; value?: DOMOutputSpec },
  next: Next,
) => void

export type WaxMarkSpec = Omit<MarkSpec, 'parseDOM' | 'toDOM'> & {
  parseDOM?: HookParseRule | HookParseRule[]
  toDOM?: HookToDOM<Mark>
}

export type WaxNodeSpec = Omit<NodeSpec, 'parseDOM' | 'toDOM'> & {
  parseDOM?: HookParseRule | HookParseRule[]
  toDOM?: HookToDOM<Node>
}

export type WaxFeature = {
  name: string
  marks?: Record<string, MarkSpec>
  nodes?: Record<string, NodeSpec>
  waxMarks?: Record<string, WaxMarkSpec>
  waxNodes?: Record<string, WaxNodeSpec>
  shortcuts?: Record<string, Command>
  plugins?: () => Record<string, Plugin>
  rules?: (schema: Schema) => InputRule[]
  transformTransaction?: (tr: Transaction, state: EditorState) => Transaction
  sync?: Command
  flushSchemaOnRegister?: boolean
}
