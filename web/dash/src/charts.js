'use strict'

const COLORS = [ 'blue', 'yellowgreen', 'red', 'yellow' ]
const CHART_WIDTH = 600
const CHART_HEIGHT = 400

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

function addDataPoints(chart, time, dataPoints) {
  chart.layout.datarevision = time
  for (let i = 0; i < dataPoints.length; i++) {
    const y = dataPoints[i]
    chart.traces[i].y.push(y)
  }
}

//
// Memory
//
function memoryChart() {
  return createChart(
      'chart:memory'
    , [ 'RSS', 'Heap Used', 'Heap Total' ]
    , 'bytes'
  )
}

function updateMemoryUsage(chart, time, metrics) {
  addDataPoints(
      chart
    , time
    , [ metrics.rss, metrics.heapUsed, metrics.heapTotal ]
  )
}

//
// CPU
//
function cpuChart() {
  return createChart(
      'chart:cpu'
    , [ 'CPU', 'CPU User', 'CPU System', 'CPU GC' ]
    , '%'
  )
}

function updateCPU(chart, time, metrics) {
  addDataPoints(
      chart
    , time
    , [ metrics.cpuPercent
      , metrics.cpuUserPercent
      , metrics.cpuSystemPercent
      , metrics.gcCpuPercent ]
  )
}

//
// GC
//
function gcCountsChart() {
  return createChart(
      'chart:gcCounts'
    , [ 'GC', 'Major GC', 'Full GC', 'Forced GC' ]
    , 'count'
  )
}

function updateGCCounts(chart, time, metrics) {
  addDataPoints(
      chart
    , time
    , [ metrics.gcCount
      , metrics.gcMajorCount
      , metrics.gcFullCount
      , metrics.gcForcedCount ]
  )
}

function gcDurationChart() {
  return createChart(
      'chart:gcDuration'
    , [ 'Median', '99 Percentile' ]
    , 'count'
  )
}

function updateGCDuration(chart, time, metrics) {
  addDataPoints(
      chart
    , time
    , [ metrics.gcDurUsMedian, metrics.gcDurUs99Ptile ]
  )
}

//
// Async Activity
//
function asyncActivityChart() {
  return createChart(
      'chart:async-activity'
    , [ 'Active Requests', 'Active Handles' ]
    , 'count'
  )
}

function updateAsyncActivity(chart, time, metrics) {
  addDataPoints(
      chart
    , time
    , [ metrics.activeRequsts, metrics.activeHandles ]
  )
}

//
// Load Average
//
function loadChart() {
  return createChart(
      'chart:load'
    , [ 'Load1m', 'Load5m', 'Load15m' ]
    , 'load average'
  )
}

function updateLoad(chart, time, metrics) {
  addDataPoints(
      chart
    , time
    , [ metrics.load1m, metrics.load5m, metrics.load15m ]
  )
}

//
// Event Loop
//
function loopLagChart() {
  return createChart(
      'chart:loopLag'
    , [ 'Loop Lag' ]
    , 'milliseconds'
  )
}

function updateLoopLag(chart, time, metrics) {
  addDataPoints(
      chart
    , time
    , [ metrics.loopEstimatedLag ]
  )
}

function loopCountChart() {
  return createChart(
      'chart:loopCount'
    , [ 'Loops per Second', 'Tasks per Loop' ]
    , 'count'
  )
}

function updateLoopCount(chart, time, metrics) {
  addDataPoints(
      chart
    , time
    , [ metrics.loopsPerSecond, metrics.loopAvgTasks ]
  )
}

function loopIdleChart() {
  return createChart(
      'chart:loopIdle'
    , [ 'Loop Idle' ]
    , '%'
  )
}

function updateLoopIdle(chart, time, metrics) {
  addDataPoints(
      chart
    , time
    , [ metrics.loopIdlePercent ]
  )
}

//
// Block
//
function blockChart() {
  return createChart(
      'chart:block'
    , [ 'Block Input Ops', 'Block Output Ops' ]
    , 'count'
  )
}

function updateBlock(chart, time, metrics) {
  addDataPoints(
      chart
    , time
    , [ metrics.blockInputOpCount, metrics.blockOutputOpCount ]
  )
}

//
// HTTP Client
//
function httpClientChart() {
  return createChart(
      'chart:httpClient'
    , [ 'Count', 'Median', '99 Percentile', 'Abort' ]
    , 'count'
  )
}

function updateHttpClient(chart, time, metrics) {
  addDataPoints(
      chart
    , time
    , [ metrics.httpClientCount
      , metrics.httpClientMedian
      , metrics.httpClient99Ptile ]
  )
}

//
// HTTP Server
//
function httpServerChart() {
  return createChart(
      'chart:httpServer'
    , [ 'Count', 'Median', '99 Percentile', 'Abort' ]
    , 'count'
  )
}

function updateHttpServer(chart, time, metrics) {
  addDataPoints(
      chart
    , time
    , [ metrics.httpServerCount
      , metrics.httpServerMedian
      , metrics.httpServer99Ptile ]
  )
}

//
// DNS
//
function dnsChart() {
  return createChart(
      'chart:dns'
    , [ 'Count', 'Median', '99 Percentile' ]
    , 'count'
  )
}

function updateDns(chart, time, metrics) {
  addDataPoints(
      chart
    , time
    , [ metrics.dnsCount
      , metrics.dnsMedian
      , metrics.dns99Ptile ]
  )
}

//
// Page Fault
//
function pageFaultChart() {
  return createChart(
      'chart:pageFault'
    , [ 'Soft', 'Hard' ]
    , 'count'
  )
}

function updatePageFault(chart, time, metrics) {
  addDataPoints(
      chart
    , time
    , [ metrics.pageFaultSoftCount, metrics.pageFaultHardCount ]
  )
}

//
// IPC
//
function ipcChart() {
  return createChart(
      'chart:ipc'
    , [ 'IPC Messages Sent', 'IPC Messages Received', 'Signals Received' ]
    , 'count'
  )
}

function updateIPC(chart, time, metrics) {
  addDataPoints(
      chart
    , time
    , [ metrics.ipcSentCount, metrics.ipcReceivedCount, metrics.signalCount ]
  )
}

//
// Context Switch
//
function contextSwitchChart() {
  return createChart(
      'chart:contextSwitch'
    , [ 'Voluntary', 'Involuntary' ]
    , 'count'
  )
}

function updateContextSwitch(chart, time, metrics) {
  addDataPoints(
      chart
    , time
    , [ metrics.ctxSwitchVoluntaryCount, metrics.ctxSwitchInvoluntaryCount ]
  )
}

module.exports = {
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
  , ipcChart
  , contextSwitchChart

  , updateMemoryUsage
  , updateCPU
  , updateGCCounts
  , updateGCDuration
  , updateAsyncActivity
  , updateLoad
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
}
