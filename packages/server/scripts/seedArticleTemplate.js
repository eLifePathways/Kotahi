/* eslint-disable no-console */

const { useTransaction } = require('@coko/server')
const fs = require('fs').promises

const ArticleTemplate = require('../models/articleTemplate/articleTemplate.model')

// TODO: come up with predefined generic forms based on workflows
const ARTICLE_TEMPLATE_PATH = './config/cmsTemplateFiles/article-preview.njk'

const seed = async (group, options = {}) => {
  return useTransaction(
    async trx => {
      const groupId = group.id

      const existingTemplate = await ArticleTemplate.findOne(
        {
          groupId,
          isCms: true,
        },
        { trx },
      )

      if (existingTemplate?.article) {
        console.log(
          `    Group ${group.name} already has a CMS article template. Skipping.`,
        )
        return
      }

      const article = (await fs.readFile(ARTICLE_TEMPLATE_PATH)).toString()

      if (existingTemplate) {
        await ArticleTemplate.patchAndFetchById(
          existingTemplate.id,
          {
            article,
          },
          { trx },
        )
        console.log(`    Patched CMS article template for ${group.name}`)
        return
      }

      // Record is missing entirely; create it.
      await ArticleTemplate.insert(
        {
          groupId,
          isCms: true,
          article,
          css: '',
        },
        { trx },
      )

      console.log(`    Created CMS article template for ${group.name}`)
    },
    { trx: options.trx },
  )
}

module.exports = seed
