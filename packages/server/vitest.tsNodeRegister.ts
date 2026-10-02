/* eslint-disable-next-line import/no-extraneous-dependencies */
import { register } from 'ts-node'

register({
  transpileOnly: true,
  skipProject: true,
  compilerOptions: {
    module: 'commonjs',
    target: 'es2020',
    moduleResolution: 'node',
    esModuleInterop: true,
    allowJs: true,
    ignoreDeprecations: '6.0',
  },
})
