import agentsJSON from '../agents.json'
import ta from 'time-ago'
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

function agentsArray(agents) {
  const arr = []
  for (const [ id, agent ] of agents) {
    const info = agent.info
    // Don't show agents for which we still are missing info
    if (info == null) continue
    const { nodeEnv, processStart, main } = info
    const x = {
        id: getId(id)
      , name: nameAgent(agent.info)
      , nodeEnv
      , processStart: ta.ago(processStart)
      , main: getMain(main)
       // TODO: get the below from metrics
      , heapUsage: 100
      , cpuUsage: 45
      , activeRequests: 27
      , activeHandles: 68
    }
    arr.push(x)
  }
  return arr
}

class App {
  constructor(data = {}) {
    this._data = data
    setInterval(() => {
      this._data.agents[0].heapUsage++
    }, 200)
    setTimeout(() => this._data.agents.pop(), 2000)
  }

  log(...args) {
    console.log(...args)
  }

  data() {
    return this._data
  }
}

const agentsArr = agentsArray(agents)

const initialData = { agents: agentsArr }
const app = new App(initialData)

export const methods = {
  log: app.log.bind(app)
}

export const data = app.data.bind(app)
