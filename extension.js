'use strict'

const AgentConnector = require('./lib/agent-connector')
const AgentManager = require('./lib/agent-manager')
const { initAgentStatusbar } = require('./lib/agent-statusbar')
const { initAgentErrors } = require('./lib/agent-errors')

const { logInfo } = require('./lib/logger')('main')

function activate(context) {
  const connector = new AgentConnector()
  const agentManager = new AgentManager(connector)

  initAgentStatusbar(agentManager)
  initAgentErrors({ agentManager })

  logInfo('"ns-vsx-dashboard" is now active!')
}

function deactivate() { }

module.exports = { activate, deactivate }
