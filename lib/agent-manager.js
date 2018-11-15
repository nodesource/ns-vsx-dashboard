'use strict'

const { EventEmitter } = require('events')
const { logDebug, logTrace } = require('./logger')('agent-manager')

class AgentManager extends EventEmitter {
  constructor(agentConnector) {
    super()
    this._api = null
    this._initialized = false
    this._bind()
    this._init(agentConnector)
  }

  get initialized() {
    return this._initialized
  }
  get agentIds() {
    return this._api.agentsIds
  }
  get agentCount() {
    return this.agentIds.size
  }
  get agents() {
    return this._api.agents
  }
  get agentsJSON() {
    return JSON.stringify(Array.from(this.agents), null, 2)
  }
  get lastMetrics() {
    const lastMetrics = new Map()
    for (const [ id, agent ] of this.agents) {
      lastMetrics.set(id, { id, info: agent.info,  metrics: agent.lastMetrics })
    }
    return lastMetrics
  }
  get lastMetricsJSON() {
    return JSON.stringify(Array.from(this.lastMetrics), null, 2)
  }

  agentInfo(id) {
    return this._api.agentInfo(id)
  }

  agentMetrics(id) {
    if (!this.agents.has(id)) return null
    const agent = this.agents.get(id)
    if (agent == null) return null
    return agent.lastMetrics
  }

  requestAgentInfo(id) {
    this._api.requestAgentInfo(id)
  }

  _bind() {
    this._onagentAdded = this._onagentAdded.bind(this)
    this._onagentDied = this._onagentDied.bind(this)
    this._onagentInfoUpdated = this._onagentInfoUpdated.bind(this)
    this._onagentMetricsAdded = this._onagentMetricsAdded.bind(this)
  }

  _init(agentConnector) {
    agentConnector
      .on('agent-connector:initialized', api => {
        this._api = api
        this._initialized = true
        this._subscribeAgentEvents()
      })
      .on('agent-connector:error'
        , err => this.emit('agent-manager:connector-error', err)
      )
  }

  _subscribeAgentEvents() {
    this._api
      .on('agent:added', this._onagentAdded)
      .on('agent:died', this._onagentDied)
      .on('agent:info', this._onagentInfoUpdated)
      .on('agent:metrics-added', this._onagentMetricsAdded)
  }

  _onagentAdded(id) {
    const info = this._api.agentInfo(id)
    logDebug('agent-added', id)
    this.emit('agent-manager:agent-added', { id, info })
  }

  _onagentDied(id) {
    const info = this._api.agentInfo(id)
    logDebug('agent-died', id)
    this.emit('agent-manager:agent-died', { id, info })
  }

  _onagentInfoUpdated(id) {
    const info = this._api.agentInfo(id)
    logDebug('agent-updated', id)
    this.emit('agent-manager:agent-info-updated', { id, info })
  }

  _onagentMetricsAdded(id) {
    const metrics = this._api.agentMetric(id)
    logTrace('agent-metrics', id)
    this.emit('agent-manager:agent-metrics-added', { id, metrics })
  }
}

module.exports = AgentManager
