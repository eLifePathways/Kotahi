import { callOn } from '../../../shared/generalUtils'

const { keys } = Object

/** The only argument is the GlobalState instance that will be created, 'handlebars' in this case */
const createHandlebarsState = _ => ({
  /** Array of handlebars variables to be displayed in the autocomplete dropdown, we set it's initial state to a empty array */
  variables: [],
  /** Config for 'prosemirror-autocomplete' */
  autocompleteConfig: {
    markName: 'handlebars_tag',
    className: 'handlebars',
    triggers: [
      {
        name: 'handlebars',
        trigger: /(\{\{)$/,
        decorationAttrs: { class: 'handlebars' },
      },
    ],
    reducer: action => {
      const { filter, range, view, kind } = action
      _.store({ range, view })

      const actions = {
        open: () => _.emit('open'),
        close: () => _.emit('close'),
        filter: () => _.emit('filter', filter),
        ArrowUp: () => _.emit('ArrowUp', kind),
        ArrowDown: () => _.emit('ArrowDown', kind),
        enter: () => _.emit('enter'),
      }

      const callback = () => {
        callOn(kind, actions)
        const success = !!keys(actions).includes(kind)
        return success
      }

      return callback()
    },
  },
})

export default createHandlebarsState
