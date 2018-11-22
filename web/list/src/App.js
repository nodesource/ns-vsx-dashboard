const DIAGNOSE = true

class App {
  constructor() {
    // maintaining map for quick access of all agents and array for agents
    // that should be visisble in the UI
    this._data = { agentsMap: new Map(), agents: [] }
    this._onselected = null
    this._onheapProfileRequested = null
    this._oncpuProfileRequested = null
  }

  addInfo(id, info) {
    if (info == null) return
    const agent = this._getOrCreate(id)
    const wasShown = !!agent.show
    agent.id = id
    agent.show = agent.metrics != null
    agent.info = Object.assign(agent.info || {}, info)
    this._maybeAddToVisibles(wasShown, agent)
  }

  addMetrics(id, metrics) {
    if (metrics == null) return
    const agent = this._getOrCreate(id)
    const wasShown = !!agent.show
    agent.metrics = Object.assign(agent.metrics || {}, metrics)
    agent.show = agent.info != null
    this._maybeAddToVisibles(wasShown, agent)
  }

  removeAgent(id) {
    this._data.agentsMap.delete(id)
    const idx = this._data.agents.findIndex(x => x.id === id)
    if (idx >= 0) this._data.agents.splice(idx, 1)
  }

  log(s, ...rest) {
    if (!DIAGNOSE) return
    console.log(s, ...rest)
  }

  set onselected(value) {
    this._onselected = value
  }

  set onheapProfileRequested(value) {
    this._onheapProfileRequested = value
  }

  set oncpuProfileRequested(value) {
    this._oncpuProfileRequested = value
  }

  onclick(id) {
    if (typeof this._onselected === 'function') {
      this._onselected(id)
    } else {
      console.log('No agent list selected handler registered')
    }
  }

  onheapClick(e, id) {
    e.stopPropagation()
    if (typeof this._onheapProfileRequested === 'function') {
      this._onheapProfileRequested(id)
    } else {
      console.log('No agent list heap profile requested handler registered')
    }
  }

  oncpuClick(e, id) {
    e.stopPropagation()
    if (typeof this._oncpuProfileRequested === 'function') {
      this._oncpuProfileRequested(id)
    } else {
      console.log('No agent list cpu profile requested handler registered')
    }
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

//
// Exports used by App.vue
//
export const app = new App()
export const methods = {
    log         : app.log.bind(app)
  , onclick     : app.onclick.bind(app)
  , onheapClick : app.onheapClick.bind(app)
  , oncpuClick  : app.oncpuClick.bind(app)
}
export const data = app.data.bind(app)

//
// Initialization
//
function handleVscodeMessage(msg) {
  const { command } = msg
  switch (command) {
    case 'add-info': {
      app.addInfo(msg.id, msg.info)
      break
    }
    case 'add-metrics': {
      app.addMetrics(msg.id, msg.metrics)
      break
    }
    case 'remove-agent': {
      app.removeAgent(msg.id)
      break
    }
  }
}

function connectVscode() {
  /* global acquireVsCodeApi */
  // @ts-ignore
  const vscode = acquireVsCodeApi()
  const { postMessage } = vscode

  function logMessage(msg) {
    const { data } = msg
    app.log(`${data.command} for ${data.id}`)
  }

  app.onselected = id => postMessage({ event: 'agent-selected', id })
  app.oncpuProfileRequested = id => postMessage({ event: 'cpu-profile-requested', id })
  app.onheapProfileRequested = id => postMessage({ event: 'heap-profile-requested', id })

  window.addEventListener('message', msg => {
    logMessage(msg)
    handleVscodeMessage(msg.data)
  })

  vscode.postMessage({ event: 'ready' })
}

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
function runInBrowserTests() {
  // @ts-ignore
  const agents = new Map([
    [ 'agent-uno-id', {
      info: {
          id: 'agent-uno-id'
        , name: 'agent-uno'
        , processStart: 'yesterday'
        , main: `../some/path/to/test-agent.js`
      }
    }]
  ])

  function init() {
    for (const [ id, agent ] of agents) {
      app.addInfo(id, agent.info)
    }
  }

  function simulateMetrics() {
    const metrics = {
        heapUsed: 1E2
      , cpu: 22
      , activeRequests: 2
      , activeHandles: 9
    }
    for (const id of agents.keys()) {
      app.addMetrics(id, metrics)
    }
  }

  init()
  simulateMetrics()
}
