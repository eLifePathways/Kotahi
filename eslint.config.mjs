import { defineEslintConfig, rootEslintConfig } from '@coko/lint'

const config = defineEslintConfig(rootEslintConfig)

const extraIgnores = ['./packages/devdocs/']

const globalIgnoresObject = config.find(o => o.name?.includes('globalIgnores'))
globalIgnoresObject.ignores = [...globalIgnoresObject.ignores, ...extraIgnores]

export default config
