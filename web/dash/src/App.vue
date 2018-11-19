<template>
  <v-app dark>
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
  </v-app>
</template>

<script>
import { methods, data } from './App.js'
export default { methods, data }
</script>
