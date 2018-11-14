'use strict'

const DIAGNOSE = true

const COLORS = [ 'blue', 'yellowgreen', 'red', 'yellow' ]
const CHART_WIDTH = 600
const CHART_HEIGHT = 400

function connectVscode() {
  // TODO
}

function lineTrace({
    idx = 0
  , width = 2
  , shape = 'line'
  , name = ''
}) {
  const line = { color: COLORS[idx], width, shape }
  return { y: [], line, name }
}

function layout({ xtitle, ytitle }) {
  return {
      title: null
    , xaxis: { title: xtitle }
    , yaxis: { title: ytitle }
    , autosize: false
    , width: CHART_WIDTH
    , height: CHART_HEIGHT
  }
}

function createChart(uuid, traceNames, ytitle) {
  const traces = traceNames.map((name, idx) => lineTrace({ idx, name }))
  return {
      uuid
    , traces
    , layout: layout({ xtitle: 'time', ytitle })
  }
}

function memoryChart() {
  return createChart(
      'chart:memory'
    , [ 'RSS', 'Heap Used', 'Heap Total' ]
    , 'bytes'
  )
}

function cpuChart() {
  return createChart(
      'chart:cpu'
    , [ 'CPU', 'CPU User', 'CPU System', 'CPU GC' ]
    , '%'
  )
}

function gcCountsChart() {
  return createChart(
      'chart:gcCounts'
    , [ 'GC', 'Major GC', 'Full GC', 'Forced GC' ]
    , 'count'
  )
}

function gcDurationChart() {
  return createChart(
      'chart:gcDuration'
    , [ 'Median', '99 Percentile' ]
    , 'count'
  )
}

function asyncActivityChart() {
  return createChart(
      'chart:async-activity'
    , [ 'Active Requests', 'Active Handles' ]
    , 'count'
  )
}

function loadChart() {
  return createChart(
      'chart:load'
    , [ 'Load1m', 'Load5m', 'Load15m' ]
    , 'load average'
  )
}

function loopLagChart() {
  return createChart(
      'chart:loopLag'
    , [ 'Loop Lag' ]
    , 'milliseconds'
  )
}

function loopCountChart() {
  return createChart(
      'chart:loopCount'
    , [ 'Loops per Second', 'Tasks per Loop' ]
    , 'count'
  )
}

function loopIdleChart() {
  return createChart(
      'chart:loopIdle'
    , [ 'Loop Idle' ]
    , '%'
  )
}

function blockChart() {
  return createChart(
      'chart:block'
    , [ 'Block Input Ops', 'Block Output Ops' ]
    , 'count'
  )
}

function httpClientChart() {
  return createChart(
      'chart:httpClient'
    , [ 'Count', 'Median', '99 Percentile', 'Abort' ]
    , 'count'
  )
}

function httpServerChart() {
  return createChart(
      'chart:httpServer'
    , [ 'Count', 'Median', '99 Percentile', 'Abort' ]
    , 'count'
  )
}

function dnsChart() {
  return createChart(
      'chart:dns'
    , [ 'Count', 'Median', '99 Percentile' ]
    , 'count'
  )
}

function pageFaultChart() {
  return createChart(
      'chart:pageFault'
    , [ 'Soft', 'Hard' ]
    , 'count'
  )
}

function ipcChart() {
  return createChart(
      'chart:ipc'
    , [ 'IPC Messages Sent', 'IPC Messages Received', 'Signals Received' ]
    , 'count'
  )
}

