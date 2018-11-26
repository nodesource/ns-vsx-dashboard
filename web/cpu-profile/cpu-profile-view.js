'use strict'

const flamegraph = require('flamegraph')
const { window, ViewColumn } = require('vscode')
const { EventEmitter } = require('events')
const { logDebug } = require('../../lib/logger')('list-view')
const webviewHtml = require('../../lib/webview-html')

const fnRx = /^([^/]*)([^:]+):(\d*)/

class CpuProfileView extends EventEmitter {
  constructor(agentManager) {
    super()
    this._agentManager = agentManager
    this._html = this._webviewHtml()
    this._panel = null
    this._panelDisposed = true
    this._pendingProfile = null
    this._renderedProfile = null
    this._bind()
    this._subscribeEvents()
  }

  _bind() {
    this._onwebviewMessage = this._onwebviewMessage.bind(this)
    this._onpanelDisposed = this._onpanelDisposed.bind(this)
  }

  _subscribeEvents() {
    this._agentManager
      .on('agent-manager:agent-cpu-profile-added', ({ id, profile }) => {
        this._onagentCpuProfileAdded(id, profile)
      })
  }

  _onagentCpuProfileAdded(id, profile) {
    this._toggle()
    this._renderedProfile = null
    this._pendingProfile = flamegraph.processCpuProfile(profile)
  }

  _toggle(forceShow = true) {
    if (this._panelDisposed) {
      this._panel = window.createWebviewPanel(
          'n|s dashboard:cpu-profile'
        , 'N|S Dashboard CPU Profile'
        , ViewColumn.Active
        , { enableScripts: true }
      )
      this._panel.webview.html = this._html
      this._panel.onDidDispose(this._onpanelDisposed)
      this._panelDisposed = false
      this._panel.webview.onDidReceiveMessage(this._onwebviewMessage)
    } else if (this._panel.visible && !forceShow) {
      this._deactivate()
      this._panel.dispose()
    } else {
      this._panel.reveal()
    }
  }

  _onwebviewMessage(msg) {
    const { event } = msg
    switch (event) {
      case 'log': {
        logDebug(msg.text)
        break
      }
      case 'frame-selected': {
        logDebug({ fn: msg.fn })
        const frameInfo = this._processFn(msg.fn)
        this.emit('cpu-profile:frame-selected', frameInfo)
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

  _activate() {
    logDebug('Activating CPU Profile view')
    this._active = true
    if (this._pendingProfile != null) {
      this._postMessage({ command: 'add-profile', profile: this._pendingProfile })
      this._renderedProfile = this._pendingProfile
      this._pendingProfile = null
    }
  }

  _deactivate() {
    logDebug('Deactivating CPU Profile view')
    this._active = false
  }

  _postMessage(msg) {
    if (this._panelDisposed) return
    this._panel.webview.postMessage(msg)
  }

  _webviewHtml() {
    return webviewHtml('cpu-profile')
  }

  _processFn(fn) {
    const m = fn.match(fnRx)
    if (m == null) return { canShow: false }
    const [ , fnName, fileName, line ] = m
    return { canShow: true, fn: fnName, fileName, line }
  }
}

module.exports = CpuProfileView
