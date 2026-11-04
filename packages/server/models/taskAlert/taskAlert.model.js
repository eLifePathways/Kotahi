const { BaseModel } = require('@coko/server')

// model
class TaskAlert extends BaseModel {
  static get tableName() {
    return 'task_alerts'
  }

  static get schema() {
    return {
      properties: {
        taskId: { type: 'string', format: 'uuid' },
        userId: { type: 'string', format: 'uuid' },
      },
    }
  }

  static async insertIgnoringDuplicates(alerts, options = {}) {
    return TaskAlert.query(options.trx)
      .insert(alerts)
      .onConflict(['taskId', 'userId'])
      .merge(['taskId'])
  }

  static async deleteByManuscriptId(manuscriptId, options = {}) {
    const Task = require('../task/task.model')
    const { trx } = options

    return TaskAlert.query(trx)
      .delete()
      .whereIn('taskId', Task.query(trx).select('id').where({ manuscriptId }))
  }

  static async deleteByTaskId(taskId, options = {}) {
    return TaskAlert.query(options.trx).delete().where({ taskId })
  }

  static async deleteByTaskIdAndUserIds(taskId, userIds, options = {}) {
    return TaskAlert.query(options.trx)
      .delete()
      .where({ taskId })
      .whereIn('userId', userIds)
  }
}

TaskAlert.type = 'TaskAlert'
module.exports = TaskAlert
