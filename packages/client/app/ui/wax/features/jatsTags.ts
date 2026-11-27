import { wrapIn } from 'prosemirror-commands'
import type { MarkSpec, NodeSpec } from 'prosemirror-model'
import type { Command, EditorState } from 'prosemirror-state'

import { markActive, setBlockType, toggleMarkByName } from './helpers'

import type { WaxFeature } from '../editor'

const jatsNodes: Record<string, NodeSpec> = {
  refList: {
    content: 'block+',
    // content: 'referenceHeader? reference*', // this was more specific
    group: 'block',
    defining: true,
    attrs: {
      class: { default: 'reflist' },
    },
    parseDOM: [
      {
        tag: 'section.reflist',
        getAttrs: () => null,
      },
    ],
    toDOM() {
      const attrs = { class: 'reflist' }
      return ['section', attrs, 0]
    },
  },

  appendix: {
    content: 'block+',
    group: 'block',
    defining: true,
    attrs: {
      class: { default: 'appendix' },
    },
    parseDOM: [
      {
        tag: 'section.appendix',
        getAttrs: () => null,
      },
    ],
    toDOM() {
      const attrs = { class: 'appendix' }
      return ['section', attrs, 0]
    },
  },

  frontMatter: {
    content: 'block+',
    group: 'block',
    defining: true,
    attrs: {
      class: { default: 'frontmatter' },
    },
    parseDOM: [
      {
        tag: 'section.frontmatter',
        getAttrs: () => null,
      },
    ],
    toDOM() {
      const attrs = { class: 'frontmatter' }
      return ['section', attrs, 0]
    },
  },

  awardId: {
    content: 'inline*',
    group: 'block',
    priority: 0,
    defining: true,
    attrs: {
      class: { default: 'awardid' },
    },
    parseDOM: [
      {
        tag: 'p.awardid',
        getAttrs: () => null,
      },
    ],
    toDOM() {
      const attrs = {
        class: 'awardid',
        title: 'Award ID',
      }

      return ['p', attrs, 0]
    },
  },

  fundingSource: {
    content: 'inline*',
    group: 'block',
    priority: 0,
    defining: true,
    attrs: {
      class: { default: 'fundingsource' },
    },
    parseDOM: [
      {
        tag: 'p.fundingsource',
        getAttrs: () => null,
      },
    ],
    toDOM() {
      const attrs = {
        class: 'fundingsource',
        title: 'Funding Source',
      }

      return ['p', attrs, 0]
    },
  },

  fundingStatement: {
    content: 'inline*',
    group: 'block',
    priority: 0,
    defining: true,
    attrs: {
      class: { default: 'fundingstatement' },
    },
    parseDOM: [
      {
        tag: 'p.fundingstatement',
        getAttrs: () => null,
      },
    ],
    toDOM() {
      const attrs = {
        class: 'fundingstatement',
        title: 'Funding Statement',
      }

      return ['p', attrs, 0]
    },
  },

  abstractSection: {
    content: 'block+',
    group: 'block',
    defining: true,
    attrs: {
      class: { default: 'abstractSection' },
    },
    parseDOM: [
      {
        tag: 'section.abstractSection',
        getAttrs: () => null,
      },
    ],
    toDOM() {
      const attrs = { class: 'abstractSection' }
      return ['section', attrs, 0]
    },
  },

  acknowledgementsSection: {
    content: 'block+',
    group: 'block',
    defining: true,
    attrs: {
      class: { default: 'acknowledgementsSection' },
    },
    parseDOM: [
      {
        tag: 'section.acknowledgementsSection',
        getAttrs: () => null,
      },
    ],
    toDOM() {
      const attrs = {
        class: 'acknowledgementsSection',
      }

      return ['section', attrs, 0]
    },
  },

  keywordList: {
    content: 'inline*',
    group: 'block',
    priority: 0,
    defining: true,
    attrs: {
      class: { default: 'keyword-list' },
    },
    parseDOM: [
      {
        tag: 'p.keyword-list',
        getAttrs: () => null,
      },
    ],
    toDOM() {
      const attrs = {
        class: 'keyword-list',
        title: 'Keyword list',
      }

      return ['p', attrs, 0]
    },
  },

  glossarySection: {
    content: 'block+',
    group: 'block',
    defining: true,
    attrs: {
      class: { default: 'glossary' },
    },
    parseDOM: [
      {
        tag: 'section.glossary',
        getAttrs: () => null,
      },
    ],
    toDOM() {
      const attrs = { class: 'glossary' }
      return ['section', attrs, 0]
    },
  },
}

