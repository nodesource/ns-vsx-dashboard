import { writeFileSync } from 'fs'
import { join } from 'path'
import { AgentManager } from './agent-manager'

type Options = { agentManager: AgentManager }

const agentJSONFile = join(
  __dirname, '..', 'web', 'list', 'agents.json'
)

export class Development {
  _agentManager: AgentManager

  constructor({ agentManager }: Options) {
    this._agentManager = agentManager
    this._agentManager
      .on('agent-manager:agent-added', () => this._onagentAdded())
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

export function initDevelopment(opts: Options) {
  return new Development(opts)
}
