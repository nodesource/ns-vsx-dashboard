'use strict'

const { EventEmitter } = require('events')
const { initZMQ } = require('toolkit-zmq')

class AgentConnector extends EventEmitter {
  constructor() {
    super()
    this._init()
  }

  async _init() {
    try {
      const api = await initZMQ()
      this.emit('agent-connector:initialized', api)
    } catch (err) {
      this.emit('agent-connector:error', err)
    }
  }
}

module.exports = AgentConnector