const jatsMarks: Record<string, MarkSpec> = {
  mixedCitationSpan: {
    attrs: {
      class: { default: 'mixed-citation' },
    },
    excludes: 'mixedCitationSpan', // so we can't embed it inside itself
    parseDOM: [{ tag: 'span.mixed-citation' }],
    toDOM() {
      // const {
      //   pmViews: { main },
      // } = useContext(WaxContext)

      // const citationCount = getMixedCitations()
      // console.log('Citation count: ', citationCount)
      // TODO: This should send this to Crossref to get back content!
      // TODO: count how many mixed-citations are in the document and add a number to the end of the ID
      return [
        'span',
        {
          class: 'mixed-citation',
          title: 'Mixed Citation',
          // id: `mixed-citation-${citationCount}`, // can we have a function in here
        },
        0,
      ]
    },
  },

  articleTitle: {
    attrs: {
      class: { default: 'article-title' },
    },
    group: 'citationMarks',
    excludes: 'citationMarks',
    parseDOM: [{ tag: 'span.article-title' }],
    toDOM() {
      return ['span', { class: 'article-title', title: 'Article Title' }, 0]
    },
  },

  journalTitle: {
    attrs: {
      class: { default: 'journal-title' },
    },
    group: 'citationMarks',
    excludes: 'citationMarks',
    parseDOM: [{ tag: 'span.journal-title' }],
    toDOM() {
      return ['span', { class: 'journal-title', title: 'Journal Title' }, 0]
    },
  },

  authorGroup: {
    attrs: {
      class: { default: 'author-group' },
    },
    group: 'citationMarks',
    excludes: 'authorGroup', // so we can't embed it inside itself
    parseDOM: [{ tag: 'span.author-group' }],
    toDOM() {
      return ['span', { class: 'author-group', title: 'Author Group' }, 0]
    },
  },

  authorName: {
    attrs: {
      class: { default: 'author-name' },
    },
    group: 'citationMarks',
    excludes: 'citationMarks',
    parseDOM: [{ tag: 'span.author-name' }],
    toDOM() {
      return ['span', { class: 'author-name', title: 'Author Name' }, 0]
    },
  },

  citationLabel: {
    attrs: {
      class: { default: 'citation-label' },
    },
    group: 'citationMarks',
    excludes: 'citationMarks',
    parseDOM: [{ tag: 'span.citation-label' }],
    toDOM() {
      return ['span', { class: 'citation-label', title: 'Citation Label' }, 0]
    },
  },

  volume: {
    attrs: {
      class: { default: 'volume' },
    },
    group: 'citationMarks',
    excludes: 'citationMarks',
    parseDOM: [{ tag: 'span.volume' }],
    toDOM() {
      return ['span', { class: 'volume', title: 'Volume' }, 0]
    },
  },

  issue: {
    attrs: {
      class: { default: 'issue' },
    },
    group: 'citationMarks',
    excludes: 'citationMarks',
    parseDOM: [{ tag: 'span.issue' }],
    toDOM() {
      return ['span', { class: 'issue', title: 'Issue' }, 0]
    },
  },

  year: {
    attrs: {
      class: { default: 'year' },
    },
    group: 'citationMarks',
    excludes: 'citationMarks',
    parseDOM: [{ tag: 'span.year' }],
    toDOM() {
      return ['span', { class: 'year', title: 'Year' }, 0]
    },
  },

  firstPage: {
    attrs: {
      class: { default: 'first-page' },
    },
    group: 'citationMarks',
    excludes: 'citationMarks',
    parseDOM: [{ tag: 'span.first-page' }],
    toDOM() {
      return ['span', { class: 'first-page', title: 'First Page' }, 0]
    },
  },

  lastPage: {
    attrs: {
      class: { default: 'last-page' },
    },
    group: 'citationMarks',
    excludes: 'citationMarks',
    parseDOM: [{ tag: 'span.last-page' }],
    toDOM() {
      return ['span', { class: 'last-page', title: 'Last Page' }, 0]
    },
  },

  doi: {
    // QUESTION: this should set the content as the href. Does it do that?
    attrs: {
      href: { default: null },
      rel: { default: '' },
      target: { default: 'blank' },
      title: { default: null },
      class: { default: 'doi' },
    },
    group: 'citationMarks',
    excludes: 'citationMarks',
    inclusive: false, // see: https://prosemirror.net/examples/schema/
    parseDOM: [
      // but see https://github.com/Coko-Foundation/wax-prosemirror/blob/master/wax-prosemirror-services/src/LinkService/schema/linkMark.js
      {
        tag: 'a.doi',
        getAttrs(dom: HTMLElement): { href: string } {
          return { href: (dom as HTMLAnchorElement).href }
        },
      },
    ],
    toDOM() {
      // TODO: figure out how to get the href to go to the content?
      return ['a', { class: 'doi', href: '', title: 'DOI' }, 0]
    },
    // // this causes an error – why?
    // toDOM(hook, next) {
    //   // eslint-disable-next-line no-param-reassign
    //   hook.value = ['a', hook?.node?.attrs, 0]
    //   next()
    // },
  },

  keyword: {
    attrs: {
      class: { default: 'keyword' },
    },
    excludes: 'keyword',
    parseDOM: [{ tag: 'span.keyword' }],
    toDOM() {
      return ['span', { class: 'keyword', title: 'Keyword' }, 0]
    },
  },

  glossaryTerm: {
    attrs: {
      class: { default: 'glossary-term' },
    },
    excludes: 'glossaryTerm',
    parseDOM: [{ tag: 'span.glossary-term' }],
    toDOM() {
      return ['span', { class: 'glossary-term', title: 'Glossary term' }, 0]
    },
  },
}

