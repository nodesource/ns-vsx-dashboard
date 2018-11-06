<template>
  <v-app dark>
    <v-content>
      <v-container>
        <v-list>
          <v-list-tile
            v-for="agent in agents"
            :key="agent.title"
            avatar
            @click="() => log('clicked')"
          >
            <v-list-tile-content>
              <v-list-tile-title>
               🕵 {{ agent.name }} ({{ agent.id }})
              </v-list-tile-title>
              <v-list-tile-sub-title v-html="agent.main"></v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>

import agentsJSON from '../agents.json'
const agents = new Map(agentsJSON)
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

function agentsArray(agents) {
  const arr = []
  for (const [ id, agent ] of agents) {
    const info = agent.info
    // Don't show agents for which we still are missing info
    if (info == null) continue
    const { nodeEnv, processStart, main } = info
    const x = {
        id: id.slice(0, 8)
      , name: nameAgent(agent.info)
      , nodeEnv
      , processStart
      , main: getMain(main)
    }
    arr.push(x)
  }
  return arr
}

  export default {
    data() {
      return {
        agents: agentsArray(agents)
      }
    },
    methods: {
      log (...args) { console.log(...args) }
    }
  }
</script>
