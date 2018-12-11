import { EventEmitter } from 'events'
import { initZMQ, IToolkitAPI } from 'toolkit-zmq'

import logger from './logger'
const { logInfo } = logger('agent-connector')

export const enum AgentConnectorEvent {
  Initialized = 'agent-connector:initialized',
  Error = 'agent-connector:error'
}

export interface AgentConnector {
  on(event: AgentConnectorEvent.Initialized,
    listener: (api: IToolkitAPI) => void): this
  on(event: AgentConnectorEvent.Error,
    listener: (err: Error) => void): this
}

export class AgentConnector extends EventEmitter {
  constructor() {
    super()
    this._init()
  }

  private async _init() {
    try {
      const api = await initZMQ()
      logInfo('API initialized')
      this.emit(AgentConnectorEvent.Initialized, api)
    } catch (err) {
      this.emit(AgentConnectorEvent.Error, err)
    }
  }
}
