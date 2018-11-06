'use strict'

const { join } = require('path')
const { writeFileSync } = require('fs')

class Development {
  constructor({ agentManager }) {
    this._agentManager = agentManager
    this._agentManager
      .on('agent-manager:agent-added', ()  => this._onagentAdded())
  }

  _onagentAdded() {
    // this._saveAgentsJSON()
  }

  _saveAgentsJSON() {
    const agentJSONFile = join(
      __dirname, '..', 'web', 'list', 'agents.json'
    )
    const json = this._agentManager.lastMetricsJSON
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
