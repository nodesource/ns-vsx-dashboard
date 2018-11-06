'use strict'
// TODO: use real data
const agents = new Map(require('./agents.json'))
const Vue = require('vue/dist/vue.js')
const { dirname } = require('path')

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

function agentsArray(agents) {
  const arr = []
  for (const [ id, agent ] of agents) {
    const info = agent.info
    // Don't show agents for which we still are missing info
    if (info == null) continue
    const { nodeEnv, processStart, main} = info
    const x = {
        id: id.slice(0, 8)
      , name: nameAgent(agent.info)
      , nodeEnv
      , processStart
      , main
    }
    arr.push(x)
  }
  return arr
}

const app = new Vue({
  el: '#app',
  data: { agents: agentsArray(agents) }
})
