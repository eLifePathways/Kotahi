const { logger } = require('@coko/server')

const Manuscript = require('../../models/manuscript/manuscript.model')

class DoiExistenceChecker {
  constructor(groupId, archiveStatus) {
    this.groupId = groupId
    this.archiveStatus = archiveStatus
  }

  async doiExists(doi, options = {}) {
    const { trx } = options

    if (this.timeoutId) clearTimeout(this.timeoutId)

    while (this.doiSet === 'wait')
      // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
      await new Promise(resolve => setTimeout(resolve, 50))

    if (!this.doiSet) {
      try {
        this.doiSet = 'wait' // Any other tasks trying to access simultaneously must wait until this becomes a proper Set with data loaded

        const dois = await Manuscript.getDoisInGroup(
          this.groupId,
          this.archiveStatus,
          { trx },
        )

        this.doiSet = new Set(dois)

        // TODO If the number of manuscripts is very large we may need to be more sophisticated:
        // e.g., we could use a bloom filter to detect possible matches and then hit the database to confirm.
      } catch (err) {
        logger.error(
          `Failed to populate set of ${
            this.archiveStatus ? 'archived ' : ''
          }DOIs for group ${this.groupId}:`,
        )
        logger.error(err)
        this.doiSet = null
        return false
      }
    }

    this.timeoutId = setTimeout(() => {
      this.doiSet = null
    }, 10000)

    return this.doiSet.has(doi)
  }
}

module.exports = { DoiExistenceChecker }
