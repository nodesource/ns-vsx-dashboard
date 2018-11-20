'use strict'

const webviewHtml = require('../../lib/webview-html')

const processAgentInfo = require('../lib/process-agent-info')
const { logDebug } = require('../../lib/logger')('dash-view')
const { window, ViewColumn } = require('vscode')

class AgentDashView {
  constructor(agentManager) {
    this._bind()
    this._agentManager = agentManager
    this._html = this._webviewHtml()
    this._agentId = null
    this._panel = null
    this._panelDisposed = true
    this._app = null
  }

  _bind() {
    this._onwebviewMessage = this._onwebviewMessage.bind(this)
    this._onpanelDisposed = this._onpanelDisposed.bind(this)
  }

  showAgent(id) {
    this._agentId = id
    if (this._panelDisposed || this._panel == null || !this._panel.visible) {
      this.toggle()
    }
  }

  toggle() {
    if (this._panelDisposed) {
      this._panel = window.createWebviewPanel(
          `n|s dashboard:agent ${this._agentId}`
        , `N|S Agent [${this._agentId.slice(0, 8)}..]`
        , ViewColumn.Active
        , { enableScripts: true }
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
    this._agentManager
      .on('agent-manager:agent-metrics-added', ({ id, metrics }) => {
        this._onagentMetricsAdded(id, metrics)
      })
      .on('agent-manager:agent-died', ({ id, info }) => {
        this._onagentDied(id)
      })
  }

  _deactivate() {
    logDebug('Deactivating agent-dash view')
    this._agentManager.removeAllListeners()
  }

  _initAgent() {
    this._addInfo(this._agentManager.agentInfo(this._agentId))
    this._addMetrics(this._agentManager.agentMetrics(this._agentId))
  }

  _addMetrics(metrics) {
    if (metrics == null) return
    this._postMessage({ command: 'add-metrics', metrics })
  }

  _addInfo(info) {
    if (info == null) return
    const processed = processAgentInfo(this._agentId, info)
    this._postMessage({ command: 'add-info', info: processed })
  }

  _removeAgent(id) {
    this._postMessage({ command: 'remove-agent', id })
  }

  _postMessage(msg) {
    if (this._panelDisposed) return
    this._panel.webview.postMessage(msg)
  }

  _webviewHtml() {
    return webviewHtml('dash')
  }

  _onwebviewMessage(msg) {
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
    }
  }

  _onpanelDisposed(_onpanelDisposed) {
    this._panelDisposed = true
  }

  _onagentMetricsAdded(id, metrics) {
    if (id === this._agentId) this._addMetrics(metrics)
  }

  _onagentDied(id, info) {
    if (id === this._agentId) this._removeAgent()
  }
}

module.exports = AgentDashView
