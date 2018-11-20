<template>
  <v-app dark>
    <v-card
      v-bind:style="{ width: chartWidth + 'px', position: 'fixed', zIndex: 5 }">
      <v-title primary-title>
        <div class='ml-2 mr-2 mt-1'>
          {{ alive ? '🕵' : '💀' }} {{ info.name }} ({{ info.id }})
        </div>
        <div class='ml-2 mr-2 mb-1' v-html="info.main" />
      </v-title>
    </v-card>
    <div class="mt-5">
      <v-expansion-panel
        v-bind:style="{ width: chartWidth + 'px' }"
        v-for="graph in graphs"
        :key="graph.chart.uuid"
        >
        <v-expansion-panel-content>
          <div d-flex slot="header" width="100%">
            <p>{{ graph.header }}</p>
            <p class="text-xs-right blue--text" style="margin: -40px 5px 0 0;">
              {{ graph.chart.summary }}
            </p>
          </div>
          <reactive-chart :chart="graph.chart"></reactive-chart>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </div>
  </v-app>
</template>

<script>
import { methods, data } from './App.js'
export default { methods, data }
</script>
