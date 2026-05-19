/* eslint-disable no-unused-expressions */

import { mapEntries, onEntries } from '../../../shared/generalUtils'

export const srcdoc = (scope, css, template, scrollPos) => /* html */ `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js"></script>
      <style>
        ${template}
        ${css.replace('#body', 'body') || ''}
      </style>
    </head>
    <body>
      ${scope.outerHTML.replace('contenteditable="true"', '')}
      <script>
        document.addEventListener("DOMContentLoaded", () => {
          const scopeIsReady = document.getElementById("css-assistant-scope")

          try {
            scopeIsReady && PagedPolyfill.preview(scopeIsReady);
          }
          catch (e) { window.parent.console.log(e) }
          setTimeout(() => document.documentElement.scrollTo(0, ${scrollPos}), 100)
        });
          document.addEventListener("scroll", () => {
            if(document.documentElement.scrollTop < 10) {
              document.documentElement.scrollTo(0, 10)
            }
          })
      </script>
    </body>
    </html>
`

export const removeStyleAttribute = (node, recursive = true) => {
  if (!node) return
  node.removeAttribute('style')
  if (!recursive) return
  const childs = [...node.children]
  childs.length > 0 && childs.forEach(removeStyleAttribute)
}

// can be useful for setting the inlinestyles
export const cssStringToObject = cssString => {
  const cssObject = {}

  if (cssString.includes('{')) {
    const ruleSets = cssString.split('}')

    ruleSets.forEach(ruleSet => {
      if (!ruleSet) return
      const [selector = '', rules = ''] = ruleSet.split('{')

      const trimmedSelector = selector.trim()
      const trimmedRules = rules.trim().slice(0, -1)

      const declarations = trimmedRules.split(';')

      cssObject[trimmedSelector] = {}

      declarations.forEach(declaration => {
        const [property = '', value = ''] = declaration.split(':')

        if (property && value) {
          cssObject[trimmedSelector][property.trim()] = value.trim()
        }
      })
    })
  } else {
    cssString.split(';').forEach(rule => {
      const [ruleName, value] = rule.split(':')
      if (!ruleName || !value) return
      cssObject[ruleName.trim()] = value.trim()
    })
  }

  return cssObject
}

export const setInlineStyle = (node, styles) => {
  if (typeof styles === 'object' && !Array.isArray(styles)) {
    const nodeRef = node
    onEntries(styles, (k, v) => {
      nodeRef.style[k] = v
    })
  }
}

export const setImagesDefaultStyles = node => {
  ;['picture', 'img', 'figure'].includes(node.localName) &&
    setInlineStyle(node, {
      objectFit: 'contain',
      width: '100%',
      height: 'auto',
    })
}

export const snippetsToCssText = snippets =>
  mapEntries(
    snippets,
    (k, { description, ...v }) =>
      `${
        description ? `/* ${description} */\n` : ''
      }.aid-snip-${k} {\n${mapEntries(
        v,
        (rule, val) => `\t${toSnake(rule)}: ${val};`,
      ).join('\n')}\n}`,
  ).join('\n')

export const addSnippet = (snippet, name, snippetsKeys) => {
  const selector = safeId(name, snippetsKeys)
  return { [selector]: snippet }
}

export const updateSnippet = (name, newProps, allSnippets) => {
  const updatedSnippets = allSnippets
  if (!updatedSnippets[name]) return allSnippets
  newProps
    ? onEntries(newProps, (k, v) => {
        updatedSnippets[name][k] = v
      })
    : delete updatedSnippets[name]

  return updatedSnippets
}

export const addElement = (parentElement, options) => {
  const { position = 'afterend', html } = options
  parentElement.insertAdjacentHTML(position, html)
}

export const safeId = (prefix, existingIds) => {
  let proposedId = 1

  while (existingIds.includes(`${prefix}-${proposedId}`)) {
    proposedId += 1
  }

  return `${prefix}-${proposedId}`
}

export const toSnake = key =>
  key
    .split(/(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join('-')

export const getScrollPercent = node =>
  (node.scrollTop / (node.scrollHeight - node.offsetHeight)) * 100

export const setScrollFromPercent = (node, percentage) =>
  (percentage * node.scrollHeight) / 100

export const autoResize = element => {
  if (element) {
    const node = element
    node.style.height = 'auto'
    node.value.length < 45
      ? (node.style.height = `24px`)
      : (node.style.height = `${node.scrollHeight}px`)
  }
}
