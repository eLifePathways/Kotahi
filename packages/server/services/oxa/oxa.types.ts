type NodeBase = {
  id?: string
  classes?: string[]
  data?: Record<string, unknown>
}

type OxaText = NodeBase & { type: 'Text'; value: string }

type OxaEmphasis = NodeBase & {
  type: 'Emphasis'
  children: OxaInline[]
}

type OxaStrong = NodeBase & { type: 'Strong'; children: OxaInline[] }

type OxaSubscript = NodeBase & {
  type: 'Subscript'
  children: OxaInline[]
}

type OxaSuperscript = NodeBase & {
  type: 'Superscript'
  children: OxaInline[]
}

type OxaInlineCode = NodeBase & {
  type: 'InlineCode'
  value: string
  language?: string
}

export type OxaCite = NodeBase & {
  type: 'Cite'
  xref: string
  children?: OxaInline[]
  prefix?: OxaInline[]
  suffix?: OxaInline[]
  display?: 'author' | 'date' | 'full'
  locator?: string
  url?: string
  intent?: string
}

type OxaCiteGroup = NodeBase & {
  type: 'CiteGroup'
  kind: 'narrative' | 'parenthetical'
  children: OxaCite[]
}

type OxaInlineImage = NodeBase & {
  type: 'InlineImage'
  url: string
  alt?: string
  encodingFormat?: string
}

type OxaExperimentalInline = NodeBase & {
  type:
    | 'Link'
    | 'Underline'
    | 'Strikethrough'
    | 'SmallCaps'
    | 'InlineMath'
    | 'Break'
    | 'Footnote'
  [key: string]: unknown
}

export type OxaInline =
  | OxaText
  | OxaEmphasis
  | OxaStrong
  | OxaSubscript
  | OxaSuperscript
  | OxaInlineCode
  | OxaCite
  | OxaCiteGroup
  | OxaInlineImage
  | OxaExperimentalInline

type OxaHeading = NodeBase & {
  type: 'Heading'
  level: number
  children: OxaInline[]
}

export type OxaParagraph = NodeBase & {
  type: 'Paragraph'
  children: OxaInline[]
}

type OxaCode = NodeBase & {
  type: 'Code'
  value: string
  language?: string
}

type OxaThematicBreak = NodeBase & { type: 'ThematicBreak' }

export type OxaReference = NodeBase & {
  type: 'Reference'
  id: string
  identifier?: string
  csl: Record<string, unknown>
  children?: OxaInline[]
}

type OxaImage = NodeBase & {
  type: 'Image'
  url: string
  alt?: string
  encodingFormat?: string
}

type OxaExperimentalBlock = NodeBase & {
  type:
    | 'List'
    | 'ListItem'
    | 'Table'
    | 'TableRow'
    | 'TableCell'
    | 'Figure'
    | 'Caption'
    | 'Math'
    | 'BlockQuote'
    | 'Section'
  [key: string]: unknown
}

export type OxaBlock =
  | OxaHeading
  | OxaParagraph
  | OxaCode
  | OxaThematicBreak
  | OxaReference
  | OxaImage
  | OxaExperimentalBlock

export type OxaNode = OxaBlock | OxaInline | OxaDocument

export type OxaDocument = NodeBase & {
  type: 'Document'
  metadata?: Record<string, unknown>
  title?: OxaInline[]
  children: OxaBlock[]
}
