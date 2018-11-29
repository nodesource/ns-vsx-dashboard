'use strict'

import { window } from 'vscode'
import AgentManager from './agent-manager'

type Options = { agentManager: AgentManager }

const defaultErrorIcon = '🚫'
const errorIcons = new Map([
  [ 'connector', '🔌' ]
])

export class AgentErrors {
  _agentManager: AgentManager

  constructor({ agentManager }: Options) {
    this._agentManager = agentManager
    this._subscribeErrorEvents()
  }

  _subscribeErrorEvents() {
    this._agentManager
      .on('agent-manager:connector-error'
        , err => this._handleError('connector', err)
      )
  }

  _handleError(type: string, err: Error) {
    const icon = errorIcons.has(type) ? errorIcons.get(type) : defaultErrorIcon
    console.error(err)
    window.showErrorMessage(`${icon} unable to connect to agent(s)`, err.toString())
  }
}

export function initAgentErrors(opts: Options) {
  return new AgentErrors(opts)
}
