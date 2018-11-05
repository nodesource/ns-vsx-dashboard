'use strict'

const AgentConnector = require('./lib/agent-connector')
const AgentManager = require('./lib/agent-manager')
const { initAgentStatusbar } = require('./lib/agent-statusbar')
const { initAgentErrors } = require('./lib/agent-errors')

function activate(context) {
  console.log('"ns-vsx-dashboard" is now active!')

  const connector = new AgentConnector()
  const agentManager = new AgentManager(connector)

  initAgentStatusbar(agentManager)
  initAgentErrors({ agentManager })
}

function deactivate() { }

module.exports = { activate, deactivate }
