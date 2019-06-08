<template>
  <div class="nuedeck" ref="nuedeck">
   <div class="fit" ref="fit">
    <div v-for="[s,i] in slidesToRender"
         :key="'S'+i"
         :class="slideClasses(s, i, currentSlide)"
         :style="{ display: Math.abs(currentSlide-i)<=2 ? undefined : 'none'}">
      <!-- TODO find a way to alias $parent (at least, and test perf of the current solution) -->
      <!-- another solution props: {state: {default:$data}} -->
      <component :is="{
        mounted () {
          slideContentRoot(i, this.$el)
        },
        data: ((d) => () => d)($data), // pass a copy of data (test for performance)
        template: s.contentTemplate }"></component>
      <component v-for="(a,ai) in addins"
      :key="'S'+i+'A'+ai"
      :is="{
        data: ((d) => () => ({ ...d, renderSlide: i }))($data), // pass a copy of data (test for performance)
        template: a.contentTemplate }"></component>
    </div>
    <component v-for="(a,ai) in addons"
    :key="'A'+ai"
    :is="{
        data: ((d) => () => ({ ...d}))($data), // pass a copy of data (test for performance)
        template: a.contentTemplate }"></component>
   </div>
  </div>
</template>

<script>

// TODO make sure we can run offline etc
import keymage from 'keymage'

let tools = {
  L () {
    console.log(...['LOG:', ...arguments])
  },
  forAll (sel, f, base=document) {
    base.querySelectorAll(sel).forEach(f)
  },
  async asyncForAll (sel, f, base=document) {
    for (let e of base.querySelectorAll(sel)) {
      await f(e)
    }
  }
}

export let defaultMixin = {
  data () {
    return {
      opts: {
        keys: {
          previousStep: ['backspace', 'left', 'pgdown'],
          nextStep: ['enter', 'space', 'right', 'pgup'],
          previousSlide: ['up'],
          nextSlide: ['down'],
          previousEndOfSlide: ['a'],
          nextEndOfSlide: ['z'],
        },
        core: {
          classes : {
            slide: 'slide',
            currentSlide: 'current-slide'
          },
          selectors: {
            container: '#nd-container',
            sources: '.nd-source',
            addins: '.nd-addin',
            addons: '.nd-addon',
            svg: 'img[src$=".svg"]:not(.no-inject)'
          },
          designWidth: 800, // px
          designHeight: 600, // px
          fitMode: "center middle",
          fitMargin: [0, 0, 0, 0],
          fitDebounce: 200,

          // eslint-disable-next-line
          metadataSeparator: /(&nbsp;| )/gi,   /* we need to handle '&nbsp;' and ' ' because in the title, ' ' becomes '&nbsp;' */
        },
        skipPlugins: ['Dummy'], // names of plugins to disable
      }
    }
  }
}

function registerKeybindings (vm) {
  if (vm.keyBindingsUnregistering !== undefined) {
    vm.keyBindingsUnregistering.forEach(f => f())
    vm.keyBindingsUnregistering = []
  }
  let keys = vm.opts.keys
  for (let k in keys) {
    // TODO: consider nested objects in keys (for plugins)
    keys[k].forEach(s => keymage(s, ev => vm.$emit(k, ev)))
  }
}

function maybe (obj, possibleAttributeFunction) {
  if (obj[possibleAttributeFunction] === undefined) return () => {}
  return obj[possibleAttributeFunction]
}

