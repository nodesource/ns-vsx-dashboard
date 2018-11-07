'use strict'

const webviewHtml = require('../../lib/webview-html')

const { window, ViewColumn } = require('vscode')
const { EventEmitter } = require('events')

class AgentListView extends EventEmitter {
  constructor() {
    super()
    this._html = this._webviewHtml()
    this._panel = null
    this._panelDisposed = true
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
    } else if (this._panel.visible) {
      this._panel.dispose()
    } else {
      this._panel.reveal()
    }
  }

  _webviewHtml() {
    return webviewHtml('list')
  }

  _onwebviewMessage(msg) {
    console.log({ msg })
  }

  _onpanelDisposed(_onpanelDisposed) {
    this._panelDisposed = true
  }
}

module.exports = AgentListView
