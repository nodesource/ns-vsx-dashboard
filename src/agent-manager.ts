import { EventEmitter } from 'events'

import logger from './logger'
const { logDebug, logTrace } = logger('agent-manager')
import {
  IToolkitAgent,
  IToolkitAgentCpuProfile,
  IToolkitAgentInfo,
  IToolkitAgentMetric,
  IToolkitAPI
} from 'toolkit-zmq'

import AgentConnector from './agent-connector'

export const enum AgentManagerEvent {
  ConnectorError = 'agent-manager:connector-error',
  AgentDied = 'agent-manager:agent-died',
  AgentInfoUpdated = 'agent-manager:agent-info-updated',
  AgentMetricsAdded = 'agent-manager:agent-metrics-added',
  AgentCpuProfileAdded = 'agent-manager:agent-cpu-profile-added',
  AgentHeapProfileAdded = 'agent-manager:agent-heap-profile-added'
}

type ConnectorErrorListener = (err: Error) => void
type AgentInfoEventListener =
  (payload: { id: string, info: IToolkitAgentInfo }) => void
type AgentMetricEventListener =
  (payload: { id: string, metrics: IToolkitAgentMetric }) => void
type AgentProfileEventListener =
  (payload: { id: string, profile: IToolkitAgentCpuProfile }) => void

export interface IAgentManager {
  on(event: AgentManagerEvent.ConnectorError,
    listener: ConnectorErrorListener): this
  on(event:
    | AgentManagerEvent.AgentDied
    | AgentManagerEvent.AgentInfoUpdated,
    listener: AgentInfoEventListener): this
  on(event: AgentManagerEvent.AgentMetricsAdded,
    listener: AgentMetricEventListener): this
  on(event: AgentManagerEvent.AgentCpuProfileAdded,
    listener: AgentProfileEventListener): this
}

export class AgentManager extends EventEmitter implements IAgentManager {
  private _api!: IToolkitAPI
  private _initialized: boolean

  constructor(agentConnector: AgentConnector) {
    super()
    this._initialized = false
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

  private _init(agentConnector: AgentConnector) {
    agentConnector
      .on('agent-connector:initialized', api => {
        this._api = api
        this._initialized = true
        this._subscribeAgentEvents()
      })
      .on('agent-connector:error'
        , err => this.emit(AgentManagerEvent.ConnectorError, err)
      )
  }

  private _subscribeAgentEvents() {
    this._api
      .on('agent:added', this._onagentAdded)
      .on('agent:died', this._onagentDied)
      .on('agent:info', this._onagentInfoUpdated)
      .on('agent:metrics-added', this._onagentMetricsAdded)
      .on('agent:profile-added', this._onagentCpuProfileAdded)
      .on('agent:snapshot-added', this._onagentHeapProfileAdded)
  }

  private _onagentAdded = (id: string) => {
    const info = this._api.agentInfo(id)
    logDebug('agent-added', id)
    this.emit('agent-manager:agent-added', { id, info })
  }

  private _onagentDied = (id: string) => {
    const info = this._api.agentInfo(id)
    logDebug('agent-died', id)
    this.emit(AgentManagerEvent.AgentDied, { id, info })
  }

  private _onagentInfoUpdated = (id: string) => {
    const info = this._api.agentInfo(id)
    logDebug('agent-updated', id)
    this.emit(AgentManagerEvent.AgentInfoUpdated, { id, info })
  }

  private _onagentMetricsAdded = (id: string) => {
    const metrics = this._api.agentMetric(id)
    logTrace('agent-metrics', id)
    this.emit(AgentManagerEvent.AgentMetricsAdded, { id, metrics })
  }

  private _onagentCpuProfileAdded = (id: string) => {
    const profile = this._api.agentProfile(id)
    this.emit(AgentManagerEvent.AgentCpuProfileAdded, { id, profile })
  }

  private _onagentHeapProfileAdded = (id: string) => {
    const profile = this._api.agentProfile(id)
    this.emit(AgentManagerEvent.AgentHeapProfileAdded, { id, profile })
  }
}
