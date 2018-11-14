'use strict'

const DIAGNOSE = true

function connectVscode() {
  // TODO
}

class App {
  constructor() {
    this._data = {
      memoryChart: {
          uuid: 'chart:memory'
        , traces: [{
              y: []
            , line: {
                color: '#5e9e7e'
              , width: 4
              , shape: 'line'
            }
          }]
        , layout: {
            title: 'Memory Usage'
          , xaxis: { title: 'time' }
          , yaxis: { title: 'bytes' }
          }
      }
    }
  }

  log(s, ...rest) {
    if (!DIAGNOSE) return
    console.log(s, ...rest)
  }

  _addMemoryUsage(time, y) {
    const chart = this._data.memoryChart
    chart.layout.datarevision = time
    chart.traces[0].y.push(y)
  }

  data() {
    return this._data
  }

  addMetrics(id, metrics) {
    const time = Date.now()
    const memoryY = Math.random()
    this._addMemoryUsage(time, memoryY)
  }

  addInfo(id, info) {
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
