import { EventEmitter } from 'events'
import { window } from 'vscode'
import { AgentManager } from './agent-manager'

export default class Profiler extends EventEmitter {
  _agentManager: AgentManager

  constructor(agentManager: AgentManager) {
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

  requestCpuProfile(id: string) {
    window.showInformationMessage('Requesting CPU profile')
    this._agentManager.requestAgentCpuProfile(id)
  }

  requestHeapProfile(id: string) {
    window.showInformationMessage('Requesting Heap profile')
    this._agentManager.requestAgentHeapProfile(id)
  }

  _oncpuProfileAdded() {
    window.showInformationMessage('Received CPU profile')
  }

  _onheapProfileAdded() {
    // TODO: heap profiling not working ATM (profile comes back empty)
    window.showInformationMessage('Received Heap profile')
  }
}
