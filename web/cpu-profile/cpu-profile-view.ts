import {
  IProcessedCPUProfile,
  processCpuProfile
} from 'flamegraph'

import { EventEmitter } from 'events'
import { ViewColumn, WebviewPanel, window } from 'vscode'
import {
  AgentManager,
  AgentManagerEvent,
  AgentProfileEventListener
} from '../../src/agent-manager'
import { unhandledCase } from '../../src/core'
import logger from '../../src/logger'
import webviewHtml from '../../src/webview-html'

const { logDebug } = logger('list-view')
const fnRx = /^([^/]*)([^:]+):(\d*)/

interface IResponseMessage {
  event: 'log' | 'frame-selected' | 'ready'
  text?: string
  fn?: string
}

interface IPostMessage {
  command: 'add-profile',
  profile: IProcessedCPUProfile
}

export interface IFrameInfo {
  canShow: boolean
  fn?: string
  fileName?: string
  line?: number
}

export type CpuProfileViewEvent = 'cpu-profile:frame-selected'
export default class CpuProfileView extends EventEmitter {
  _agentManager: AgentManager
  _html: string
  _panelDisposed: boolean = true
  _active: boolean = false
  _panel!: WebviewPanel

  _pendingProfile?: IProcessedCPUProfile | null
  _renderedProfile?: IProcessedCPUProfile | null

  constructor(agentManager: AgentManager) {
    super()
    this._agentManager = agentManager
    this._html = this._webviewHtml()
    this._subscribeEvents()
  }

  _subscribeEvents() {
    this._agentManager
      .on(AgentManagerEvent.AgentCpuProfileAdded, this._onagentCpuProfileAdded)
  }

  _onagentCpuProfileAdded: AgentProfileEventListener = ({ profile }) => {
    this._toggle()
    this._renderedProfile = null
    this._pendingProfile = processCpuProfile(profile)
  }

  _toggle(forceShow = true) {
    if (this._panelDisposed) {
      this._panel = window.createWebviewPanel(
        'n|s dashboard:cpu-profile',
        'N|S Dashboard CPU Profile',
        ViewColumn.Active,
        { enableScripts: true }
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

  _onwebviewMessage = (msg: IResponseMessage) => {
    const { event } = msg
    switch (event) {
      case 'log': {
        logDebug(msg.text)
        break
      }
      case 'frame-selected': {
        logDebug({ fn: msg.fn })
        const frameInfo = this._processFn(msg.fn!)
        this.emit('cpu-profile:frame-selected', frameInfo)
        break
      }
      case 'ready': {
        this._activate()
        break
      }
      default: unhandledCase(event)
    }
  }

  _onpanelDisposed = () => {
    this._panelDisposed = true
  }

  _activate() {
    logDebug('Activating CPU Profile view')
    this._active = true
    if (this._pendingProfile != null) {
      this._postMessage({
        command: 'add-profile',
        profile: this._pendingProfile
      })
      this._renderedProfile = this._pendingProfile
      this._pendingProfile = null
    }
  }

  _deactivate() {
    logDebug('Deactivating CPU Profile view')
    this._active = false
  }

  _postMessage(msg: IPostMessage) {
    if (this._panelDisposed) return
    this._panel.webview.postMessage(msg)
  }

  _webviewHtml() {
    return webviewHtml('cpu-profile')
  }

  _processFn(fn: string): IFrameInfo {
    const m = fn.match(fnRx)
    if (m == null) return { canShow: false }
    const [, fnName, fileName, line] = m
    return { canShow: true, fn: fnName, fileName, line: parseInt(line) }
  }
}
