export type NodeSchema = { title: string } & Record<string, unknown>

const ref = (name: string): Record<string, string> => ({
  $ref: `#/definitions/${name}`,
})

export const INLINE_CHILDREN = { type: 'array', items: ref('Inline') }

export const ANY_CHILDREN = {
  type: 'array',
  items: { anyOf: [ref('Block'), ref('Inline')] },
}

export const nodeSchema = (
  type: string,
  properties: Record<string, unknown> = {},
  required: string[] = [],
): NodeSchema => ({
  title: type,
  type: 'object',
  properties: {
    type: { enum: [type] },
    id: { type: 'string' },
    classes: { type: 'array', items: { type: 'string' } },
    data: { type: 'object', additionalProperties: true },
    ...properties,
  },
  required: ['type', ...required],
})
