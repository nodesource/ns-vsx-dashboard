'use strict'

const webviewHtml = require('../../lib/webview-html')

const ta = require('time-ago')
const prettyBytes = require('pretty-bytes')

const { logDebug } = require('../../lib/logger')('list-view')
const { window, ViewColumn } = require('vscode')
const { EventEmitter } = require('events')

const MAX_ID_LEN = 15
const MAX_MAIN_LEN = 45

function nameAgent(info) {
  if (info == null) return 'n/a'
  const { app, tags, pid } = info
  if (app !== 'untitled application') {
    return `${app} [${pid}]`
  }
  if (tags.length > 0) {
    return `${tags.join(':')} [${pid}]`
  }
  return `[${pid}]`
}

function getMain(main) {
  if (main.length <= MAX_MAIN_LEN) return main
  return `... ${main.slice(-(MAX_MAIN_LEN - 4))}`
}

function getId(id) {
  const s = `${id}`
  if (s.length <= MAX_ID_LEN) return s
  return `${s.slice(0, MAX_ID_LEN)}...`
}

function processAgentInfo(id, info) {
  const { nodeEnv, processStart, main } = info
  return {
      id: getId(id)
    , name: nameAgent(info)
    , nodeEnv
    , processStart: ta.ago(processStart)
    , main: getMain(main)
  }
}

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
  }

  _bind() {
    this._onwebviewMessage = this._onwebviewMessage.bind(this)
    this._onpanelDisposed = this._onpanelDisposed.bind(this)
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
    this._agentManager
      .on('agent-manager:agent-info-updated', ({ id, info }) => {
        this._onagentInfoUpdated(id, info)
      })
      .on('agent-manager:agent-metrics-added', ({ id, metrics }) => {
        this._onagentMetricsAdded(id, metrics)
      })
  }

  _deactivate() {
    logDebug('Deactivating agent-list view')
    this._agentManager.removeAllListeners()
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
  }

  _addMetrics(id, metrics) {
    if (metrics == null) return
    const processedMetrics = processAgentMetrics(metrics)
    this._postMessage({ command: 'add-metrics', id, metrics: processedMetrics })
  }

  _removeAgent(id) {
    // TODO:
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
    this._addInfo(id, info)
  }

  _onagentMetricsAdded(id, metrics) {
    this._addMetrics(id, metrics)
  }
}

module.exports = AgentListView