export type JatsCommand = {
  run: Command
  isActive: (state: EditorState) => boolean
}

const hasNode =
  (name: string) =>
  (state: EditorState): boolean => {
    const { from, to } = state.selection
    let found = false

    state.doc.nodesBetween(from, to, node => {
      if (node.type.name === name) found = true
    })

    return found
  }

const section = (name: string): JatsCommand => ({
  run: (state, dispatch) => wrapIn(state.schema.nodes[name])(state, dispatch),
  isActive: hasNode(name),
})

const block = (name: string): JatsCommand => ({
  run: (state, dispatch) =>
    setBlockType(state.schema.nodes[name])(state, dispatch),
  isActive: hasNode(name),
})

const mark = (name: string): JatsCommand => ({
  run: toggleMarkByName(name),
  isActive: (state): boolean => markActive(state.schema.marks[name])(state),
})

export const jatsCommands = {
  frontMatter: section('frontMatter'),
  abstract: section('abstractSection'),
  fundingSource: block('fundingSource'),
  awardId: block('awardId'),
  fundingStatement: block('fundingStatement'),
  keywordList: block('keywordList'),
  keyword: mark('keyword'),
  appendix: section('appendix'),
  acknowledgements: section('acknowledgementsSection'),
  glossarySection: section('glossarySection'),
  glossaryTerm: mark('glossaryTerm'),
  refList: section('refList'),
}

const jatsTags: WaxFeature = {
  name: 'jatsTags',
  nodes: jatsNodes,
  marks: jatsMarks,
}

export default jatsTags