function contextSwitchChart() {
  return createChart(
      'chart:contextSwitch'
    , [ 'Voluntary', 'Involuntary' ]
    , 'count'
  )
}

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
    }
  }

  log(s, ...rest) {
    if (!DIAGNOSE) return
    console.log(s, ...rest)
  }

  _addDataPoints(chart, time, dataPoints) {
    chart.layout.datarevision = time
    for (let i = 0; i < dataPoints.length; i++) {
      const y = dataPoints[i]
      chart.traces[i].y.push(y)
    }
    return this
  }

  _addMemoryUsage(time, metrics) {
    return this._addDataPoints(
        this._memoryChart
      , time
      , [ metrics.rss, metrics.heapUsed, metrics.heapTotal ]
    )
  }

  _addCPU(time, metrics) {
    return this._addDataPoints(
        this._cpuChart
      , time
      , [ metrics.cpuPercent
        , metrics.cpuUserPercent
        , metrics.cpuSystemPercent
        , metrics.gcCpuPercent ]
    )
  }

  _addGCCounts(time, metrics) {
    return this._addDataPoints(
        this._gcCountsChart
      , time
      , [ metrics.gcCount
        , metrics.gcMajorCount
        , metrics.gcFullCount
        , metrics.gcForcedCount ]
    )
  }

  _addGCDuration(time, metrics) {
    return this._addDataPoints(
        this._gcDurationChart
      , time
      , [ metrics.gcDurUsMedian, metrics.gcDurUs99Ptile ]
    )
  }

  _addAsyncActivity(time, metrics) {
    return this._addDataPoints(
        this._asyncActivityChart
      , time
      , [ metrics.activeRequsts, metrics.activeHandles ]
    )
  }

  _addLoopLag(time, metrics) {
    return this._addDataPoints(
        this._loopLagChart
      , time
      , [ metrics.loopEstimatedLag ]
    )
  }

  _addLoopCount(time, metrics) {
    return this._addDataPoints(
        this._loopCountChart
      , time
      , [ metrics.loopsPerSecond, metrics.loopAvgTasks ]
    )
  }

  _addLoopIdle(time, metrics) {
    return this._addDataPoints(
        this._loopIdleChart
      , time
      , [ metrics.loopIdlePercent ]
    )
  }

  _addLoad(time, metrics) {
    return this._addDataPoints(
        this._loadChart
      , time
      , [ metrics.load1m, metrics.load5m, metrics.load15m ]
    )
  }

  _addBlock(time, metrics) {
    return this._addDataPoints(
        this._blockChart
      , time
      , [ metrics.blockInputOpCount, metrics.blockOutputOpCount ]
    )
  }

  _addHttpClient(time, metrics) {
    return this._addDataPoints(
        this._httpClientChart
      , time
      , [ metrics.httpClientCount
        , metrics.httpClientMedian
        , metrics.httpClient99Ptile ]
    )
  }

  _addHttpServer(time, metrics) {
    return this._addDataPoints(
        this._httpServerChart
      , time
      , [ metrics.httpServerCount
        , metrics.httpServerMedian
        , metrics.httpServer99Ptile ]
    )
  }

  _addDns(time, metrics) {
    return this._addDataPoints(
        this._dnsChart
      , time
      , [ metrics.dnsCount
        , metrics.dnsMedian
        , metrics.dns99Ptile ]
    )
  }

  _addPageFault(time, metrics) {
    return this._addDataPoints(
        this._pageFaultChart
      , time
      , [ metrics.pageFaultSoftCount, metrics.pageFaultHardCount ]
    )
  }

  _addContextSwitch(time, metrics) {
    return this._addDataPoints(
        this._contextSwitchChart
      , time
      , [ metrics.ctxSwitchVoluntaryCount, metrics.ctxSwitchInvoluntaryCount ]
    )
  }

  _addIPC(time, metrics) {
    return this._addDataPoints(
        this._ipcChart
      , time
      , [ metrics.ipcSentCount, metrics.ipcReceivedCount, metrics.signalCount ]
    )
  }

  data() {
    return this._data
  }

  addMetrics(id, metrics) {
    const time = Date.now()
    this
      ._addMemoryUsage(time, metrics)
      ._addCPU(time, metrics)
      ._addGCCounts(time, metrics)
      ._addGCDuration(time, metrics)
      ._addAsyncActivity(time, metrics)
      ._addLoopLag(time, metrics)
      ._addLoopCount(time, metrics)
      ._addLoopIdle(time, metrics)
      ._addLoad(time, metrics)
      ._addBlock(time, metrics)
      ._addHttpClient(time, metrics)
      ._addHttpServer(time, metrics)
      ._addDns(time, metrics)
      ._addPageFault(time, metrics)
      ._addContextSwitch(time, metrics)
      ._addIPC(time, metrics)
  }

  addInfo(id, info) {
    // TODO
  }
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
    for (const [ id, agent ] of agents) {
      app.addInfo(id, agent.info)
    }
  }

  function simulateMetrics() {
    for (const [ id, agent ] of agents) {
      if (agent.collectedMetrics == null) continue
      app.addMetrics(id, agent.collectedMetrics.shift())
    }
  }

  init()
  simulateMetrics()
  setInterval(simulateMetrics, 500)
}
