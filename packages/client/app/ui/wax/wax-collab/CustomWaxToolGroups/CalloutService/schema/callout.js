const callout = {
  group: 'inline',
  content: 'text*',
  inline: true,
  atom: true,
  attrs: {
    id: { default: '' },
    class: { default: 'callout' },
    citationItems: { default: [] },
    citationCalloutText: { default: '[?]' },
  },
  parseDOM: [
    {
      tag: 'span.callout',
      getAttrs(hook, next) {
        Object.assign(hook, {
          id: hook?.dom?.getAttribute('id'),
          class: hook?.dom?.getAttribute('class'),
          citationItems: JSON.parse(
            hook?.dom?.getAttribute('data-citationitems'),
          ),
          citationCalloutText: hook?.dom?.getAttribute(
            'data-citationcallouttext',
          ),
        })

        if (typeof next !== 'undefined') next()
      },
    },
  ],
  toDOM(hook, next) {
    const attrs = {
      class: hook?.node?.attrs?.class,
      id: hook?.node?.attrs?.id,
      'data-citationitems': JSON.stringify(hook?.node?.attrs?.citationItems),
      'data-citationcallouttext': hook?.node?.attrs?.citationCalloutText,
    }

    hook.value = ['span', attrs, 0]
    next()
  },
}

export default callout
