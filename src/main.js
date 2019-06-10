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
import AutofitPlugin from './plugins/autofit.js'
plugins.push(new AutofitPlugin())

import AnimationStepPlugin from './plugins/step-animation.js'
plugins.push(new AnimationStepPlugin())
import SimpleStepPlugin from './plugins/step-simple.js'
plugins.push(new SimpleStepPlugin())

import MarkdownPlugin from './plugins/markdown.js'
plugins.push(new MarkdownPlugin())
import ExtraMarkdownPlugin from './plugins/markdown-extra.js'
plugins.push(new ExtraMarkdownPlugin())
import MathMarkdownPlugin from './plugins/markdown-math.js'
plugins.push(new MathMarkdownPlugin())
import SuffixesMarkdownPlugin from './plugins/markdown-suffixes.js'
plugins.push(new SuffixesMarkdownPlugin())

import SVGPlugin from './plugins/enrich-svg.js'
plugins.push(new SVGPlugin())
import KatexPlugin from './plugins/enrich-katex.js'
import 'katex/dist/katex.css'
plugins.push(new KatexPlugin())
import CopySlidePlugin from './plugins/enrich-copy-slide.js'
plugins.push(new CopySlidePlugin())


let props = {
  plugins
}

new Vue({
  render: h => h(NueDeck, {props}),
}).$mount('#nd-container')
