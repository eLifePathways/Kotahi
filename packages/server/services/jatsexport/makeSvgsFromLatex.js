const htmlparser2 = require('htmlparser2')
const cheerio = require('cheerio')
const mjAPI = require('mathjax-node')
const he = require('he')

const { logger } = require('@coko/server')

mjAPI.config({
  MathJax: {
    // traditional MathJax configuration
    // The following was used in the Nunjuks template when we were sending that to remote MathJax:
    // tex2jax: {
    // 	inlineMath: [ ['$','$'], ["\\\\(","\\\\)"] ],
    // 	processEscapes: true
    // }
  },
})
mjAPI.start()

const generateOutputXml = (input, rawMml, index) => {
  // JATS wants MathML with the mmml: namespace at the front of all of its tags

  const mml = rawMml
    .replace(/</g, '<mml:')
    .replace(/<mml:\//g, '</mml:')
    .replace(/<mml:!--/g, '<!--')

  return input
    .replace('<alternatives>', `<alternatives>${mml}`)
    .replace(
      `</alternatives>`,
      `<inline-graphic xlink:href="images/displayformula_${index}.svg" /></alternatives>`,
    )
    .replace(/<!--\[CDATA\[/g, '<![CDATA[')
    .replace(/\]\]-->/g, ']]>')
}

const mathJaxWrapper = latex =>
  mjAPI
    .typeset({
      math: latex,
      format: 'TeX', // or "inline-TeX", "MathML"
      svg: true, // or svg:true, or html:true
      mml: true,
    })
    .then(data => {
      return data
    })
    .catch(err => {
      logger.error('MathJax error:', err)
      return { errors: err }
    })

const convertMathJax = async latex => {
  const data = await mathJaxWrapper(latex)
  return data
}

const makeSvgsFromLatex = async (source, replaceHtml = false) => {
  // source is HTML as a string
  // if replaceHtml is TRUE, SVGs will be inserted inline into the HTML (for PDF generation)
  const inlineSvgList = []
  const displaySvgList = []
  const dom = htmlparser2.parseDocument(source)

  const $ = cheerio.load(dom, { xmlMode: true })

  // 1. go through the source and find all display equations

  const displayFormulas = $(
    replaceHtml ? 'math-display' : 'disp-formula',
  ).toArray()

  for (let i = 0; i < displayFormulas.length; i += 1) {
    const elem = displayFormulas[i]
    const internal = $(elem).html()
    const output = `<disp-formula>${internal}</disp-formula>`

    const latex = replaceHtml
      ? internal
      : internal.split('[CDATA[')[1].split(']]')[0]

    const decodedLatex = he.decode(latex)

    logger.error('Converting disp-formula: ', decodedLatex)
    // eslint-disable-next-line no-await-in-loop
    const data = await convertMathJax(decodedLatex)

    if (!data.errors) {
      displaySvgList[i] = data.svg

      const replacement = replaceHtml
        ? data.svg
        : generateOutputXml(output, data.mml, i)

      $(elem).replaceWith(replacement)
      // console.log('replaced display formula!')
    }
  }

  // 2. go through the source and find all inline equations

  const inlineFormulas = $(
    replaceHtml ? 'math-inline' : 'inline-formula',
  ).toArray()

  for (let i = 0; i < inlineFormulas.length; i += 1) {
    const elem = inlineFormulas[i]
    const internal = $(elem).html()
    const output = `<inline-formula>${internal}</inline-formula>`

    const latex = replaceHtml
      ? internal
      : internal.split('[CDATA[')[1].split(']]')[0]

    logger.error('Converting inline-formula: ', latex)
    // eslint-disable-next-line no-await-in-loop
    const data = await convertMathJax(latex)

    if (!data.errors) {
      inlineSvgList[i] = data.svg

      const replacement = replaceHtml
        ? data.svg
        : generateOutputXml(output, data.mml, i)

      $(elem).replaceWith(replacement)
      // console.log('replaced inline formula!')
    }
  }

  // 4. return the modified source and an array of SVG files as strings

  const displayList = displaySvgList.map((svg, index) => {
    return { name: `displayformula_${index}.svg`, svg }
  })

  const inlineList = inlineSvgList.map((svg, index) => {
    return { name: `inlineformula_${index}.svg`, svg }
  })

  const svgList = [...displayList, ...inlineList]

  // added to keep titles with tags from screwing up

  $('title').replaceWith((index, el) => {
    const $elem = $(el)
    const titleText = $elem.text()
    const outHtml = `<title>${titleText}</title>`
    return outHtml
  })

  const finalXml = $.html()
  const output = { svgedSource: finalXml, svgList }
  // console.log('returning!')
  return output
}

module.exports = makeSvgsFromLatex
