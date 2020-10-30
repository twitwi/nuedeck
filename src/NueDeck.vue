<template>
  <div class="nuedeck" ref="nuedeck" v-hammer:swipe="handleSwipe">
    <div :class="cssModes" style="display:none"></div>
    <div :class="modes" ref="fit">
      <div
        v-for="[s, i] in slidesToRender"
        :key="'S' + i"
        @click="slideClicked(i)"
        :class="slideClasses(s, i, currentSlide)"
        :style="{ display: Math.abs(currentSlide - i) <= 2 ? undefined : 'none' }"
      >
        <component :key="'SC' + i" :is="slideComponentIs[i]"></component>
        <component v-for="(a, ai) in addins" :key="'S' + i + 'A' + ai" :is="addinComponentIs[i][ai]"></component>
      </div>
      <div v-for="(a, ai) in addons" :key="'A' + ai" class="addon">
        <component :is="addonComponentIs[ai]"></component>
      </div>
    </div>
  </div>
</template>

<script>
// TODO make sure we can run offline etc
import keymage from 'keymage'
import { hasOwnProperty, consoleLog } from './plugins/tools.js'

let tools = {
  L() {
    consoleLog(...['LOG:', ...arguments])
  },
  forAll(sel, f, base = document) {
    base.querySelectorAll(sel).forEach(f)
  },
  async asyncForAll(sel, f, base = document) {
    for (let e of base.querySelectorAll(sel)) {
      await f(e)
    }
  },
}

export let defaultMixin = {
  data() {
    return {
      opts: {
        keys: {
          previousStep: ['left', 'pgup'],
          nextStep: ['right', 'space', 'pgdown'],
          previousSlide: ['up'],
          nextSlide: ['down'],
          previousEndOfSlide: ['a'],
          nextEndOfSlide: ['z'],
          popupJumpToSlide: ['g'],
          toggleSlideSorter: ['m'],
          toggleComments: ['v'],
          toggleHelpArea: ['h'],
          toggleAnnotator: ['w'],
        },
        core: {
          classes: {
            slide: 'slide',
            currentSlide: 'current-slide',
          },
          selectors: {
            container: '#nd-container',
            sources: '.nd-source',
            addins: '.nd-addin',
            addons: '.nd-addon',
            svg: 'img[src$=".svg"]:not(.no-inject)',
          },
          designWidth: 800, // px
          designHeight: 600, // px
          fitMode: 'center middle',
          fitMargin: [0, 0, 0, 0],
          fitDebounce: 200,

          localStorageLogsKey: 'nuedeck-logs',

          clearHashOnLoad: false /* may be used for development to avoid jumping back to the same slide on reload */,
          disableSetHash: false /* may be used for development to systematically jump back to the same slide on reload */,
          disableSetHashForSteps: false,
          use0BasedIndexInSetHashForSlide: false,
          // eslint-disable-next-line
          metadataSeparator: /(&nbsp;| )/gi /* we need to handle '&nbsp;' and ' ' because in the title, ' ' becomes '&nbsp;' */,
        },
        skipPlugins: ['Dummy'], // names of plugins to disable
      },
    }
  },
}

