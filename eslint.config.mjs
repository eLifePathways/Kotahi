import { defineEslintConfig, rootEslintConfig } from '@coko/lint'

const config = defineEslintConfig(rootEslintConfig)

const extraIgnores = ['./packages/devdocs/', '.ux/']

const globalIgnoresObject = config.find(o => o.name?.includes('globalIgnores'))
globalIgnoresObject.ignores = [...globalIgnoresObject.ignores, ...extraIgnores]

const getOutermostChainCall = node => {
  let current = node

  while (
    current.parent?.type === 'MemberExpression' &&
    current.parent.object === current &&
    current.parent.parent?.type === 'CallExpression' &&
    current.parent.parent.callee === current.parent
  ) {
    current = current.parent.parent
  }

  return current
}

const createSelectorRule = ({
  description,
  message,
  selectors,
  getReportNode = node => node,
}) => {
  const optionNames = [
    ...new Set(selectors.map(s => s.allowedBy).filter(Boolean)),
  ]

  return {
    meta: {
      type: 'problem',
      docs: { description },
      schema: [
        {
          type: 'object',
          properties: Object.fromEntries(
            optionNames.map(name => [name, { type: 'boolean' }]),
          ),
          additionalProperties: false,
        },
      ],
      messages: { restricted: message },
    },
    create: context => {
      const options = context.options[0] || {}
      const reported = new WeakSet()

      const report = matchedNode => {
        const node = getReportNode(matchedNode)
        if (reported.has(node)) return
        reported.add(node)
        context.report({ node, messageId: 'restricted' })
      }

      return Object.fromEntries(
        selectors
          .map(s => (typeof s === 'string' ? { selector: s } : s))
          .filter(({ allowedBy }) => !(allowedBy && options[allowedBy]))
          .map(({ selector }) => [selector, report]),
      )
    },
  }
}

const kotahiPlugin = {
  rules: {
    'no-objection-imports': createSelectorRule({
      description:
        'Disallow importing Objection, knex or the db instance outside packages/server/models',
      message:
        'Objection/knex imports belong in the models folder. Add a model method instead.',
      selectors: [
        "CallExpression[callee.name='require'][arguments.0.value=/^(objection|knex)$/]",
        'ImportDeclaration[source.value=/^(objection|knex)$/]',
        {
          selector:
            "VariableDeclarator[init.callee.name='require'][init.arguments.0.value='@coko/server'] > ObjectPattern > Property[key.name='db']",
          allowedBy: 'allowDb',
        },
        {
          selector:
            "MemberExpression[object.callee.name='require'][object.arguments.0.value='@coko/server'][property.name='db']",
          allowedBy: 'allowDb',
        },
        {
          selector:
            "ImportDeclaration[source.value='@coko/server'] > ImportSpecifier[imported.name='db']",
          allowedBy: 'allowDb',
        },
      ],
    }),
    'no-query-builder-calls': createSelectorRule({
      description:
        'Disallow Objection/knex query builder calls outside packages/server/models',
      message:
        'Objection/knex calls belong in the models folder. Add a model method instead.',
      getReportNode: getOutermostChainCall,
      selectors: [
        'CallExpression[callee.property.name=/^(query|relatedQuery|knex|bindKnex)$|^\\$/]',
        'CallExpression[callee.property.name=/^(where|andWhere|orWhere|whereIn|whereNotIn|whereNot|whereNull|whereNotNull|whereRaw|whereExists|whereJsonSupersetOf|orderBy|groupBy|having|first|resultSize|forUpdate|forShare|returning|patchAndFetch|joinRelated|leftJoinRelated|innerJoin|leftJoin|withGraphFetched|withGraphJoined|modify|upsertGraph|upsertGraphAndFetch|insertGraph|insertGraphAndFetch|raw)$/]',
        'CallExpression[callee.name=/^(db|knex|trx)$/]',
        "CallExpression[callee.object.name=/^(knex|trx)$/], CallExpression[callee.object.name='db']:not([callee.property.name=/^(init|destroy)$/])",
        {
          selector:
            "CallExpression[callee.object.name='db'][callee.property.name=/^(init|destroy)$/]",
          allowedBy: 'allowDbLifecycle',
        },
      ],
    }),
  },
}

config.push(
  {
    name: 'kotahi/objection-only-in-models',
    files: ['packages/server/**/*.{js,ts}'],
    ignores: ['packages/server/models/**'],
    plugins: { kotahi: kotahiPlugin },
    rules: {
      'kotahi/no-objection-imports': 'warn',
      'kotahi/no-query-builder-calls': 'warn',
    },
  },
  {
    name: 'kotahi/objection-only-in-models/tests',
    files: ['packages/server/**/__tests__/**/*.{js,ts}'],
    ignores: ['packages/server/models/**'],
    rules: {
      'kotahi/no-objection-imports': ['warn', { allowDb: true }],
      'kotahi/no-query-builder-calls': ['warn', { allowDbLifecycle: true }],
    },
  },
)

export default config
