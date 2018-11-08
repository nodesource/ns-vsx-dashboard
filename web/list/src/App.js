import agentsJSON from '../agents.json'
import ta from 'time-ago'
import prettyBytes from 'pretty-bytes'
const agents = new Map(agentsJSON)
const MAX_ID_LEN = 15
const MAX_MAIN_LEN = 45

function nameAgent(info) {
  if (info == null) return 'n/a'
  const { app, tags, pid } = info
  if (app !== 'untitled application') {
    return `${app} [${pid}]`
  }
  if (tags.length > 0) {
    return `${tags.join(':')} [${pid}]`
  }
  return `[${pid}]`
}

function getMain(main) {
  if (main.length <= MAX_MAIN_LEN) return main
  return `... ${main.slice(-(MAX_MAIN_LEN - 4))}`
}

function getId(id) {
  const s = `${id}`
  if (s.length <= MAX_ID_LEN) return s
  return `${s.slice(0, MAX_ID_LEN)}...`
}

function processAgentInfo(id, info) {
  const { nodeEnv, processStart, main } = info
  return {
      id: getId(id)
    , name: nameAgent(info)
    , nodeEnv
    , processStart: ta.ago(processStart)
    , main: getMain(main)
  }
}

function processAgentMetrics(metrics) {
  const {
      heapUsed
    , activeRequests
    , activeHandles
    , cpu
  } = metrics

  return {
      heapUsed: prettyBytes(heapUsed)
    , activeRequests
    , activeHandles
    , cpu: Math.round(cpu)
  }
}

class App {
  constructor() {
    // maintaining map for quick access of all agents and array for agents
    // that should be visisble in the UI
    this._data = { agentsMap: new Map(), agents: [] }
  }

  addInfo(id, info) {
    if (info == null) return
    const agent = this._getOrCreate(id)
    const wasShown = !!agent.show
    agent.id = id
    agent.show = agent.metrics != null
    agent.info = Object.assign(agent.info || {}, processAgentInfo(id, info))
    this._maybeAddToVisibles(wasShown, agent)
  }

  addMetrics(id, metrics) {
    if (metrics == null) return
    const agent = this._getOrCreate(id)
    const wasShown = !!agent.show
    agent.metrics = Object.assign(agent.metrics || {}, processAgentMetrics(metrics))
    agent.show = agent.info != null
    this._maybeAddToVisibles(wasShown, agent)
  }

  removeAgent(id) {
    this._data.agentsMap.delete(id)
    const idx = this._data.agents.findIndex(x => x.id === id)
    if (idx >= 0) this._data.agents.splice(idx, 1)
  }

  log(...args) {
    console.log(...args)
  }

  _getOrCreate(id) {
    const { agentsMap } = this._data
    if (!agentsMap.has(id)) {
      agentsMap.set(id, { info: null, metrics: null, shown: false })
    }
    return agentsMap.get(id)
  }

  _maybeAddToVisibles(wasShown, agent) {
    if (wasShown || !agent.show) return
    this._data.agents.push(agent)
  }

  data() {
    return this._data
  }
}

export const app = new App()
export const methods = {
  log: app.log.bind(app)
}
export const data = app.data.bind(app)

// Test

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
