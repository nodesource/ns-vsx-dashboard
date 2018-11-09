<template>
  <v-app dark>
    <v-content>
      <v-container>
        <v-list
          expand
          three-line
        >
          <v-list-tile
            v-for="agent in agents"
            :key="agent.id"
            @click="() => onclick(agent.id)"
          >
            <v-list-tile-content>
              <v-list-tile-title>
               🕵 {{ agent.info.name }} ({{ agent.info.id }})
              </v-list-tile-title>
              <v-list-tile-sub-title v-html="agent.info.main"></v-list-tile-sub-title>
              <v-divider></v-divider>
              <v-list-tile-sub-title class="blue--text">
                <p>
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 18 18"><path d="M13 9H9v4h4V9zm2-7h-1V1h-2v1H6V1H4v1H3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 12H4V6h10v8z"/></svg>
                  <span class="ml-1 mr-1" v-html="agent.info.processStart" />
                </p>

                <p style="min-width: 100px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
                  <span style="font-family: Inconsolate Monospace;" class="ml-1 mr-1" v-html="agent.metrics.heapUsed" />
                </p>

                <p style="min-width: 80px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M15 9H9v6h6V9zm-2 4h-2v-2h2v2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2zm-4 6H7V7h10v10z"/></svg>
                  <span class="ml-1 mr-1">{{ agent.metrics.cpu }}%</span>
                </p>

                <p>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M9.01 14H2v2h7.01v3L13 15l-3.99-4v3zm5.98-1v-3H22V8h-7.01V5L11 9l3.99 4z"/></svg>
                  <span class="ml-1 mr-1" v-html="agent.metrics.activeRequests" />
                </p>

                <p>
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>
                  <span class="ml-1 mr-1" v-html="agent.metrics.activeHandles" />
                </p>
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { methods, data } from './App.js'
export default { methods, data }
</script>
