'use strict'

const { window } = require('vscode')

const defaultErrorIcon = '🚫'
const errorIcons = new Map([
  [ 'connector', '🔌' ]
])

class AgentErrors {
  constructor({ agentManager }) {
    this._agentManager = agentManager
    this._subscribeErrorEvents()
  }

  _subscribeErrorEvents() {
    this._agentManager
      .on('agent-manager:connector-error'
        , err => this._handleError('connector', err)
      )
  }

  _handleError(type, err) {
    const icon = errorIcons.has(type) ? errorIcons.get(type) : defaultErrorIcon
    console.error(err)
    window.showErrorMessage(`${icon} unable to connect to agent(s)`, err)
  }
}

function initAgentErrors(opts) {
  return new AgentErrors(opts)
}

module.exports = {
    initAgentErrors
  , AgentErrors
}
