import { EventEmitter } from 'events'
import { initZMQ } from 'toolkit-zmq'
import logger from './logger'
const { logInfo } = logger('agent-connector')

export default class AgentConnector extends EventEmitter {
  constructor() {
    super()
    this._init()
  }

  async _init() {
    try {
      const api = await initZMQ()
      logInfo('API initialized')
      this.emit('agent-connector:initialized', api)
    } catch (err) {
      this.emit('agent-connector:error', err)
    }
  }
}
