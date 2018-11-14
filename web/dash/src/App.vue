<template>
  <v-app dark>
    <v-expansion-panel
      v-bind:style="{ width: chartWidth + 'px' }"
      v-for="graph in graphs"
      :key="graph.chart.uuid"
      >
      <v-expansion-panel-content>
        <div slot="header" v-html="graph.header" />
        <reactive-chart :chart="graph.chart"></reactive-chart>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-app>
</template>

<script>
import { methods, data } from './App.js'
export default { methods, data }
</script>