function registerKeybindings(vm) {
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

function maybe(obj, possibleAttributeFunction) {
  if (obj[possibleAttributeFunction] === undefined) return () => {}
  return obj[possibleAttributeFunction]
}

let vmopts = {
  name: 'nuedeck',
  mixins: [defaultMixin],
  props: {
    plugins: { type: Array, default: () => [] },
  },
  provide: function() {
    return { nd: this, $o: this.userDataDollarO, $f: this.NR.functionsDollarF }
  },
  data() {
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
      logs: [],
      currentSlide: 0,
      currentStep: 0,
      cssModes: {},
      modes: { fit: true },
      vars: {},
      userDataDollarO: {},
      // for extensions, for now...
      ext: {
        annotate: {},
      },
    }
  },
  watch: {
    slides() {
      this.L('WATCH: slides')
    },
  },
  beforeCreate() {
    // non-reactive properties
    this.NR = {}
    this.NR.functionsDollarF = {}
    this.NR.slideContentRoots = {}
    this.NR.listenersToRemove = []
  },
  created() {
    this.L(
      'PLUGINS',
      this.plugins.map(p => p.name),
      this.enabledPlugins.map(p => p.name)
    )

    let registerAction = this.$on.bind(this)
    let setDefaultOption = () => {} // (path, value) => {} // TODO: actual things for e.g. core.designWidth ... but actually we have access to "this" so the thing that may matter is "setDefaultOption"... but it is nice to have helpers/guides for the init thing
    this.callAllPlugins('init', { functions: this.NR.functionsDollarF, registerAction, setDefaultOption })
  },
  computed: {
    // TODO: check that it is actually useful in terms of perf to select the default
    slidesToRender() {
      if (this.hasMode('sorter')) {
        return this.slides.map((s, i) => [s, i])
      }
      let start, end
      start = Math.max(0, this.currentSlide - 1)
      end = Math.min(this.currentSlide + 2, this.slides.length)
      //start = 0 ; end = this.slides.length
      return this.slides.map((s, i) => [s, i]).slice(start, end)
    },
    slideComponentIs() {
      let that = this
      return this.slides.map((s, i) => ({
        inject: ['nd', '$o', '$f'],
        data: function() {
          return { ID: s.innerID }
        },
        mounted() {
          that.slideContentRoot(i, this.$el)
        },
        template: s.contentTemplate,
      }))
    },
    addinComponentIs() {
      return this.slides.map((s, i) =>
        this.addins.map(a => ({
          inject: ['nd', '$o', '$f'], // for raw addin in nd-addin
          provide: function() {
            return { renderSlide: i, ID: s.innerID }
          },
          template: a.contentTemplate,
        }))
      )
    },
    addonComponentIs() {
      return this.addons.map(a => ({
        inject: ['nd', '$o', '$f'], // for raw addon in nd-addon
        template: a.contentTemplate,
      }))
    },
    slideCount() {
      return this.slides.length
    },
    stepCount() {
      return this.slides[this.currentSlide].steps.length
    },
    enabledPlugins() {
      return this.plugins.filter(p => this.opts.skipPlugins.indexOf(p.name) === -1)
    },
  },
  beforeMount() {
    {
      // Get HTML metadata into variables
      let app = (n, v) => {
        this.vars[n] = v
      }
      app('title', document.querySelector('html>head>title').innerHTML)
      this.forAll('html>head>meta[name]', e => {
        app(e.getAttribute('name'), e.getAttribute('content'))
      })
    }
    this.callAllPlugins('beforeMount') // blocking, so, not to be overused
    registerKeybindings(this)
    this.asyncBeforeMount()
  },
  mounted() {
    window.nuedeck = this
    this.L('MOUNTED')
    this.asyncMounted()
  },
  updated() {
    this.L('UPDATED')
    this.jumpToSlide(this.currentSlide, this.currentStep, { sl: -999 })
  },
  beforeDestroy() {
    this.L('DESTROY')
    this.removeAllListeners()
  },
  methods: {
    hasMode(m) {
      return hasOwnProperty(this.modes, m) && !!this.modes[m]
    },
    toggleMode(m) {
      if (hasOwnProperty(this.modes, m)) {
        this.modes[m] = !this.modes[m]
      } else {
        this.$set(this.modes, m, true)
      }
    },
    hasCssMode(m) {
      return hasOwnProperty(this.cssModes, m) && !!this.cssModes[m]
    },
    toggleCssMode(m) {
      if (hasOwnProperty(this.cssModes, m)) {
        this.cssModes[m] = !this.cssModes[m]
      } else {
        this.$set(this.cssModes, m, true)
      }
    },
    async asyncBeforeMount() {
      let S = this.opts.core.selectors
      {
        // Load slides in different formats
        let allNew = []
        await this.asyncForAll(S.sources, async slide => {
          let res = await this.asyncCallAllPlugins('generateSlides', slide, slide.content, allNew)
          if (res === undefined) {
            // no plugin handled this format
            this.L('WARNING', 'no plugin handled this format', slide)
          }
        })
        allNew.forEach(s => {
          if (s.steps === undefined) s.steps = []
        })
        for (let n of allNew) {
          n.contentElement.setAttribute('data-root', 'true')
        }
        // At this point, slides are in DOM form in contentElement
        await this.asyncCallAllPlugins('enrichSlideDeck', allNew)
        // We force the $o to be reactive again, in case enrichment created non reactive things inside
        for (let k in this.userDataDollarO) {
          let v = this.userDataDollarO[k]
          delete this.userDataDollarO[k]
          this.$set(this.userDataDollarO, k, v)
        }
        this.slides.splice(0, 0, ...allNew.map(s => ({ ...s, contentElement: undefined, contentTemplate: s.contentElement.outerHTML })))
      }
      {
        // Load addons (to be added to the container)
        let allNew = []
        this.forAll(S.addons, slide => {
          let o = Array.from(slide.content.children).map(el => ({
            contentTemplate: el.outerHTML,
          }))
          allNew = [...allNew, ...o]
        })
        this.addons.splice(0, 0, ...allNew)
      }
      {
        // Load addins (to be added to every slide)
        let allNew = []
        this.forAll(S.addins, slide => {
          let o = Array.from(slide.content.children).map(el => ({
            contentTemplate: el.outerHTML,
          }))
          allNew = [...allNew, ...o]
        })
        this.addins.splice(0, 0, ...allNew)
      }
      if (this.opts.core.clearHashOnLoad) {
        window.history.replaceState({}, '', '#')
      }
      {
        // Handle initial hash and the hashchange events
        if (window.location.hash !== '') {
          await this.jumpByHash() // async
        }
        this.addEventListener(window, 'hashchange', e => {
          this.L('HASH CHANGE')
          e.preventDefault()
          this.jumpByHash() // async
        })
      }
    },
    async asyncMounted() {
      await this.optionsOverrideFromCSS()
      await this.asyncCallAllPlugins('mounted')
      await this.jumpToSlide(this.currentSlide, this.currentStep, { sl: -999 })
    },
    ...tools,
    slideContentRoot(i, dom) {
      // TODO: investigate, hard, this seems to be called way too much du to vuejs rerendering a lot...
      // this happens because currentSlide changes => classes for the slides changes => for loop redone... (independant of the use of slidesToRender)
      //this.L('SLIDE CONTENT MOUNTED', i, dom)
      //this.L('SLIDE CONTENT MOUNTED')
      this.NR.slideContentRoots[i] = dom
      if (this.NR.slideContentRootsNotify !== undefined) {
        if (this.NR.slideContentRootsNotifyIndex === i) {
          this.NR.slideContentRootsNotify()
          this.NR.slideContentRootsNotify = undefined
        }
      }
    },
    async ensureSlideIsMounted(sl) {
      if (this.NR.slideContentRoots[sl] !== undefined) {
        return
      }
      return new Promise(resolve => {
        this.NR.slideContentRootsNotify = resolve
        this.NR.slideContentRootsNotifyIndex = sl
        this.currentStep = 0
        this.currentSlide = sl
      })
    },
    parseSteps(iSlide, dom) {
      this.L('PARSE STEPS', iSlide)
      let s = this.slides[iSlide]
      let allNew = []
      let lastStepEl = dom
      this.forAll(
        '.step',
        (el, iStep) => {
          this.callAllPlugins('stepElementToAnimationStep', allNew, { el, iStep, iSlide, dom })
          lastStepEl = el
        },
        dom
      )
      // heuristically, add a step if the last step is not at the very end
      while (lastStepEl !== dom) {
        if (lastStepEl.nextElementSibling !== null) {
          if (lastStepEl.nextElementSibling.matches('.comment')) {
            lastStepEl = lastStepEl.nextElementSibling
            continue
          } else {
            let doit = () => {
              this.forAll('.step, .current-step', el => el.classList.remove('current-step', 'current-step-exact'), dom)
            }
            allNew.push({ doit, fast: doit }) // fast just for safety
            break
          }
        }
        lastStepEl = lastStepEl.parentNode
      }
      if (allNew.length === 0) {
        // add a dummy step if there are none
        allNew.push({})
      } else {
        /*
        if (! allNew[0].isSimple) {
          allNew.splice(0, 0, {})
        }*/
      }
      {
        // Merge
        let i = 0
        while (i < allNew.length) {
          if (allNew[i].mergeNext) {
            if (i + 1 == allNew.length) {
              this.L('ERROR merge TODO better message')
              break
            }
            // actual merge
            let a = allNew[i]
            delete a.mergeNext
            let b = allNew[i + 1]
            let ab = { ...a, ...b }
            for (let [k, dir] of [
              ['init', true],
              ['fast', true],
              ['doit', true],
              ['undo', false],
              ['back', true],
            ]) {
              ab[k] = () => {
                if (dir) {
                  maybe(a, k)()
                  maybe(b, k)()
                } else {
                  maybe(b, k)()
                  maybe(a, k)()
                }
              }
            }
            allNew.splice(i, 2, ab)
          } else {
            i++
          }
        }
      }
      s.steps.splice(0, s.steps.length, ...allNew)
    },
    handleSwipe(event) {
      let d = event.direction
      if (d == 2) {
        this.$emit('nextStep')
      } // left
      if (d == 4) {
        this.$emit('previousStep')
      } // right
      if (d == 8) {
        this.$emit('nextEndOfSlide')
      } // up
      if (d == 16) {
        this.$emit('previousEndOfSlide')
      } // down
    },
    clearLogs() {
      let k = this.opts.core.localStorageLogsKey
      localStorage.removeItem(k)
      this.logs.splice(0, this.logs.length)
    },
    getLogs(sectionFilter = null) {
      let k = this.opts.core.localStorageLogsKey
      let ls = localStorage.getItem(k)
      if (ls == null) {
        ls = []
      } else {
        ls = JSON.parse(ls)
      }
      if (sectionFilter != null) {
        ls = ls.filter(l => l.section == sectionFilter)
      }
      return ls
    },
    addLog(section, data, date = new Date()) {
      let start = Date.now()
      let k = this.opts.core.localStorageLogsKey
      let ls = localStorage.getItem(k)
      if (ls == null) {
        ls = []
      } else {
        ls = JSON.parse(ls)
      }
      let ms = date.getTime()
      let string = date.toISOString()
      ls.unshift({ section, date: { ms, string }, data })
      ls = JSON.stringify(ls)
      localStorage.setItem(k, ls)
      this.logs = JSON.parse(ls) // TODO: might want to optimize by unshifting in logs (at the risk having of unsynced versions)
      let taken = Date.now() - start
      if (taken > 100) {
        this.___overtime = [...this.___overtime, taken]
        if (this.___overtime.length > 4) {
          alert('Warning: logs are getting big? it took ' + this.___overtime.join('/') + ' ms')
          // eslint-disable-next-line no-console
          console.log('Slow due to logs, consider:\nlocalStorage.setItem("' + k + '", "[]")')
        }
      } else {
        this.___overtime = []
      }
    },
    async jumpByHash(strWithHash, step = 0) {
      if (strWithHash === undefined) {
        strWithHash = window.decodeURI(window.location.hash)
      }
      let addToHistory = false
      if (strWithHash.startsWith('#⇒')) {
        addToHistory = true
        strWithHash = '#' + strWithHash.substr(2)
      }
      let jump = async (slide, step) => await this.jumpToSlide(slide, step, {}, addToHistory)
      let id = strWithHash.replace(/.*#/g, '') // not sure, as we never pass an actual strWithHash anyway
      if (id === '') return

      // first consider slide IDs
      for (let i in this.slides) {
        if (this.slides[i].key === id) {
          await jump(i, step)
          return
        }
      }

      // now try another format, like #s:42 or even #s:42.-1 (last step of slide 42)
      // with lower case s, it is 1-based index; with upper case S, it is 0-based index
      let parts = id.split(':')
      let cmd = parts[0]
      if (cmd.toLowerCase() === 's' && parts.length > 1) {
        let subparts = parts[1].split('.')
        let slide = parseInt(subparts[0])
        if (subparts.length > 1) {
          step = parseInt(subparts[1])
        }
        if (cmd === 's' && slide > 0) {
          slide -= 1
        }
        await jump(slide, step)
      } else {
        this.L('Unhandled hash format:', id)
      }
    },
    async jumpToSlide(sl, st, pPrev = {}, addToHistory = false) {
      let makeStepCurrent = () => {
        let el = this.slides[sl].steps[st].el
        if (el === undefined || el === null) return
        let dom = this.NR.slideContentRoots[sl]
        this.forAll('.step, .current-step', clear => clear.classList.remove('current-step', 'current-step-exact'), dom)
        let cur = el
        cur.classList.add('current-step-exact')
        while (cur.parentNode.classList !== undefined && !cur.parentNode.classList.contains('slide')) {
          cur.classList.add('current-step')
          cur = cur.parentNode
        }
      }
      let prev = { sl: this.currentSlide, st: this.currentStep }
      Object.assign(prev, pPrev)
      this.L('JUMP', prev, sl, st)
      if (sl < 0) sl = this.slides.length + sl // handle negative slide index
      if (sl < 0 || sl > this.slides.length - 1) return // out of range

      this.addLog('change-slide', { from: { slide: prev.sl, step: prev.st }, to: { slide: sl, step: st } })
      // if we change slide, ensure it we load and init the anims
      if (prev.sl !== sl) {
        await this.ensureSlideIsMounted(sl)
        if (this.NR.slideContentRoots[sl] !== undefined) {
          // on slide change
          this.parseSteps(sl, this.NR.slideContentRoots[sl])
          this.slides[sl].steps.reverse()
          for (let step of this.slides[sl].steps) {
            maybe(step, 'init')()
          }
          this.slides[sl].steps.reverse()
        }
      }
      if (st < 0) st = this.slides[sl].steps.length + st // handle negative step index
      if (st < 0 || st > this.slides[sl].steps.length - 1) return // out of range
      if (prev.sl === sl) {
        // we stay in the same slide
        if (prev.st === st) {
          // pass
        } else if (prev.st < st) {
          for (let i = prev.st + 1; i < st; i++) {
            maybe(this.slides[sl].steps[i], 'fast')()
          }
          maybe(this.slides[sl].steps[st], 'doit')()
        } else {
          for (let i = prev.st; i > st; i--) {
            maybe(this.slides[sl].steps[i], 'undo')()
          }
          maybe(this.slides[sl].steps[st], 'back')()
        }
        makeStepCurrent(this.slides[sl].steps[st].el)
        this.currentStep = st
      } else {
        // we change slide
        this.slides[sl].steps.slice(0, st).forEach(step => maybe(step, 'fast')())
        maybe(this.slides[sl].steps[st], 'doit')()
        this.currentSlide = sl
        makeStepCurrent(this.slides[sl].steps[st].el)
        this.currentStep = st
      }
      if (!this.opts.core.disableSetHash) {
        let hash
        if (this.opts.core.use0BasedIndexInSetHashForSlide) {
          hash = '#S:' + this.currentSlide
        } else {
          hash = '#s:' + (this.currentSlide + 1)
        }
        if (!this.opts.core.disableSetHashForSteps) {
          if (this.currentStep > 0) {
            hash += '.' + this.currentStep
          }
        }
        if (addToHistory) {
          window.history.pushState({}, '', hash)
        } else {
          window.history.replaceState({}, '', hash)
        }
      }
    },
    slideClasses(s, i, currentSlide) {
      let res = [this.opts.core.classes.slide]
      {
        let n = i - currentSlide
        let suffix = ''
        if (n > 0) {
          suffix = '-p' + n
        } else if (n < 0) {
          suffix = '-m' + -n
        }
        res.push(this.opts.core.classes.currentSlide + suffix)
      }
      if (s.containerClass) {
        res.push(s.containerClass)
      }
      return res
    },
    async slideClicked(i) {
      if (this.hasMode('sorter')) {
        await this.jumpToSlide(i, 0)
        this.toggleMode('sorter')
        this.toggleMode('fit') // somewhat hard-coded default fit... (see other instances of the same comment)
      }
    },
    optionsOverrideFromCSS() {
      // e.g. :root { --nuedeck-core-designWidth: 1200; }
      let st = getComputedStyle(this.$refs.nuedeck)
      let digest = (pre, obj, maxd = 10) => {
        if (maxd <= 0) return
        if (obj === undefined) return
        if (typeof obj === 'string') return
        for (let att of Object.keys(obj)) {
          let k = pre + att
          let v = st.getPropertyValue(k)
          if (v !== '') {
            this.L('CSS variable', k, 'replaces options value', obj[att], 'by', eval(v))
            obj[att] = eval(v)
          } else {
            digest(`${k}-`, obj[att], maxd - 1)
          }
        }
      }
      digest('--nuedeck-', this.opts)
    },
    addEventListener(target, event, listener) {
      target.addEventListener(event, listener)
      this.NR.listenersToRemove.push({ target, event, listener })
    },
    removeAllListeners() {
      for (let { target, event, listener } of this.NR.listenersToRemove) {
        target.removeEventListener(event, listener)
      }
      this.NR.listenersToRemove = []
    },
    callAllPlugins(fname, ...args) {
      for (let p of this.enabledPlugins) {
        let ret = maybe(p, fname).bind(this)(...args)
        if (ret === 'BREAK') return p
      }
      return null
    },
    async asyncCallAllPlugins(fname, ...args) {
      for (let p of this.enabledPlugins) {
        let ret = await maybe(p, fname).bind(this)(...args)
        if (ret === 'BREAK') return p
      }
      return null
    },
  },
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
