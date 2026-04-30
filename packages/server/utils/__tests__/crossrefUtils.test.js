/* eslint-disable */

const { getCrossrefCitationsFromList } = require('../crossrefUtils')

describe('getCrossrefCitationsFromList', () => {
  test('example1', () => {
    expect(
      getCrossrefCitationsFromList(`
<p class="asdf">Doe, John (2010) "Role of CO<sub>2</sub> in global&nbsp;warming" in <i>Climate</i> 123:4.</p>
<ul>
  <li>Poop, Bo (2012) "E = mc<sup>2</sup>" in <i>Wooly Problems</i> 123:4.</li>
  <li><p class="someclass">Doo, Scooby (2014) "<span class="small-caps">blah blah</span>" in <i>Another Journal</i> 123:4.</p> (ignored extra text)</li>
</ul>
    `),
    ).toEqual([
      'Doe, John (2010) "Role of CO<sub>2</sub> in global&#xA0;warming" in <i>Climate</i> 123:4.',
      'Poop, Bo (2012) "E = mc<sup>2</sup>" in <i>Wooly Problems</i> 123:4.',
      'Doo, Scooby (2014) "<scp>blah blah</scp>" in <i>Another Journal</i> 123:4.',
    ])
  })
})
