'use strict'

const { window } = require('vscode')
const { EventEmitter } = require('events')
// const { logDebug, logTrace } = require('./logger')('agent-manager')

class Profiler extends EventEmitter {
  constructor(agentManager) {
    super()
    this._agentManager = agentManager
    this._bind()
    this._subscribeEvents()
  }

  _bind() {
    this._oncpuProfileAdded = this._oncpuProfileAdded.bind(this)
    this._onheapProfileAdded = this._onheapProfileAdded.bind(this)
  }

  _subscribeEvents() {
    this._agentManager
      .on('agent-manager:agent-cpu-profile-added', this._oncpuProfileAdded)
      .on('agent-manager:agent-heap-profile-added', this._onheapProfileAdded)
  }

  requestCpuProfile(id) {
    window.showInformationMessage('Requesting CPU profile')
    this._agentManager.requestAgentCpuProfile(id)
  }

  requestHeapProfile(id) {
    window.showInformationMessage('Requesting Heap profile')
    this._agentManager.requestAgentHeapProfile(id)
  }

  _oncpuProfileAdded({ id, profile }) {
    window.showInformationMessage('Received CPU profile')
  }

  _onheapProfileAdded({ id, profile }) {
    // TODO: heap profiling not working ATM (profile comes back empty)
    window.showInformationMessage('Received Heap profile')
  }
}

module.exports = Profiler
