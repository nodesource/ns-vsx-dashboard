import {
  commands,
  Range,
  Selection,
  TextEditorRevealType,
  Uri,
  window
} from 'vscode'

import { AgentConnector } from './src/agent-connector'
import { initAgentErrors } from './src/agent-errors'
import { AgentManager } from './src/agent-manager'
import { initAgentStatusbar } from './src/agent-statusbar'
import { initDevelopment } from './src/development'
import { Profiler } from './src/profiler'

import { CpuProfileView, FrameInfo } from './web/cpu-profile/cpu-profile-view'
import { AgentDashView } from './web/dash/agent-dash-view'
import { AgentListView } from './web/list/agent-list-view'

import logger from './src/logger'
const { logInfo } = logger('main')

async function openFrame(frameInfo: FrameInfo) {
  if (!frameInfo.canShow) {
    window.showErrorMessage(
      `Unable to open this frame as it is outside your code base`)
    return
  }
  const uri = Uri.parse(`file://${frameInfo.fileName}`)
  // editor lines are zero based
  const line = frameInfo.line != null ? frameInfo.line - 1 : 0
  const range = new Range(line, 0, line, 0)
  // select the entire line
  const selection = new Selection(line, 0, line, Number.MAX_SAFE_INTEGER)
  try {
    await commands.executeCommand('vscode.open', uri)
    const editor = window.activeTextEditor
    if (editor == null) return
    editor.revealRange(range, TextEditorRevealType.InCenter)
    editor.selection = selection
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
    .on('agent-list:cpu-profile-requested',
      id => profiler.requestCpuProfile(id))
    .on('agent-list:heap-profile-requested',
      id => profiler.requestHeapProfile(id))

  const cpuProfileView = new CpuProfileView(agentManager)
  cpuProfileView
    .on('cpu-profile:frame-selected', openFrame)

  const showSummaryCommand =
    commands.registerCommand(
      'ns-vsx-dashboard:toggle-agent-list',
      () => agentListView.toggle()
    )
  context.subscriptions.push(showSummaryCommand)

  logInfo('"ns-vsx-dashboard" is now active!')
}

export function deactivate() { }
