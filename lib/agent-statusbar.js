'use strict'

const { window, StatusBarAlignment } = require('vscode')
const PRIORITY = 1000

const { agentIcon } = require('./common')

class AgentStatusbar {
  constructor(agentManager) {
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

function initAgentStatusbar(agentManager) {
  return new AgentStatusbar(agentManager)
}

module.exports = {
    initAgentStatusbar
  , AgentStatusbar
}
