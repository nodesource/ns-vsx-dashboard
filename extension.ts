import { commands, Uri, window } from 'vscode'

import AgentConnector from './src/agent-connector'
import AgentManager from './src/agent-manager'
import Profiler from './src/profiler'
import AgentListView from './web/list/agent-list-view'
import AgentDashView from './web/dash/agent-dash-view'
import CpuProfileView, { IFrameInfo } from './web/cpu-profile/cpu-profile-view'
import { initDevelopment } from './src/development'
import { initAgentStatusbar } from './src/agent-statusbar'
import { initAgentErrors } from './src/agent-errors'

import logger from './src/logger'
const { logInfo } = logger('main')

async function openFrame(frameInfo: IFrameInfo) {
  if (!frameInfo.canShow) {
    window.showErrorMessage(`Unable to open this frame as it is outside your code base`)
    return
  }
  const uri = Uri.parse(`file://${frameInfo.fileName}`)
  try {
    console.log(frameInfo)
    await commands.executeCommand('vscode.open', uri)
  } catch (err) {
    window.showErrorMessage(`Unable to open ${frameInfo.fileName}\n`, err)
  }
}

export function activate(context: { subscriptions: any[]; }) {
  const connector = new AgentConnector()
  const agentManager = new AgentManager(connector)
  const profiler = new Profiler(agentManager)

  initAgentStatusbar(agentManager)
  initAgentErrors({ agentManager })
  initDevelopment({ agentManager })

  const agentDashView = new AgentDashView(agentManager)
  const agentListView = new AgentListView(agentManager)
    .on('agent-list:agent-selected', id => agentDashView.showAgent(id))
    .on('agent-list:cpu-profile-requested', id => profiler.requestCpuProfile(id))
    .on('agent-list:heap-profile-requested', id => profiler.requestHeapProfile(id))

  const cpuProfileView = new CpuProfileView(agentManager)
  cpuProfileView
    .on('cpu-profile:frame-selected', openFrame)

  const showSummaryCommand =
    commands.registerCommand(
      'ns-vsx-dashboard:toggle-agent-list'
      , () => agentListView.toggle()
    )
  context.subscriptions.push(showSummaryCommand)

  logInfo('"ns-vsx-dashboard" is now active!')
}

export function deactivate() { }
