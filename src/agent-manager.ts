import { EventEmitter } from 'events'

import logger from './logger'
const { logDebug, logTrace } = logger('agent-manager')
import {
  IToolkitAPI,
  IToolkitAgentMetric,
  IToolkitAgent,
  IToolkitAgentInfo,
} from 'toolkit-zmq'

import AgentConnector from './agent-connector'

export default class AgentManager extends EventEmitter {
  _api!: IToolkitAPI
  _initialized: boolean;

  constructor(agentConnector: AgentConnector) {
    super()
    this._initialized = false
    this._bind()
    this._init(agentConnector)
  }

  get initialized(): boolean {
    return this._initialized
  }
  get agentIds(): Set<string> {
    return this._api.agentsIds
  }
  get agentCount(): number {
    return this.agentIds.size
  }
  get agents(): Map<string, IToolkitAgent> {
    return this._api.agents
  }
  get agentsJSON(): string {
    return JSON.stringify(Array.from(this.agents), null, 2)
  }
  get lastMetrics(): Map<string, IToolkitAgentMetric> {
    const lastMetrics = new Map()
    for (const [id, agent] of this.agents) {
      lastMetrics.set(id, { id, info: agent.info, metrics: agent.lastMetrics })
    }
    return lastMetrics
  }
  get lastMetricsJSON(): string {
    return JSON.stringify(Array.from(this.lastMetrics), null, 2)
  }

  agentInfo(id: string): IToolkitAgentInfo {
    return this._api.agentInfo(id)
  }

  agentMetrics(id: string): IToolkitAgentMetric | null {
    if (!this.agents.has(id)) return null
    const agent = this.agents.get(id)
    if (agent == null) return null
    return agent.lastMetrics
  }

  requestAgentInfo(id: string) {
    this._api.requestAgentInfo(id)
  }

  requestAgentCpuProfile(id: string) {
    this._api.requestCpuProfile(id)
  }

  requestAgentHeapProfile(id: string) {
    this._api.requestMemSnapshot(id)
  }

  _bind() {
    this._onagentAdded = this._onagentAdded.bind(this)
    this._onagentDied = this._onagentDied.bind(this)
    this._onagentInfoUpdated = this._onagentInfoUpdated.bind(this)
    this._onagentMetricsAdded = this._onagentMetricsAdded.bind(this)
    this._onagentCpuProfileAdded = this._onagentCpuProfileAdded.bind(this)
    this._onagentHeapProfileAdded = this._onagentHeapProfileAdded.bind(this)
  }

  _init(agentConnector : AgentConnector) {
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
      .on('agent:profile-added', this._onagentCpuProfileAdded)
      .on('agent:snapshot-added', this._onagentHeapProfileAdded)
  }

  _onagentAdded(id: string) {
    const info = this._api.agentInfo(id)
    logDebug('agent-added', id)
    this.emit('agent-manager:agent-added', { id, info })
  }

  _onagentDied(id: string) {
    const info = this._api.agentInfo(id)
    logDebug('agent-died', id)
    this.emit('agent-manager:agent-died', { id, info })
  }

  _onagentInfoUpdated(id: string) {
    const info = this._api.agentInfo(id)
    logDebug('agent-updated', id)
    this.emit('agent-manager:agent-info-updated', { id, info })
  }

  _onagentMetricsAdded(id: string) {
    const metrics = this._api.agentMetric(id)
    logTrace('agent-metrics', id)
    this.emit('agent-manager:agent-metrics-added', { id, metrics })
  }

  _onagentCpuProfileAdded(id: string) {
    const profile = this._api.agentProfile(id)
    this.emit('agent-manager:agent-cpu-profile-added', { id, profile })
  }

  _onagentHeapProfileAdded(id: string) {
    const profile = this._api.agentProfile(id)
    this.emit('agent-manager:agent-heap-profile-added', { id, profile })
  }
}
