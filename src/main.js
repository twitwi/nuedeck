import Vue from 'vue'
import NueDeck from './NueDeck.vue'

Vue.config.productionTip = false

import { VueHammer } from 'vue2-hammer'
Vue.use(VueHammer)

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
import CoreFunctionsPlugin from './plugins/core-functions.js'
plugins.push(new CoreFunctionsPlugin())
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

new Vue({
  render: h => h(NueDeck, {props}),
}).$mount('#nd-container')
