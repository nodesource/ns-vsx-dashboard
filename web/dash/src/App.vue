<template>
  <v-app dark>
    <v-content>
      <v-container>
        <reactive-chart :chart="memoryChart"></reactive-chart>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { methods, data } from './App.js'
export default { methods, data }
</script>
