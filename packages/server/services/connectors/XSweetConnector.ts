import { config } from '@coko/server'

import CokoServiceConnector, {
  type CokoServiceConfig,
} from './CokoServiceConnector'

const XSWEET_TIMEOUT = 120000

class XSweetConnector extends CokoServiceConnector {
  constructor() {
    super(config.get('xsweet') as CokoServiceConfig, {
      timeout: XSWEET_TIMEOUT,
    })
  }

  async docxToHtml(file: Blob): Promise<string> {
    const form = new FormData()
    form.append('docx', file, 'file.docx')
    form.append('useMath', 'true')

    const data = await this.request<{ html: string }>(
      '/api/v1/sync/DOCXToHTML',
      { method: 'POST', body: form },
    )

    return data.html
  }
}

const xsweet = new XSweetConnector()

export default xsweet
