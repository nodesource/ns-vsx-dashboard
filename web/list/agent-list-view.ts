import { IToolkitAgentInfo, IToolkitAgentMetric } from 'toolkit-zmq'
import webviewHtml from '../../src/webview-html'

import prettyBytes from '@thlorenz/pretty-bytes'
import {
  IProcessedAgentInfo,
  processAgentInfo
} from '../lib/process-agent-info'

import { EventEmitter } from 'events'
import { ViewColumn, WebviewPanel, window } from 'vscode'
import {
  AgentInfoEventListener,
  AgentManagerEvent,
  AgentMetricEventListener,
  IAgentManager
} from '../../src/agent-manager'
import { unhandledCase } from '../../src/core'
import logger from '../../src/logger'

const { logDebug } = logger('list-view')

interface IPostMessage {
  command: 'add-info' | 'add-metrics' | 'remove-agent'
  id: string
  info?: IProcessedAgentInfo
  metrics?: IProcessedAgentMetric
}

interface IResponseMessage {
  event:
  | 'log'
  | 'agent-selected'
  | 'info-requested'
  | 'cpu-profile-requested'
  | 'ready'
  | 'heap-profile-requested'
  id: string
  text?: string
}

interface IProcessedAgentMetric {
  heapUsed: string
  activeRequests: number
  activeHandles: number
  cpu: number
}

function processAgentMetrics(
  metrics: IToolkitAgentMetric): IProcessedAgentMetric {
  const {
    heapUsed,
    activeRequests,
    activeHandles,
    cpu
  } = metrics

  return {
    heapUsed: prettyBytes(heapUsed),
    activeRequests,
    activeHandles,
    cpu: Math.round(cpu)
  }
}

export default class AgentListView extends EventEmitter {
  private _agentManager: IAgentManager
  private _html: string
  private _panelDisposed: boolean = true
  private _active: boolean = false
  private _panel!: WebviewPanel
  private _addedInfos: Map<string, IToolkitAgentInfo>

  constructor(agentManager: IAgentManager) {
    super()
    this._agentManager = agentManager
    this._html = this._webviewHtml()
    this._panelDisposed = true
    this._addedInfos = new Map()
    this._active = false
    this._subscribeEvents()
  }

  _subscribeEvents() {
    this._agentManager
      .on(AgentManagerEvent.AgentInfoUpdated, this._onagentInfoUpdated)
      .on(AgentManagerEvent.AgentMetricsAdded, this._onagentMetricsAdded)
      .on(AgentManagerEvent.AgentDied, this._onagentDied)
  }

  toggle() {
    if (this._panelDisposed) {
      this._panel = window.createWebviewPanel(
        'n|s dashboard:agents',
        'N|S Dashboard Agents',
        ViewColumn.Active,
        { enableScripts: true }
      )
      this._panel.webview.html = this._html
      this._panel.onDidDispose(this._onpanelDisposed)
      this._panelDisposed = false
      this._panel.webview.onDidReceiveMessage(this._onwebviewMessage)
      // We wait for the 'ready' message of the webview before activating
      // the connection to the agent manager
    } else if (this._panel.visible) {
      this._deactivate()
      this._panel.dispose()
    } else {
      this._panel.reveal()
    }
  }

  _activate() {
    logDebug('Activating agent-list view')
    this._initCurrentAgents()
    this._active = true
  }

  _deactivate() {
    logDebug('Deactivating agent-list view')
    this._active = false
  }

  _initCurrentAgents() {
    for (const [id, agent] of this._agentManager.agents) {
      this._addInfo(id, agent.info)
    }
    for (const [id, agent] of this._agentManager.agents) {
      this._addMetrics(id, agent.lastMetrics)
    }
  }

  _addInfo(id: string, info: IToolkitAgentInfo) {
    if (info == null) return
    // processing info and metrics to result here instead of in the webview
    // to send only the data that's consumed
    const processedInfo = processAgentInfo(id, info)
    this._postMessage({ command: 'add-info', id, info: processedInfo })
    this._addedInfos.set(id, info)
  }

  _addMetrics(id: string, metrics: IToolkitAgentMetric) {
    if (metrics == null) return
    const processedMetrics = processAgentMetrics(metrics)
    this._postMessage({ command: 'add-metrics', id, metrics: processedMetrics })

    if (this._addedInfos.has(id)) {
      this._addInfo(id, this._addedInfos.get(id)!)
    } else {
      this._enforceInfo(id)
    }
  }

  _enforceInfo(id: string) {
    const info = this._agentManager.agentInfo(id)
    if (info == null) return this._agentManager.requestAgentInfo(id)
    this._addInfo(id, info)
  }

  _removeAgent(id: string) {
    this._postMessage({ command: 'remove-agent', id })
  }

  _postMessage(msg: IPostMessage) {
    if (this._panelDisposed) return
    this._panel.webview.postMessage(msg)
  }

  _webviewHtml() {
    return webviewHtml('list')
  }

  _onwebviewMessage(msg: IResponseMessage) {
    const { event } = msg
    switch (event) {
      case 'log': {
        logDebug(msg.text)
        break
      }
      case 'agent-selected': {
        logDebug({ selected: msg.id })
        this.emit('agent-list:agent-selected', msg.id)
        break
      }
      case 'info-requested': {
        logDebug({ infoRequested: msg.id })
        break
      }
      case 'cpu-profile-requested': {
        logDebug({ requestedCpuProfile: msg.id })
        this.emit('agent-list:cpu-profile-requested', msg.id)
        break
      }
      case 'heap-profile-requested': {
        logDebug({ requestedHeapProfile: msg.id })
        this.emit('agent-list:heap-profile-requested', msg.id)
        break
      }
      case 'ready': {
        this._activate()
        break
      }
      default: unhandledCase(event)
    }
  }

  _onpanelDisposed() {
    this._panelDisposed = true
  }

  _onagentInfoUpdated: AgentInfoEventListener = ({ id, info }) => {
    if (this._active) this._addInfo(id, info)
  }

  _onagentMetricsAdded: AgentMetricEventListener = ({ id, metrics }) => {
    if (this._active) this._addMetrics(id, metrics)
  }

  _onagentDied: AgentInfoEventListener = ({ id }) => {
    if (this._active) this._removeAgent(id)
  }
}
