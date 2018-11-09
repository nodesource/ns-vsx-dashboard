'use strict'

const { join } = require('path')
const { writeFileSync } = require('fs')

const agentJSONFile = join(
  __dirname, '..', 'web', 'list', 'agents.json'
)

class Development {
  constructor({ agentManager }) {
    this._agentManager = agentManager
    this._agentManager
      .on('agent-manager:agent-added', ()  => this._onagentAdded())
  }

  _onagentAdded() {
    // this._saveAgentsJSON()
  }

  _saveLastMetricJSON() {
    const json = this._agentManager.lastMetricsJSON
    writeFileSync(agentJSONFile, json, 'utf8')
  }

  _saveAgentsJSON() {
    const json = this._agentManager.agentsJSON
    writeFileSync(agentJSONFile, json, 'utf8')
  }
}

function initDevelopment(opts) {
  return new Development(opts)
}

module.exports = {
    initDevelopment
  , Development
}
