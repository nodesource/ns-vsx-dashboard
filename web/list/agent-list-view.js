'use strict'

const webviewHtml = require('../../lib/webview-html')

const prettyBytes = require('@thlorenz/pretty-bytes')
const processAgentInfo = require('../lib/process-agent-info')

const { logDebug } = require('../../lib/logger')('list-view')
const { window, ViewColumn } = require('vscode')
const { EventEmitter } = require('events')

function processAgentMetrics(metrics) {
  const {
      heapUsed
    , activeRequests
    , activeHandles
    , cpu
  } = metrics

  return {
      heapUsed: prettyBytes(heapUsed)
    , activeRequests
    , activeHandles
    , cpu: Math.round(cpu)
  }
}

class AgentListView extends EventEmitter {
  constructor(agentManager) {
    super()
    this._bind()
    this._agentManager = agentManager
    this._html = this._webviewHtml()
    this._panel = null
    this._panelDisposed = true
    this._app = null
    this._addedInfos = new Map()
    this._active = false
    this._subscribeEvents()
  }

  _bind() {
    this._onwebviewMessage = this._onwebviewMessage.bind(this)
    this._onpanelDisposed = this._onpanelDisposed.bind(this)
  }

  _subscribeEvents() {
    this._agentManager
      .on('agent-manager:agent-info-updated', ({ id, info }) => {
        this._onagentInfoUpdated(id, info)
      })
      .on('agent-manager:agent-metrics-added', ({ id, metrics }) => {
        this._onagentMetricsAdded(id, metrics)
      })
      .on('agent-manager:agent-died', ({ id, info }) => {
        this._onagentDied(id, info)
      })
  }

  toggle() {
    if (this._panelDisposed) {
      this._panel = window.createWebviewPanel(
          'n|s dashboard:agents'
        , 'N|S Dashboard Agents'
        , ViewColumn.Active
        , { enableScripts: true }
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
    for (const [ id, agent ] of this._agentManager.agents) {
      this._addInfo(id, agent.info)
    }
    for (const [ id, agent ] of this._agentManager.agents) {
      this._addMetrics(id, agent.lastMetrics)
    }
  }

  _addInfo(id, info) {
    if (info == null) return
    // processing info and metrics to result here instead of in the webview
    // to send only the data that's consumed
    const processedInfo = processAgentInfo(id, info)
    this._postMessage({ command: 'add-info', id, info: processedInfo })
    this._addedInfos.set(id, info)
  }

  _addMetrics(id, metrics) {
    if (metrics == null) return
    const processedMetrics = processAgentMetrics(metrics)
    this._postMessage({ command: 'add-metrics', id, metrics: processedMetrics })

    if (this._addedInfos.has(id)) {
      this._addInfo(id, this._addedInfos.get(id))
    } else {
      this._enforceInfo(id)
    }
  }

  _enforceInfo(id) {
    const info = this._agentManager.agentInfo(id)
    if (info == null) return this._agentManager.requestAgentInfo(id)
    this._addInfo(id, info)
  }

  _removeAgent(id) {
    this._postMessage({ command: 'remove-agent', id })
  }

  _postMessage(msg) {
    if (this._panelDisposed) return
    this._panel.webview.postMessage(msg)
  }

  _webviewHtml() {
    return webviewHtml('list')
  }

  _onwebviewMessage(msg) {
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
      case 'ready': {
        this._activate()
        break
      }
    }
  }

  _onpanelDisposed(_onpanelDisposed) {
    this._panelDisposed = true
  }

  _onagentInfoUpdated(id, info) {
    if (this._active) this._addInfo(id, info)
  }

  _onagentMetricsAdded(id, metrics) {
    if (this._active) this._addMetrics(id, metrics)
  }

  _onagentDied(id, info) {
    if (this._active) this._removeAgent(id)
  }
}

module.exports = AgentListView
