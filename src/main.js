import Vue from 'vue'
import NueDeck from './NueDeck.vue'

Vue.config.productionTip = false

// consider https://vuejs.org/v2/guide/components-registration.html (require.context etc)
import HelloWorld from './components/HelloWorld.vue'
Vue.component('HelloWorld', HelloWorld)

import StatusBar from './components/StatusBar.vue'
Vue.component('StatusBar', StatusBar)

import LocalStyle from './components/LocalStyle.vue'
Vue.component('LocalStyle', LocalStyle)


let plugins = []

plugins.push({name: 'Toto'})

import DummyPlugin from './plugins/dummy.js'
plugins.push(new DummyPlugin())
import NavigationPlugin from './plugins/navigation.js'
plugins.push(new NavigationPlugin())
import MarkdownPlugin from './plugins/markdown.js'
plugins.push(new MarkdownPlugin())
import ExtraMarkdownPlugin from './plugins/markdown-extra.js'
plugins.push(new ExtraMarkdownPlugin())
import AutofitPlugin from './plugins/autofit.js'
plugins.push(new AutofitPlugin())
import SVGPlugin from './plugins/svg.js'
plugins.push(new SVGPlugin())

let props = {
  plugins
}

new Vue({
  render: h => h(NueDeck, {props}),
}).$mount('#nd-container')