let vmopts = {
  name: 'nuedeck',
  mixins: [defaultMixin],
  props: {
    plugins: { type: Array, default: () => [] },
  },
  data () {
    return {
      opts: {}, // as a reminder that it is in the mixin
      slides: [],
      addins: [],
      addons: [],
      keyBindings: [],
      keyDocs: {
        // have a helper to register that
        // nameOfTheEvent: { short: "...", long: "......."}
      },
      // an optionDocs?
      currentSlide: 3,
      currentStep: 0,
      vars: {},
    }
  },
  watch: {
    slides () {
      this.L('WATCH: slides')
    }
  },
  created () {
    this.L('PLUGINS', this.plugins.map(p => p.name), this.enabledPlugins.map(p => p.name))

    // non-reactive properties
    this.slideContentRoots = {}
    let registerAction = this.$on.bind(this)
    let setDefaultOption = ()=>{} // (path, value) => {} // TODO: actual things for e.g. core.designWidth ... but actually we have access to "this" so the thing that may matter is "setDefaultOption"... but it is nice to have helpers/guides for the init thing
    this.callAllPlugins('init', {registerAction, setDefaultOption})

  },
  computed: {
    // TODO: check that it is actually useful in terms of perf to select the default
    slidesToRender () {
      let start = 0 //Math.max(0, this.currentSlide - 1)
      let end = this.slides.length //Math.min(this.currentSlide + 2, this.slides.length)
      return this.slides.map((s,i) => [s, i]).slice(start, end)
    },
    slideCount () {
      return this.slides.length
    },
    stepCount () {
      return this.slides[this.currentSlide].steps.length
    },
    enabledPlugins () {
      return this.plugins.filter(p => this.opts.skipPlugins.indexOf(p.name) === -1)
    }
  },
  beforeMount () {
    { // Get HTML metadata into variables
      let app = (n, v) => {
        this.vars[n] = v
      }
      app('title', document.querySelector('html>head>title').innerHTML)
      this.forAll('html>head>meta[name]', (e) => {
        app(e.getAttribute('name'), e.getAttribute('content'))
      })
    }
    this.callAllPlugins('beforeMount') // blocking, so, not to be overused
    registerKeybindings(this)
    this.asyncBeforeMount()
  },
  mounted () {
    window.vm = this
    this.L('MOUNTED')
    this.asyncMounted()
  },
  updated () {
    this.L('UPDATED')
    this.jumpToSlide(this.currentSlide, this.currentStep, {sl:-999})
  },
  methods: {
    async asyncBeforeMount () {
      let S = this.opts.core.selectors
      { // Load slides in different formats
        let allNew = []
        await this.asyncForAll(S.sources, async (slide) => {
          let res = await this.asyncCallAllPlugins('generateSlides', slide, slide.content, allNew)
          if (res === undefined) {
            // no plugin handled this format
            this.L('WARNING', 'no plugin handled this format', slide)
          }
        })
        allNew.forEach(s => {
          if (s.steps === undefined) s.steps = []
        })
        // At this point, slides are in DOM form in contentElement
        await this.asyncCallAllPlugins('enrichSlideDeck', allNew)
        this.slides.splice(0, 0, ...allNew.map( s => ({...s, contentElement: undefined, contentTemplate: s.contentElement.outerHTML}) ))
      }
      { // Load addons (to be added to the container)
        let allNew = []
        this.forAll(S.addons, (slide) => {
          let o = Array.from(slide.content.children).map( el => ({
            contentTemplate: el.outerHTML
          }))
          allNew = [...allNew, ...o]
        })
        this.addons.splice(0, 0, ...allNew)
      }
      { // Load addins (to be added to every slide)
        let allNew = []
        this.forAll(S.addins, (slide) => {
          let o = Array.from(slide.content.children).map( el => ({
            contentTemplate: el.outerHTML
          }))
          allNew = [...allNew, ...o]
        })
        this.addins.splice(0, 0, ...allNew)
      }
    },
    async asyncMounted () {
      await this.optionsOverrideFromCSS()
      await this.asyncCallAllPlugins('mounted')
      await this.jumpToSlide(this.currentSlide, this.currentStep, {sl:-999})
    },
    ...tools,
    slideContentRoot (i, dom) {
      // TODO: investigate, hard, this seems to be called way too much du to vuejs rerendering a lot...
      // this happens because currentSlide changes => classes for the slides changes => for loop redone... (independant of the use of slidesToRender)
      //this.L('SLIDE CONTENT MOUNTED', i, dom)
      this.L('SLIDE CONTENT MOUNTED')
      this.slideContentRoots[i] = dom
    },
    parseSteps (i, dom) {
      this.L('PARSE STEPS', i)
      let s = this.slides[i]
      let allNew = []
      this.forAll('.step', (el,elind) => {
        allNew.push(() => {
          this.L('step', elind, 'of slide', i)
          this.forAll('.step, .current-step', clear => clear.classList.remove('current-step', 'current-step-exact'), dom)
          let cur = el
          this.L('cur', cur)
          cur.classList.add('current-step-exact')
          while (! cur.parentNode.classList.contains('slide')) {
            cur.classList.add('current-step')
            cur = cur.parentNode
            this.L('cur changed to parent', cur)
          }
        })
      }, dom)
      allNew.push(() => {
        this.forAll('.step, .current-step', el => el.classList.remove('current-step', 'current-step-exact'), dom)
      })
      s.steps.splice(0, s.steps.length, ...allNew)
    },
    jumpToSlide (sl, st, pPrev={}) {
      let prev = {sl: this.currentSlide, st: this.currentStep}
      Object.assign(prev, pPrev)
      this.L(prev, sl, st)
      if (sl < 0) sl = this.slides.length + sl // handle negative slide index
      if (sl < 0 || sl > this.slides.length - 1) return // out of range
      if (prev.sl !== sl) {
        if (this.slideContentRoots[sl] !== undefined) {
          this.parseSteps(sl, this.slideContentRoots[sl])
        }
      }
      if (st < 0) st = this.slides[sl].steps.length + st // handle negative step index
      if (prev.sl === sl) {
        // we stay in the same slide
        if (prev.st < st) {
          for (let i = prev.st+1; i <= st; i++) {
            // TODO will need to .skip and .doit
            this.slides[sl].steps[i]()
          }
        } else {
          for (let i = prev.st-1; i >= st; i--) {
            // TODO will need to .skip and .doit
            this.slides[sl].steps[i]()
          }
        }
        this.currentStep = st
      } else {
        // we change slide
        this.slides[sl].steps.slice(0, st+1).forEach(f => f())
        this.currentSlide = sl
        this.currentStep = st
      }
    },
    slideClasses (s, i, currentSlide) {
      let res = [this.opts.core.classes.slide]
      {
        let n = i - currentSlide
        let suffix = ""
        if (n > 0) {
          suffix = '-p' + n
        } else if (n < 0) {
          suffix = '-m' + (-n)
        }
        res.push(this.opts.core.classes.currentSlide + suffix)
      }
      if (s.containerClass) {
        res.push(s.containerClass)
      }
      return res
    },
    optionsOverrideFromCSS () {
      let st = getComputedStyle(this.$refs.nuedeck)
      let digest = (pre, obj, maxd=10) => {
        if (maxd <= 0) return
        if (obj === undefined) return
        if (typeof obj === 'string') return
        for (let att of Object.keys(obj)) {
          let k = pre+att
          let v = st.getPropertyValue(k)
          if (v !== '') {
            this.L('CSS variable', k, 'replaces options value', obj[att], 'by', eval(v))
            obj[att] = eval(v)
          } else {
            digest(`${k}-`, obj[att], maxd-1)
          }
        }
      }
      digest('--nuedeck-', this.opts)
    },
    callAllPlugins (fname, ...args) {
      this.L(args)
      for (let p of this.enabledPlugins) {
        let ret = maybe(p, fname).bind(this)(...args)
        if (ret === 'BREAK') return p
      }
      return null
    },
    async asyncCallAllPlugins (fname, ...args) {
      this.L(args)
      for (let p of this.enabledPlugins) {
        let ret = await maybe(p, fname).bind(this)(...args)
        if (ret === 'BREAK') return p
      }
      return null
    },
    // TODO: maybe separate what is meant to be used like these?
    br (v, sep=undefined) {
      if (sep === undefined) {
        sep = this.opts.core.metadataSeparator
      }
      return v.replace(sep, "<br/>")
    }
  }
}

export default vmopts


</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
