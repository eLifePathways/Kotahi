import { Service } from 'wax-prosemirror-core'
import Appendix from './Appendix'
import FrontMatter from './FrontMatter'
import Abstract from './Abstract'
import AcknowledgementsSection from './AcknowledgementSection'
import RefList from './citations/RefList'
import ArticleTitle from './citations/ArticleTitle'
import JournalTitle from './citations/JournalTitle'
import CitationLabel from './citations/CitationLabel'
import MixedCitationSpan from './citations/MixedCitationSpan'
import AuthorName from './citations/AuthorName'
import AuthorGroup from './citations/AuthorGroup'
import Volume from './citations/Volume'
import Issue from './citations/Issue'
import Doi from './citations/Doi'
import Year from './citations/Year'
import FirstPage from './citations/FirstPage'
import LastPage from './citations/LastPage'
import AwardId from './funding/AwardId'
import FundingSource from './funding/FundingSource'
import FundingStatement from './funding/FundingStatement'
import KeywordList from './keywords/KeywordList'
import Keyword from './keywords/Keyword'
import GlossarySection from './glossary/GlossarySection'
import GlossaryTerm from './glossary/GlossaryTerm'

class JatsTagsService extends Service {
  // boot() {}

  register() {
    this.container.bind('Appendix').to(Appendix)
    this.container.bind('RefList').to(RefList)
    this.container.bind('FrontMatter').to(FrontMatter)
    // this.container.bind('Title').to(Title)
    this.container.bind('Abstract').to(Abstract)
    this.container.bind('AwardId').to(AwardId)
    this.container.bind('FundingStatement').to(FundingStatement)
    this.container.bind('FundingSource').to(FundingSource)
    this.container.bind('AcknowledgementsSection').to(AcknowledgementsSection)
    this.container.bind('ArticleTitle').to(ArticleTitle)
    this.container.bind('JournalTitle').to(JournalTitle)
    this.container.bind('MixedCitationSpan').to(MixedCitationSpan)
    this.container.bind('AuthorName').to(AuthorName)
    this.container.bind('AuthorGroup').to(AuthorGroup)
    this.container.bind('CitationLabel').to(CitationLabel)
    this.container.bind('Doi').to(Doi)
    this.container.bind('Volume').to(Volume)
    this.container.bind('Issue').to(Issue)
    this.container.bind('Year').to(Year)
    this.container.bind('FirstPage').to(FirstPage)
    this.container.bind('LastPage').to(LastPage)
    this.container.bind('KeywordList').to(KeywordList)
    this.container.bind('Keyword').to(Keyword)
    this.container.bind('GlossarySection').to(GlossarySection)
    this.container.bind('GlossaryTerm').to(GlossaryTerm)
    const createNode = this.container.get('CreateNode')
    const createMark = this.container.get('CreateMark')

    createNode({
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
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'reflist',
              })
              if (typeof next !== 'undefined') next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = { class: hook.node?.attrs?.class || 'reflist' }
          return ['section', attrs, 0]
        },
      },
    })
    createNode({
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
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'appendix',
              })
              if (typeof next !== 'undefined') next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = { class: hook.node?.attrs?.class || 'appendix' }
          return ['section', attrs, 0]
        },
      },
    })
    createNode({
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
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'frontmatter',
              })
              if (typeof next !== 'undefined') next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = { class: hook.node?.attrs?.class || 'frontmatter' }
          return ['section', attrs, 0]
        },
      },
    })

    createNode({
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
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'awardid',
              })
              if (typeof next !== 'undefined') next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = {
            class: hook.node?.attrs?.class || 'awardid',
            title: 'Award ID',
          }

          return ['p', attrs, 0]
        },
      },
    })

    createNode({
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
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'fundingsource',
              })
              if (typeof next !== 'undefined') next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = {
            class: hook.node?.attrs?.class || 'fundingsource',
            title: 'Funding Source',
          }

          return ['p', attrs, 0]
        },
      },
    })

    createNode({
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
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'fundingstatement',
              })
              if (typeof next !== 'undefined') next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = {
            class: hook.node?.attrs?.class || 'fundingstatement',
            title: 'Funding Statement',
          }

          return ['p', attrs, 0]
        },
      },
    })

    createNode({
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
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'abstractSection',
              })
              if (typeof next !== 'undefined') next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = { class: hook.node?.attrs?.class || 'abstractSection' }
          return ['section', attrs, 0]
        },
      },
    })
    createNode({
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
            getAttrs(hook, next) {
              Object.assign(hook, {
                class:
                  hook?.dom?.getAttribute('class') || 'acknowledgementsSection',
              })
              if (typeof next !== 'undefined') next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = {
            class: hook.node?.attrs?.class || 'acknowledgementsSection',
          }

          return ['section', attrs, 0]
        },
      },
    })
    createNode({
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
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'keyword-list',
              })
              if (typeof next !== 'undefined') next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = {
            class: hook.node?.attrs?.class || 'keyword-list',
            title: 'Keyword list',
          }

          return ['p', attrs, 0]
        },
      },
    })
    createNode({
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
            getAttrs(hook, next) {
              Object.assign(hook, {
                class: hook?.dom?.getAttribute('class') || 'glossary',
              })
              if (typeof next !== 'undefined') next()
            },
          },
        ],
        toDOM(hook) {
          const attrs = { class: hook.node?.attrs?.class || 'glossary' }
          return ['section', attrs, 0]
        },
      },
    })
    // marks
    createMark({
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
    })
    createMark({
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
    })
    createMark({
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
    })
    createMark({
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
    })
    createMark({
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
    })
    createMark({
      citationLabel: {
        attrs: {
          class: { default: 'citation-label' },
        },
        group: 'citationMarks',
        excludes: 'citationMarks',
        parseDOM: [{ tag: 'span.citation-label' }],
        toDOM() {
          return [
            'span',
            { class: 'citation-label', title: 'Citation Label' },
            0,
          ]
        },
      },
    })
    createMark({
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
    })
    createMark({
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
    })
    createMark({
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
    })
    createMark({
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
    })
    createMark({
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
    })
    createMark({
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
            getAttrs(dom) {
              return { href: dom.href }
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
    })
    createMark({
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
    })
    createMark({
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
    })
  }
}

export default JatsTagsService
