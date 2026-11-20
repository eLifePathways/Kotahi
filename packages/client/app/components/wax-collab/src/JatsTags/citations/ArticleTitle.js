import { decorate, injectable } from 'inversify'
import { Commands, Tools } from '../../../../../ui/wax/wax-prosemirror-core'
import removeOrToggleMark from '../removeOrToggleMark'

class ArticleTitle extends Tools {
  title = 'Change to article title' // TODO: can I make this change dynamcically?
  label = 'Article title'
  color = 'colorArticleTitle'
  className = 'article-title'
  // icon = 'title'
  name = 'ArticleTitle'

  get run() {
    return (state, dispatch) => {
      removeOrToggleMark(state, dispatch, 'articleTitle')
    }
  }

  select = state => {
    const {
      selection: { from },
    } = state

    if (from === null) return false
    return true
  }

  get active() {
    return state => {
      return Commands.markActive(state.config.schema.marks.articleTitle)(state)
    }
  }
}

decorate(injectable(), ArticleTitle)

export default ArticleTitle
