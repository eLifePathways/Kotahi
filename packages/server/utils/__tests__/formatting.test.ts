import { describe, beforeAll, beforeEach, it, expect, afterAll } from 'vitest'
import { db, config, migrationManager, DbTestUtils } from '@coko/server'

import { formatCitation } from '../reference'
import { Config, Group } from '../../models'

const doiResult = {
  doi: '10.1159/000345136',
  author: [
    { given: 'José A.', family: 'Luchsinger', sequence: 'first' },
    { given: 'Mary L.', family: 'Biggs', sequence: 'additional' },
    { given: 'Jorge R.', family: 'Kizer', sequence: 'additional' },
    { given: 'Joshua', family: 'Barzilay', sequence: 'additional' },
    { given: 'Annette', family: 'Fitzpatrick', sequence: 'additional' },
    { given: 'Anne', family: 'Newman', sequence: 'additional' },
    {
      given: 'William T.',
      family: 'Longstreth',
      sequence: 'additional',
    },
    { given: 'Oscar', family: 'Lopez', sequence: 'additional' },
    { given: 'David', family: 'Siscovick', sequence: 'additional' },
    { given: 'Lewis', family: 'Kuller', sequence: 'additional' },
  ],
  page: '274-281',
  issue: '4',
  volume: '40',
  title: 'Adiposity and Cognitive Decline in the Cardiovascular Health Study',
  journalTitle: 'Neuroepidemiology',
}

const formattedResult =
  '<p class="ref">Luchsinger, J. A., Biggs, M. L., Kizer, J. R., Barzilay, J., Fitzpatrick, A., Newman, A., … Kuller, L. (n.d.). <em>Adiposity and Cognitive Decline in the Cardiovascular Health Study</em>. https://doi.org/10.1159/000345136</p>'

describe('checkFormatting', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
    await db.destroy()
  })

  // Note that this test is dependent on the styleguide & locale passed to formatCitation being what was
  // used to create formattedResult. If the styleguide or locale changes, this test will fail.
  it('formatted correctly', async () => {
    const group = await Group.insert({})

    await Config.insert({
      groupId: group.id,
      active: true,
      formData: {},
    })

    // This is being done to get an async result in the test, which might not be async?
    const response1 = await formatCitation(doiResult, group.id)
    expect(response1?.result).toEqual(formattedResult)
  })
})
