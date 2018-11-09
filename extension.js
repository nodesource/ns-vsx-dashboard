'use strict'

const { commands } = require('vscode')

const AgentConnector = require('./lib/agent-connector')
const AgentManager = require('./lib/agent-manager')
const AgentListView = require('./web/list/agent-list-view')
const { initDevelopment } = require('./lib/development')
const { initAgentStatusbar } = require('./lib/agent-statusbar')
const { initAgentErrors } = require('./lib/agent-errors')

const { logInfo } = require('./lib/logger')('main')

function activate(context) {
  const connector = new AgentConnector()
  const agentManager = new AgentManager(connector)

  initAgentStatusbar(agentManager)
  initAgentErrors({ agentManager })
  initDevelopment({ agentManager })

  const agentListView = new AgentListView(agentManager)
  const showSummaryCommand =
    commands.registerCommand(
        'ns-vsx-dashboard:toggle-agent-list'
      , () => agentListView.toggle()
    )
  context.subscriptions.push(showSummaryCommand)

  logInfo('"ns-vsx-dashboard" is now active!')
}

function deactivate() { }

module.exports = { activate, deactivate }
