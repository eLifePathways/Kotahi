import { ellipsis, emDash } from 'prosemirror-inputrules'

import type { WaxFeature } from './types'

const typography: WaxFeature = {
  name: 'typography',
  rules: () => [emDash, ellipsis],
}

export default typography
