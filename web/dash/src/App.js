'use strict'

const DIAGNOSE = true

import {
    CHART_WIDTH
  , CHART_HEIGHT

  , memoryChart
  , cpuChart
  , loadChart
  , gcCountsChart
  , gcDurationChart
  , asyncActivityChart
  , loopLagChart
  , loopCountChart
  , loopIdleChart
  , blockChart
  , httpClientChart
  , httpServerChart
  , dnsChart
  , pageFaultChart
  , contextSwitchChart
  , ipcChart

  , updateMemoryUsage
  , updateCPU
  , updateGCCounts
  , updateGCDuration
  , updateLoad
  , updateAsyncActivity
  , updateLoopLag
  , updateLoopCount
  , updateLoopIdle
  , updateBlock
  , updateHttpClient
  , updateHttpServer
  , updateDns
  , updatePageFault
  , updateIPC
  , updateContextSwitch
} from './charts'

class App {
  constructor() {
    this._memoryChart = memoryChart()
    this._cpuChart = cpuChart()
    this._loadChart = loadChart()
    this._gcCountsChart = gcCountsChart()
    this._gcDurationChart = gcDurationChart()
    this._asyncActivityChart = asyncActivityChart()
    this._loopLagChart = loopLagChart()
    this._loopCountChart = loopCountChart()
    this._loopIdleChart = loopIdleChart()
    this._blockChart = blockChart()
    this._httpClientChart = httpClientChart()
    this._httpServerChart = httpServerChart()
    this._dnsChart = dnsChart()
    this._pageFaultChart = pageFaultChart()
    this._contextSwitchChart = contextSwitchChart()
    this._ipcChart = ipcChart()

    this._data = {
        chartWidth: CHART_WIDTH
      , chartHeight: CHART_HEIGHT
      , graphs: [
          { header: 'Memory Usage', chart: this._memoryChart }
        , { header: 'CPU', chart: this._cpuChart }
        , { header: 'System Load', chart: this._loadChart }
        , { header: 'GC Counts', chart: this._gcCountsChart }
        , { header: 'GC Duration', chart: this._gcDurationChart }
        , { header: 'Async Activity', chart: this._asyncActivityChart }
        , { header: 'Event Loop Lag', chart: this._loopLagChart }
        , { header: 'Event Loop Counts', chart: this._loopCountChart }
        , { header: 'Event Loop Idle', chart: this._loopIdleChart }
        , { header: 'Block Operations', chart: this._blockChart }
        , { header: 'HTTP Client', chart: this._httpClientChart }
        , { header: 'HTTP Server', chart: this._httpServerChart }
        , { header: 'DNS', chart: this._dnsChart }
        , { header: 'Page Faults', chart: this._pageFaultChart }
        , { header: 'Context Switches', chart: this._contextSwitchChart }
        , { header: 'Process Messages', chart: this._ipcChart } ]
      , alive: false
      , info: {}
    }
  }

  log(s, ...rest) {
    if (!DIAGNOSE) return
    console.log(s, ...rest)
  }

  data() {
    return this._data
  }

  set agentId(value) {
    this._agentId = value
  }

  addMetrics(metrics) {
    const time = Date.now()
    updateMemoryUsage(this._memoryChart, time, metrics)
    updateCPU(this._cpuChart, time, metrics)
    updateGCCounts(this._gcCountsChart, time, metrics)
    updateGCDuration(this._gcDurationChart, time, metrics)
    updateLoad(this._loadChart, time, metrics)
    updateAsyncActivity(this._asyncActivityChart, time, metrics)
    updateLoopLag(this._loopLagChart, time, metrics)
    updateLoopCount(this._loopCountChart, time, metrics)
    updateLoopIdle(this._loopIdleChart, time, metrics)
    updateBlock(this._blockChart, time, metrics)
    updateHttpClient(this._httpClientChart, time, metrics)
    updateHttpServer(this._httpServerChart, time, metrics)
    updateDns(this._dnsChart, time, metrics)
    updatePageFault(this._pageFaultChart, time, metrics)
    updateIPC(this._ipcChart, time, metrics)
    updateContextSwitch(this._contextSwitchChart, time, metrics)
    this._data.alive = true
  }

  addInfo(info) {
    this._data.alive = true
    this._data.info = Object.assign(this._data.info, info)
  }

  removeAgent() {
    this._data.alive = false
  }
}

//
// Initialization
//
function handleVscodeMessage(msg) {
  const { command } = msg
  switch (command) {
    case 'add-info': {
      app.addInfo(msg.info)
      break
    }
    case 'add-metrics': {
      app.addMetrics(msg.metrics)
      break
    }
    case 'remove-agent': {
      app.removeAgent()
      break
    }
  }
}

function connectVscode() {
  /* global acquireVsCodeApi */
  // @ts-ignore
  const vscode = acquireVsCodeApi()

  function logMessage(msg) {
    const { data } = msg
    app.log(`${data.command} for ${data.id}`)
  }

  window.addEventListener('message', msg => {
    logMessage(msg)
    handleVscodeMessage(msg.data)
  })

  vscode.postMessage({ event: 'ready' })
}

//
// Exports used by App.vue
//
export const app = new App()
export const methods = {
  log: app.log.bind(app)
}
export const data = app.data.bind(app)
// @ts-ignore
const runningInVscode = typeof acquireVsCodeApi === 'function'
if (runningInVscode) {
  window.addEventListener('load', connectVscode)
} else {
  runInBrowserTests()
}

//
// Tests
//
import agentsJSON from '../../list/agents.json'
function runInBrowserTests() {
  // @ts-ignore
  const agents = new Map(agentsJSON)
  function init() {
    for (const agent of agents.values()) {
      app.addInfo(agent.info)
    }
  }

  function simulateMetrics() {
    for (const agent of agents.values()) {
      if (agent.collectedMetrics == null || agent.collectedMetrics.length === 0) continue
      app.addMetrics(agent.collectedMetrics.shift())
    }
  }

  init()
  simulateMetrics()
  setInterval(simulateMetrics, 3000)
}
