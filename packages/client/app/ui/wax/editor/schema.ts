import { Schema, type MarkSpec, type NodeSpec } from 'prosemirror-model'

import type { WaxFeature } from './types'

const baseNodes: Record<string, NodeSpec> = {
  doc: {
    content: 'block+',
  },
  text: {
    group: 'inline',
  },
  hard_break: {
    inline: true,
    group: 'inline',
    selectable: false,
    parseDOM: [{ tag: 'br' }],
    toDOM: () => ['br'],
  },
  paragraph: {
    group: 'block',
    content: 'inline*',
    attrs: {
      class: { default: 'paragraph' },
    },
    parseDOM: [
      {
        tag: 'p.paragraph',
        getAttrs: (dom: HTMLElement) => ({ class: dom.getAttribute('class') }),
      },
    ],
    toDOM: node => ['p', node.attrs, 0],
  },
}

type Hook = Record<string, unknown>
type HookFn = (hook: Hook, next: () => void) => void

const runHooks = (
  fns: HookFn[],
  hook: Hook,
  done: (hook: Hook) => void,
): void => {
  const step = (index: number): void => {
    if (index === fns.length) done(hook)
    else fns[index](hook, () => step(index + 1))
  }

  step(0)
}

const ignoreAttrs: HookFn = (_, next) => next()

class HookParseRule {
  tag: string | undefined

  style: string | undefined

  hooks: HookFn[] = []

  constructor({ tag, style, getAttrs }: Hook) {
    this.tag = tag as string | undefined
    this.style = style as string | undefined
    this.add(getAttrs as HookFn | undefined)
  }

  add(getAttrs?: HookFn): void {
    this.hooks.push(getAttrs ?? ignoreAttrs)
  }

  toSpec(): Record<string, unknown> {
    const rule: Record<string, unknown> = {}
    if (this.style) rule.style = this.style
    else if (this.tag) rule.tag = this.tag

    rule.getAttrs = (dom: unknown): Hook => {
      let result: Hook = {}

      runHooks(this.hooks, { dom }, hook => {
        result = hook
      })

      const { dom: _, ...attrs } = result
      return attrs
    }

    return rule
  }
}

const nodeFields = [
  'atom',
  'inline',
  'group',
  'content',
  'isolating',
  'draggable',
]
const markFields = [
  'inline',
  'group',
  'content',
  'draggable',
  'inclusive',
  'excludes',
]

const nodeDefaults: Hook = {
  atom: false,
  inline: false,
  isolating: false,
  draggable: false,
  group: '',
  content: '',
}

const markDefaults: Hook = {
  inline: false,
  group: '',
  content: '',
  draggable: false,
  inclusive: true,
  excludes: '',
}

class HookSpec {
  fields: Hook

  outputFields: string[]

  attrs: Record<string, unknown> = {}

  rules: HookParseRule[] = []

  toDOMHooks: HookFn[] = []

  constructor(kind: 'node' | 'mark') {
    this.fields = { ...(kind === 'node' ? nodeDefaults : markDefaults) }
    this.outputFields = kind === 'node' ? nodeFields : markFields
  }

  merge(config: Hook): void {
    Object.entries(config).forEach(([key, value]) => {
      if (key === 'toDOM') this.toDOMHooks.push(value as HookFn)
      else if (key === 'attrs') Object.assign(this.attrs, value)
      else if (key === 'parseDOM') this.mergeRules(value)
      else this.fields[key] = value
    })
  }

  mergeRules(parseDOM: unknown): void {
    const values = (Array.isArray(parseDOM) ? parseDOM : [parseDOM]) as Hook[]

    values.forEach(value => {
      let rule = this.rules.find(r => {
        if (value.tag) return r.tag === value.tag
        if (value.style) return r.style === value.style
        return false
      })

      if (!rule) {
        rule = new HookParseRule(value)
        this.rules.push(rule)
      }

      rule.add(value.getAttrs as HookFn | undefined)
    })
  }

  toSpec(): Record<string, unknown> {
    const spec: Record<string, unknown> = {}
    this.outputFields.forEach(field => {
      spec[field] = this.fields[field]
    })

    spec.attrs = this.attrs
    spec.parseDOM = this.rules.map(rule => rule.toSpec())
    spec.toDOM = (node: unknown): unknown => {
      let result: Hook = {}

      runHooks(this.toDOMHooks, { node }, hook => {
        result = hook
      })

      return result.value
    }

    return spec
  }
}

type SpecMap = Record<string, unknown>

class SchemaBuilder {
  plain: { nodes: SpecMap; marks: SpecMap } = { nodes: {}, marks: {} }

  hooked: { nodes: Record<string, HookSpec>; marks: Record<string, HookSpec> } =
    {
      nodes: {},
      marks: {},
    }

  addPlain(type: 'nodes' | 'marks', specs: SpecMap = {}): void {
    Object.assign(this.plain[type], specs)
  }

  addHooked(type: 'nodes' | 'marks', specs: SpecMap = {}): void {
    Object.entries(specs).forEach(([name, config]) => {
      if (!this.hooked[type][name])
        this.hooked[type][name] = new HookSpec(
          type === 'nodes' ? 'node' : 'mark',
        )
      this.hooked[type][name].merge(config as Hook)
    })
  }

  flush(): void {
    ;(['nodes', 'marks'] as const).forEach(type => {
      Object.entries(this.hooked[type]).forEach(([name, spec]) => {
        this.plain[type][name] = spec.toSpec()
      })
    })
  }

  build(): Schema {
    this.flush()

    return new Schema({
      nodes: this.plain.nodes as Record<string, NodeSpec>,
      marks: this.plain.marks as Record<string, MarkSpec>,
    })
  }
}

const buildSchema = (features: WaxFeature[]): Schema => {
  const builder = new SchemaBuilder()
  builder.addPlain('nodes', baseNodes)

  features.forEach(feature => {
    builder.addPlain('nodes', feature.nodes)
    builder.addHooked('nodes', feature.waxNodes)
    builder.addPlain('marks', feature.marks)
    builder.addHooked('marks', feature.waxMarks)
    if (feature.flushSchemaOnRegister) builder.flush()
  })

  return builder.build()
}

export default buildSchema
