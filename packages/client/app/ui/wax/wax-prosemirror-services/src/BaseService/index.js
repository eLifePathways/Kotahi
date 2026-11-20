import UndoService from './UndoService/UndoService'
import RedoService from './RedoService/RedoService'
import BaseToolGroupService from './BaseToolGroupService/BaseToolGroupService'

export default [
  new UndoService(),
  new RedoService(),
  new BaseToolGroupService(),
]
