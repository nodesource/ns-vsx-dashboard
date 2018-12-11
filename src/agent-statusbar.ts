import { StatusBarAlignment, StatusBarItem, window } from 'vscode'
import { AgentManager, AgentManagerEvent } from './agent-manager'
import { agentIcon } from './common'

const PRIORITY = 1000

export class AgentStatusbar {
  private _agentManager: AgentManager
  private _status!: StatusBarItem

  constructor(agentManager: AgentManager) {
    this._agentManager = agentManager

    this._initStatusbar()
    this._subscribeManagerEvents()
  }

  private _initStatusbar() {
    this._status = window.createStatusBarItem(StatusBarAlignment.Left, PRIORITY)
    this._status.command = 'ns-vsx-dashboard:toggle-agent-list'
    this._status.tooltip = 'Click to open Dashboard'
  }

  private _subscribeManagerEvents() {
    this._agentManager
      .on(AgentManagerEvent.AgentAdded, this._updateAgents)
      .on(AgentManagerEvent.AgentDied, this._updateAgents)
  }

  private _updateAgents = () => {
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
