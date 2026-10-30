import { describe, it, expect } from 'vitest'

import cleanConvertedDocx from '../cleanConvertedDocx'

describe('cleanConvertedDocx', () => {
  it('applies all rules to converted HTML', () => {
    const html = [
      'Loose intro',
      '<p>Text <span class="deletion">old</span><span class="insertion">new</span></p>',
      '<p><math-display>E=mc^2</math-display></p>',
      '<h2>Results<figure><img src="data:image/wmf;base64,AAAA"></figure></h2>',
    ].join('')

    expect(cleanConvertedDocx(html)).toBe(
      [
        '<p>Loose intro</p>',
        '<p>Text new</p>',
        '<math-display class="math-node">E=mc^2</math-display>',
        '<h2>Results</h2>',
        '<figure><img src="" alt="Broken image" data-original-name="broken-image"></figure>',
      ].join(''),
    )
  })
})
