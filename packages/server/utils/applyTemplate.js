const path = require('path')
const fs = require('fs-extra').promises
const nunjucks = require('nunjucks')
const { logger } = require('@coko/server')
// const cheerio = require('cheerio')
const publicationMetadata = require('./pdfTemplates/publicationMetadata')
const articleMetadata = require('./pdfTemplates/articleMetadata')
const makeSvgsFromLatex = require('../services/jatsexport/makeSvgsFromLatex')
const { updateSrcUrl } = require('./fileStorageUtils')
const njkFilters = require('./pdfTemplates/njkFilters')

// const fixMathTags = html => {
//   const $ = cheerio.load(html)
//   $('math-display').replaceWith((index, el) => {
//     const content = $(el).html()
//     return `<p><span class="math display">$$${content}$$</span></p>`
//   })
//   $('math-inline').replaceWith((index, el) => {
//     const content = $(el).html()
//     return `<span class="math inline">$${content}$</span>`
//   })
//   return $.html()
// }

//  Sort out all the different CSSes and make sure that they are being applied correctly
//    ./pdfTemplates/styles.css: this is from Julien & Harshna, used for PDF export
//    /app/components/wax-collab/src/layout/EditorElements.js: this exports styles
//			split this into base styles & editor styles
//        for wax: import base styles, then editor styles
//        for production: import base styles, then pagedjs styles

const defaultTemplatePath = path.resolve(__dirname, 'pdfTemplates')

const userTemplatePath = path.resolve(__dirname, '../../config/journal/export')

const generateCss = async noPagedJs => {
  // if noPagedJs is true, we don't add the pagedJS styles (this is for the text editor)
  let outputCss = ''

  const defaultCssBuffer = await fs.readFile(
    `${defaultTemplatePath}/textStyles.css`,
  )

  outputCss += defaultCssBuffer.toString()

  try {
    const userCssBuffer = await fs.readFile(
      `${userTemplatePath}/textStyles.css`,
    )

    logger.error('Using user-defined text styles.')
    outputCss += userCssBuffer.toString()
  } catch {
    logger.error('No user text stylesheet found')
  }

  if (!noPagedJs) {
    try {
      const userCssBuffer = await fs.readFile(
        `${userTemplatePath}/pagedJsStyles.css`,
      )

      logger.error('Using user-defined PagedJS styles.')
      outputCss += userCssBuffer.toString()
    } catch {
      logger.error('No user PagedJS stylesheet found')

      const pagedCssBuffer = await fs.readFile(
        `${defaultTemplatePath}/pagedJsStyles.css`,
      )

      outputCss += pagedCssBuffer.toString()
    }
  }

  // logger.log('textStyles.css: ', outputCss)
  return outputCss
}

const defaultTemplateEnv = nunjucks.configure(defaultTemplatePath, {
  autoescape: true,
  cache: false,
})

const userTemplateEnv = nunjucks.configure(userTemplatePath, {
  autoescape: true,
  cache: false,
})

Object.entries(njkFilters).forEach(([name, filterFn]) => {
  defaultTemplateEnv.addFilter(name, filterFn)
  userTemplateEnv.addFilter(name, filterFn)
})

const applyTemplate = async (
  { articleData, groupData, activeConfig },
  includeFontLinks,
) => {
  if (!articleData) {
    // Error handling: if there's no manuscript.meta.source, what should we return?
    return ''
  }

  let template = {}
  let env = defaultTemplateEnv

  try {
    // if there is a group template use that
    if (groupData.article) {
      template.tmplStr = await updateSrcUrl(
        groupData.article.toString(),
        groupData.files,
        'full',
      )
    } else {
      // If there is a user template, use that instead
      template = userTemplateEnv.getTemplate('article.njk')
      env = userTemplateEnv
    }
    /* eslint-disable-next-line  */
  } catch (e) {
    logger.error('No user template found, using default')
    template = defaultTemplateEnv.getTemplate('article.njk')
    env = defaultTemplateEnv
  }

  const thisArticle = articleData
  // const htmlWithFixedMath = fixMathTags(articleData.meta.source)
  // If we're using non-PagedJS MathJax, don't fix math tags, run the code through makeSvgsFromLatex is in pdfExport
  const { svgedSource } = await makeSvgsFromLatex(articleData.meta.source, true)

  // add the metadata coming from the config of Kotahi
  // logger.log("this config", activeConfig.crossref)
  thisArticle.config = {
    groupIdentity: activeConfig.formData.groupIdentity,
    publishing: {
      journalName: activeConfig.formData.groupIdentity.title,
      journalAbbreviatedName:
        activeConfig.formData.groupIdentity.journalAbbreviatedName,
      journalHomepage:
        activeConfig.formData.publishing.crossref.journalHomepage,
      licenseUrl: activeConfig.formData.groupIdentity.licenseUrl,
    },
  }

  thisArticle.meta.source = svgedSource

  thisArticle.publicationMetadata = publicationMetadata
  thisArticle.articleMetadata = articleMetadata(thisArticle)
  // logger.log('thisArticle.articleMetadata: ', thisArticle.articleMetadata)

  const templateContext = { article: thisArticle }

  let renderedHtml

  if (template.tmplStr) {
    renderedHtml = env.renderString(template.tmplStr, templateContext)
  } else {
    renderedHtml = template.render(templateContext)
  }

  if (includeFontLinks) {
    renderedHtml = renderedHtml.replace(
      '</head>',
      `<link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,300;0,700;1,300;1,700&display=swap" rel="stylesheet">
    </head>`,
    )
  }

  renderedHtml = renderedHtml.replace(/\n|\r|\t/g, '')
  return renderedHtml
}

module.exports = { applyTemplate, generateCss }
