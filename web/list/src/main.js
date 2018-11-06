'use strict'

import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'

Vue.use(Vuetify)

function initApp() {
  return new Vue({
    el: '#app',
    render: h => h(App)
  })
}
initApp()
