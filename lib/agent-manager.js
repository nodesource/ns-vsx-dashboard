'use strict'

const { EventEmitter } = require('events')
const { logDebug } = require('./logger')('agent-manager')

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
      .on('agent:metrics', this._onagentMetricsAdded)
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
    const metric = this._api.agentMetric(id)
    logDebug('agent-metrics', id)
    this.emit('agent-manager:agent-metrics-added', { metric, id })
  }
}

module.exports = AgentManager
