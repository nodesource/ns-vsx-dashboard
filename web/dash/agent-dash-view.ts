import webviewHtml from '../../src/webview-html'

import { IToolkitAgentInfo, IToolkitAgentMetric } from 'toolkit-zmq'
import { ViewColumn, WebviewPanel, window } from 'vscode'
import AgentManager from '../../src/agent-manager'
import { unhandledCase } from '../../src/core'
import logger from '../../src/logger'
import {
  IProcessedAgentInfo,
  processAgentInfo
} from '../lib/process-agent-info'

const { logDebug } = logger('list-view')

interface IResponseMessage {
  event: 'log' | 'ready'
  id: string
  text?: string
}

interface IPostMessage {
  command: 'add-info' | 'add-metrics' | 'remove-agent'
  id: string
  info?: IProcessedAgentInfo
  metrics?: IToolkitAgentMetric
}

export default class AgentDashView {
  private _agentManager: AgentManager
  private _html: string
  private _panelDisposed: boolean = true
  private _active: boolean = false
  private _panel!: WebviewPanel
  private _agentId!: string

  constructor(agentManager: AgentManager) {
    this._bind()
    this._agentManager = agentManager
    this._html = this._webviewHtml()
    this._subscribeEvents()
  }

  _bind() {
    this._onwebviewMessage = this._onwebviewMessage.bind(this)
    this._onpanelDisposed = this._onpanelDisposed.bind(this)
  }

  _subscribeEvents() {
    this._agentManager
      .on('agent-manager:agent-metrics-added', ({ id, metrics }) => {
        this._onagentMetricsAdded(id, metrics)
      })
      .on('agent-manager:agent-died', ({ id }) => {
        this._onagentDied(id)
      })
  }

  showAgent(id: string) {
    this._agentId = id
    if (this._panelDisposed || this._panel == null || !this._panel.visible) {
      this.toggle()
    }
    this._activate()
  }

  toggle() {
    if (this._panelDisposed) {
      this._panel = window.createWebviewPanel(
        `n|s dashboard:agent ${this._agentId}`,
        `N|S Agent [${this._agentId.slice(0, 8)}..]`,
        ViewColumn.Active,
        { enableScripts: true }
      )
      this._panel.webview.html = this._html
      this._panel.onDidDispose(this._onpanelDisposed)
      this._panelDisposed = false
      this._panel.webview.onDidReceiveMessage(this._onwebviewMessage)
    } else if (this._panel.visible) {
      this._deactivate()
      this._panel.dispose()
    } else {
      this._panel.reveal()
    }
  }

  _activate() {
    logDebug('Activating agent-dash view')
    this._initAgent()
    this._active = true
  }

  _deactivate() {
    logDebug('Deactivating agent-dash view')
    this._active = false
  }

  _initAgent() {
    this._addInfo(this._agentManager.agentInfo(this._agentId))
    // TODO: replay metrics to preserve history
    // use timestamped agent.collectedMetrics and init chart accordingly
    this._addMetrics(this._agentManager.agentMetrics(this._agentId))
  }

  _addMetrics(metrics: IToolkitAgentMetric | null) {
    if (metrics == null) return
    this._postMessage({ command: 'add-metrics', id: this._agentId, metrics })
  }

  _addInfo(info: IToolkitAgentInfo) {
    if (info == null) return
    const processed = processAgentInfo(this._agentId, info)
    this._postMessage({
      command: 'add-info',
      id: this._agentId, info: processed
    })
  }

  _removeAgent(id: string) {
    this._postMessage({ command: 'remove-agent', id })
  }

  _postMessage(msg: IPostMessage) {
    if (this._panelDisposed) return
    this._panel.webview.postMessage(msg)
  }

  _webviewHtml() {
    return webviewHtml('dash')
  }

  _onwebviewMessage(msg: IResponseMessage) {
    const { event } = msg
    switch (event) {
      case 'log': {
        logDebug(msg.text)
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

  _onagentMetricsAdded(id: string, metrics: IToolkitAgentMetric) {
    if (!this._active || id !== this._agentId) return
    this._addMetrics(metrics)
  }

  _onagentDied(id: string) {
    if (!this._active || id !== this._agentId) return
    this._removeAgent(id)
  }
}
