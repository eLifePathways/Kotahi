const findReferenceNodeOptions = state => {
  const referenceOptions = []

  state.doc.nodesBetween(0, state.doc.content.size, node => {
    if (node.type.name === 'reference' && node.attrs.valid === true) {
      // console.log('structure', node.attrs.structure)
      const { refId, structure, originalText } = node.attrs

      // checking for bad data in reference list
      if (
        structure &&
        structure.author &&
        (structure.author[0].given || structure.author[0].family) &&
        structure.title &&
        structure.issued &&
        structure.formattedCitation
      ) {
        referenceOptions.push({
          ...structure,
          id: refId,
          originalText,
        })
      }
    }
  })

  return referenceOptions
}

const findReferenceNodes = state => {
  const references = {
    items: [],
  }

  state.doc.nodesBetween(0, state.doc.content.size, node => {
    if (node.type.name === 'reference' && node.attrs.valid === true) {
      // console.log(node.attrs.structure)
      const item = {
        id: node.attrs.refId,
        ...node.attrs.structure,
      }

      references.items.push(item)
    }
  })

  return references
}

const findCalloutNodes = state => {
  const callouts = []

  state.doc.nodesBetween(0, state.doc.content.size, node => {
    if (
      node.type.name === 'callout' &&
      node.attrs.citationItems &&
      node.attrs.citationItems.length > 0
    ) {
      // console.log(node.attrs)
      callouts.push({
        citationID: node.attrs.id,
        citationItems: node.attrs.citationItems,
      })
    }
  })

  return callouts
}

export { findCalloutNodes, findReferenceNodes, findReferenceNodeOptions }
