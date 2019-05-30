import Vue from 'vue'
import NueDeck from './NueDeck.vue'

Vue.config.productionTip = false

// consider https://vuejs.org/v2/guide/components-registration.html (require.context etc)
import HelloWorld from './components/HelloWorld.vue'
Vue.component('HelloWorld', HelloWorld)



new Vue({
  render: h => h(NueDeck),
}).$mount('#nd-container')
