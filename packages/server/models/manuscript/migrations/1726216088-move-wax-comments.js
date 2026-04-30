const { parse } = require('node-html-parser')

const { useTransaction } = require('@coko/server')

const Manuscript = require('../manuscript.model')

const spacer = (n = 1) => {
  return Array.from({ length: n }, () => '&nbsp;').join('')
}

const sanitizedDocument = input => {
  const doc = parse(input)

  doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(node => {
    node.set_content(node.innerHTML + spacer(2))
  })

  doc.querySelectorAll('p').forEach(node => {
    node.set_content(node.innerHTML + spacer(2))
  })

  doc.querySelectorAll('blockquote').forEach(node => {
    node.set_content(node.innerHTML + spacer(2))
  })

  doc.querySelectorAll('section').forEach(node => {
    node.set_content(node.innerHTML + spacer(2))
  })

  doc.querySelectorAll('figure').forEach(node => {
    node.set_content(node.innerHTML + spacer(2))
  })

  doc.querySelectorAll('math-display').forEach(node => {
    node.set_content(node.innerHTML + spacer(2))
  })

  doc.querySelectorAll('pre').forEach(node => {
    node.set_content(node.innerHTML + spacer(2))
  })

  doc.querySelectorAll('footnote').forEach(node => {
    node.set_content(node.innerHTML + spacer(2))
  })

  doc.querySelectorAll('code').forEach(node => {
    const shouldAddSpace = node.innerHTML.includes('\n')

    if (shouldAddSpace) {
      node.set_content(node.innerHTML + spacer(1))
    }
  })

  doc.querySelectorAll('math-inline').forEach(node => {
    node.set_content(node.innerHTML + spacer(2))
  })

  doc.querySelectorAll('table').forEach(node => {
    node.set_content(node.innerHTML + spacer(2))
  })

  doc.querySelectorAll('tbody').forEach(node => {
    node.set_content(node.innerHTML + spacer(2))
  })

  doc.querySelectorAll('tr').forEach(node => {
    node.set_content(spacer(2) + node.innerHTML)
  })

  doc.querySelectorAll('th').forEach(node => {
    node.set_content(spacer(2) + node.innerHTML)
  })

  doc.querySelectorAll('td').forEach(node => {
    node.set_content(spacer(2) + node.innerHTML)
  })

  // parse lists bottom to top to avoid nested lists being overwritten

  doc
    .querySelectorAll('li')
    .reverse()
    .forEach(node => {
      node.set_content(spacer(2) + node.innerHTML)
    })

  doc
    .querySelectorAll('ol')
    .reverse()
    .forEach(node => {
      node.set_content(node.innerHTML + spacer(2))
    })

  doc
    .querySelectorAll('ul')
    .reverse()
    .forEach(node => {
      node.set_content(node.innerHTML + spacer(2))
    })

  return doc
}

exports.up = async () => {
  const manuscripts = await Manuscript.find({})

  // const start = performance.now()

  await useTransaction(async trx => {
    await Promise.all(
      manuscripts.result.map(async manuscript => {
        const content = manuscript.meta?.source
        if (!content) return

        const root = parse(content)
        const commentNodes = root.querySelectorAll('[data-conversation]')
        const newCommentData = []

        commentNodes.forEach(node => {
          const id = node.getAttribute('data-id')
          const conversation = node.getAttribute('data-conversation')
          const viewId = node.getAttribute('data-viewId')
          const group = node.getAttribute('data-group')
          const title = node.getAttribute('data-title')

          const $$ = sanitizedDocument(content)

          const currentNode = $$.querySelector(`[data-id=${id}]`)
          const currentText = currentNode.text
          currentNode.set_content(`<span>${id}${currentNode.innerHTML}</span>`)

          const pure = $$.text.replace('\n', '')
          const startPosition = pure.indexOf(id) + 1
          const endPosition = startPosition + currentText.length

          const newComment = {
            id,
            from: startPosition,
            to: endPosition,
            data: {
              type: 'comment',
              pmFrom: startPosition,
              pmTo: endPosition,
              conversation: JSON.parse(conversation),
              title,
              group,
              viewId,
            },
          }

          newCommentData.push(newComment)
        })

        const metaObj = manuscript.meta
        metaObj.comments = newCommentData

        await manuscript.patch(
          {
            meta: metaObj,
          },
          { trx },
        )
      }),
    )
  })

  // const end = performance.now()
  // const durationInSeconds = (end - start) / 1000 // Convert to seconds
  // console.log('Finished in ', durationInSeconds)
}

exports.down = async () => {
  /**
   * No rollback needed. We do not delete the original data from the HTML.
   * This means that reverting to the old version of wax will pick up the old
   * data and render them as expected.
   */
}
