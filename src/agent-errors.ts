'use strict'

import { window } from 'vscode'
import { AgentManagerEvent, IAgentManager } from './agent-manager'
import logger from './logger'
const { logError } = logger('agent-errors')

type Options = { agentManager: IAgentManager }

const defaultErrorIcon = '🚫'
const errorIcons = new Map([
  ['connector', '🔌']
])

export class AgentErrors {
  private _agentManager: IAgentManager

  constructor({ agentManager }: Options) {
    this._agentManager = agentManager
    this._subscribeErrorEvents()
  }

  private _subscribeErrorEvents() {
    this._agentManager.on(AgentManagerEvent.ConnectorError,
      err => this._handleError('connector', err))
  }

  private _handleError(type: string, err: Error) {
    const icon = errorIcons.has(type) ? errorIcons.get(type) : defaultErrorIcon
    logError(err)
    window.showErrorMessage(
      `${icon} unable to connect to agent(s)`, err.toString())
  }
}

export function initAgentErrors(opts: Options) {
  return new AgentErrors(opts)
}
