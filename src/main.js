import Vue from 'vue'
import NueDeck from './NueDeck.vue'

Vue.config.productionTip = false

import { VueHammer } from 'vue2-hammer'

// consider https://vuejs.org/v2/guide/components-registration.html (require.context etc)
import HelloWorld from './components/HelloWorld.vue'
Vue.component('HelloWorld', HelloWorld)

import StatusBar from './components/StatusBar.vue'
Vue.component('StatusBar', StatusBar)

import LocalStyle from './components/LocalStyle.vue'
Vue.component('LocalStyle', LocalStyle)

import Katex from './components/Katex.vue'
Vue.component('Katex', Katex)

let plugins = []

plugins.push({name: 'Toto'})

import DummyPlugin from './plugins/dummy.js'
plugins.push(new DummyPlugin())

// Main plugins
import CoreFunctionsPlugin from './plugins/core-functions.js'
plugins.push(new CoreFunctionsPlugin())
import NavigationPlugin from './plugins/navigation.js'
plugins.push(new NavigationPlugin())
import GlobalStatesPlugin from './plugins/global-states.js'
plugins.push(new GlobalStatesPlugin())
import AutofitPlugin from './plugins/autofit.js'
plugins.push(new AutofitPlugin())

// Animation/Stepping related plugins
import AnimationStepPlugin from './plugins/step-animation.js'
plugins.push(new AnimationStepPlugin())
import SimpleStepPlugin from './plugins/step-simple.js'
plugins.push(new SimpleStepPlugin())

// Extensions of the custom Markdown format 
import MarkdownPlugin from './plugins/markdown.js'
plugins.push(new MarkdownPlugin())
import StickyMarkdownPlugin from './plugins/markdown-sticky.js'
plugins.push(new StickyMarkdownPlugin())
import EvalMarkdownPlugin from './plugins/markdown-eval.js'
plugins.push(new EvalMarkdownPlugin())
// ^ header only
import ExtraMarkdownPlugin from './plugins/markdown-extra.js'
plugins.push(new ExtraMarkdownPlugin())
import AtAnimMarkdownPlugin from './plugins/markdown-atanim.js'
plugins.push(new AtAnimMarkdownPlugin())
import MathMarkdownPlugin from './plugins/markdown-math.js'
plugins.push(new MathMarkdownPlugin())
import SuffixesMarkdownPlugin from './plugins/markdown-suffixes.js'
plugins.push(new SuffixesMarkdownPlugin())

// Post markdown enrichment plugins
import AddSlideKeyPlugin from './plugins/enrich-add-slide-keys.js'
plugins.push(new AddSlideKeyPlugin())
import SVGPlugin from './plugins/enrich-svg.js'
plugins.push(new SVGPlugin())
import KatexPlugin from './plugins/enrich-katex.js'
import 'katex/dist/katex.css'
plugins.push(new KatexPlugin())
import LiByLiPlugin from './plugins/enrich-libyli.js'
plugins.push(new LiByLiPlugin())
import CopySlidePlugin from './plugins/enrich-copy-slide.js'
plugins.push(new CopySlidePlugin())
import InjectPlugin from './plugins/enrich-inject.js'
plugins.push(new InjectPlugin()) // after copy


let props = {
  plugins
}

let decideWhetherToHandleTouch = function() {
  let isTouchDevice = function() {
    return (('ontouchstart' in window)
    || (navigator.MaxTouchPoints > 0)
    || (navigator.msMaxTouchPoints > 0))
  }
  let hashHas = tag => window && -1 != window.location.hash.indexOf('['+tag+']')
  
  if (hashHas('mobile') || isTouchDevice() && !hashHas('no-mobile')) {
    Vue.use(VueHammer)
  }
}
decideWhetherToHandleTouch()

// User callback for extensibility (adding new components, new plugins etc)
if (window && window.nuedeckAddPlugins) {
  window.nuedeckAddPlugins(Vue, plugins)
}

new Vue({
  render: h => h(NueDeck, {props}),
}).$mount('#nd-container')

