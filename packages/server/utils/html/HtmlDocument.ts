import { load, type CheerioAPI } from 'cheerio'

export type HtmlRule = ($: CheerioAPI) => void

class HtmlDocument {
  private readonly $: CheerioAPI

  constructor(html: string) {
    this.$ = load(html, null, false)
  }

  apply(rule: HtmlRule): this {
    rule(this.$)
    return this
  }

  toHtml(): string {
    return this.$.html()
  }
}

export default HtmlDocument
