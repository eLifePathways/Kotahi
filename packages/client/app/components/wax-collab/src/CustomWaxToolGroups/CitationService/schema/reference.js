import { v4 as uuidv4 } from 'uuid'

// TODO: In ../index.js, this is defined as a block. It's not going to work in footnotes; I think we might need to modify our existing MixedCitationSpan to work like this?

// const getTextFromNode = node => {
//   // TODO: it would be better to get marks with this, though I'm not sure how practically useful that would be.
//   let output = ''

//   if (node.content.content) {
//     output += getTextFromNode(node.content)
//   }

//   if (node.content.length) {
//     for (let i = 0; i < node.content.length; i += 1) {
//       if (node.content[i].text) {
//         output += node.content[i].text
//       }
//     }
//   }

//   return output
// }

const reference = {
  content: 'inline*',
  group: 'block', // 'block reference',
  // atom: true, // if we set this, we get a "focus" error
  // selectable: true,
  // draggable: true, // this may lead to bugs, though it can work.
  priority: 0,
  defining: true,
  attrs: {
    class: { default: 'ref' },
    refId: { default: '' },
    valid: { default: false },
    needsReview: { default: false },
    needsValidation: { default: true },
    structure: { default: '{}' },
    originalText: { default: '' },
    possibleStructures: { default: '{}' },
    citationNumber: { default: '' },
  },
  parseDOM: [
    {
      tag: 'p.ref',
      getAttrs(hook, next) {
        Object.assign(hook, {
          class: hook?.dom?.getAttribute('class'),
          refId: hook?.dom?.getAttribute('id'),
          valid: hook?.dom?.getAttribute('data-valid') === 'true',
          needsValidation: hook?.dom?.getAttribute('data-needs-validation')
            ? hook?.dom?.getAttribute('data-needs-validation') === 'true'
            : true,
          needsReview: hook?.dom?.getAttribute('data-needs-review') === 'true',
          structure: JSON.parse(
            hook?.dom?.getAttribute('data-structure') || '{}',
          ),
          possibleStructures: JSON.parse(
            hook?.dom?.getAttribute('data-possible-structures') || '{}',
          ),
          originalText: hook?.dom?.getAttribute('data-original-text') || '',
          citationNumber: hook?.dom?.getAttribute('data-citation-number') || '',
        })

        if (typeof next !== 'undefined') next()
      },
    },
  ],
  toDOM(hook, next) {
    const uuid = uuidv4()
    // Get the original text and save it.
    // const originalText = getTextFromNode(hook?.node)

    const attrs = {
      class: hook?.node?.attrs?.class,
      // class: 'ref',
      'data-valid': hook?.node?.attrs?.valid,
      'data-needs-validation': hook?.node?.attrs?.needsValidation,
      'data-needs-review': hook?.node?.attrs?.needsReview,
      'data-original-text': hook?.node?.attrs?.originalText, // || originalText,
      'data-citation-number': hook?.node?.attrs?.citationNumber,
      id: hook?.node?.attrs?.refId,
    }

    if (hook?.node?.attrs?.structure) {
      attrs['data-structure'] = JSON.stringify(hook?.node?.attrs?.structure)
    }

    if (hook?.node?.attrs?.possibleStructures) {
      attrs['data-possible-structures'] = JSON.stringify(
        hook?.node?.attrs?.possibleStructures,
      )
    }

    if (!hook?.node?.attrs?.refId) {
      hook.node.attrs.refId = uuid
      attrs.id = uuid
    }

    hook.value = ['p', attrs, 0]
    next()
  },
}

export default reference
