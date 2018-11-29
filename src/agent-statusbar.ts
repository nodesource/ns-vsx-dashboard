import { window, StatusBarAlignment, StatusBarItem } from 'vscode'
import AgentManager from './agent-manager'
import { agentIcon } from './common'

const PRIORITY = 1000

export class AgentStatusbar {
  _agentManager: AgentManager
  _status!: StatusBarItem;

  constructor(agentManager: AgentManager) {
    this._agentManager = agentManager
    this._bind()

    this._initStatusbar()
    this._subscribeManagerEvents()
  }

  _bind() {
    this._updateAgents = this._updateAgents.bind(this)
  }

  _initStatusbar() {
    this._status = window.createStatusBarItem(StatusBarAlignment.Left, PRIORITY)
    this._status.command = 'ns-vsx-dashboard:toggle-agent-list'
    this._status.tooltip = 'Click to open Dashboard'
  }

  _subscribeManagerEvents() {
    this._agentManager
      .on('agent-manager:agent-added', this._updateAgents)
      .on('agent-manager:agent-died', this._updateAgents)
  }

  _updateAgents() {
    const count = this._agentManager.agentCount
    if (count > 0) {
      const plural = count > 1 ? 's' : ''
      this._status.text = ` ${count} N|Solid ${agentIcon}${plural} connected`
      this._status.show()
    } else {
      this._status.hide()
    }
  }
}

export function initAgentStatusbar(agentManager: AgentManager) {
  return new AgentStatusbar(agentManager)
}
