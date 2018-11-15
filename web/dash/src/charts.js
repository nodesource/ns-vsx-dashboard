'use strict'

const COLORS = [ 'blue', 'yellowgreen', 'red', 'yellow' ]
const CHART_WIDTH = 600
const CHART_HEIGHT = 400

const assert = require('assert')
const {
    count
  , percent
  , bytes
  , decimals2
  , ms
} = require('./summarizers')

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

function createChart(uuid, traceNames, summarizers, ytitle) {
  assert.equal(traceNames.length, summarizers.length, 'Need one summarizer per trace')
  const traces = traceNames.map((name, idx) => lineTrace({ idx, name }))
  return {
      uuid
    , traces
    , layout: layout({ xtitle: 'time', ytitle })
    , meta: { summarizers }
  }
}

function summarize(traces, summarizers) {
  const summary = []
  for (let i = 0; i < traces.length; i++) {
    const ys = traces[i].y
    if (ys.length === 0) return ''
    const y = ys[ys.length - 1]
    const summarizer = summarizers[i]
    summary.push(summarizer(y))
  }
  return summary.join(' / ')
}

function addDataPoints(chart, time, dataPoints) {
  chart.layout.datarevision = time
  for (let i = 0; i < dataPoints.length; i++) {
    const y = dataPoints[i]
    chart.traces[i].y.push(y)
  }
  chart.summary = summarize(chart.traces, chart.meta.summarizers)
}

//
// Memory
//
function memoryChart() {
  return createChart(
      'chart:memory'
    , [ 'RSS', 'Heap Used', 'Heap Total' ]
    , [ bytes, bytes, bytes ]
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
    , [ percent, percent, percent, percent ]
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
    , [ count, count, count, count ]
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
    , [ count, count ]
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
    , [ count, count ]
    , 'count'
  )
}

function updateAsyncActivity(chart, time, metrics) {
  addDataPoints(
      chart
    , time
    , [ metrics.activeRequests, metrics.activeHandles ]
  )
}

//
// Load Average
//
function loadChart() {
  return createChart(
      'chart:load'
    , [ 'Load1m', 'Load5m', 'Load15m' ]
    , [ decimals2, decimals2, decimals2 ]
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
    , [ ms ]
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
    , [ decimals2, decimals2 ]
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
    , [ percent ]
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
    , [ count, count ]
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
    , [ count, count, count, count ]
    , 'count'
  )
}

function updateHttpClient(chart, time, metrics) {
  addDataPoints(
      chart
    , time
    , [ metrics.httpClientCount
      , metrics.httpClientMedian
      , metrics.httpClient99Ptile
      , metrics.httpClientAbortCount ]
  )
}

//
// HTTP Server
//
function httpServerChart() {
  return createChart(
      'chart:httpServer'
    , [ 'Count', 'Median', '99 Percentile', 'Abort' ]
    , [ count, count, count, count ]
    , 'count'
  )
}

function updateHttpServer(chart, time, metrics) {
  addDataPoints(
      chart
    , time
    , [ metrics.httpServerCount
      , metrics.httpServerMedian
      , metrics.httpServer99Ptile
      , metrics.httpServerAbortCount ]
  )
}

//
// DNS
//
function dnsChart() {
  return createChart(
      'chart:dns'
    , [ 'Count', 'Median', '99 Percentile' ]
    , [ count, count, count ]
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
    , [ count, count ]
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
    , [ count, count, count ]
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
    , [ count, count ]
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
